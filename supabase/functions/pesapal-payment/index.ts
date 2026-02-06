import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("No authorization header");

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
        if (userError || !user) throw new Error("Invalid user token");

        const body = await req.json();
        const clientAmount = body.amount || body.totalAmount;
        const tourId = body.tourId || body.destinationId;
        const tourTitle = body.tourTitle || body.destinationTitle;
        const customerName = body.customerName;
        const customerEmail = body.customerEmail;
        const customerPhone = body.customerPhone;
        const participants = body.participants || 1;
        const startDate = body.startDate;
        const specialRequests = body.specialRequests;
        const residency = body.residency_type || body.residency || 'citizen';

        if (!clientAmount || !tourId) {
            throw new Error(`Missing required fields: amount=${clientAmount}, tourId=${tourId}`);
        }

        // --- Server-Side Validation ---
        console.log(`Validating amount for tour ${tourId}...`);
        const { data: tour, error: tourError } = await supabaseClient
            .from('destinations')
            .select('*')
            .eq('id', tourId)
            .single();

        if (tourError || !tour) {
            console.error("Tour not found:", tourError);
            throw new Error("Invalid destination selected");
        }

        let unitPrice = 0;
        if (residency === 'citizen') unitPrice = tour.citizen_price;
        else if (residency === 'resident') unitPrice = tour.resident_price;
        else if (residency === 'nonResident') unitPrice = tour.non_resident_price;
        else unitPrice = tour.non_resident_price; // fallback

        const expectedTotal = unitPrice * participants;

        // Use a small epsilon for decimal comparison if needed, but here they are likely integers or fixed decimals
        if (Math.abs(clientAmount - expectedTotal) > 0.01) {
            console.error(`Amount mismatch! Client: ${clientAmount}, Expected: ${expectedTotal}`);
            throw new Error("Payment amount mismatch. Please try again.");
        }
        console.log("Amount validated successfully");

        // Determine currency based on residency
        const currency = residency === 'citizen' ? 'KES' : 'USD';

        const consumerKey = Deno.env.get("PESAPAL_CONSUMER_KEY");
        const consumerSecret = Deno.env.get("PESAPAL_CONSUMER_SECRET");
        const isLive = Deno.env.get("PESAPAL_IS_LIVE") === "true";
        const pesapalUrl = isLive
            ? "https://pay.pesapal.com/v3"
            : "https://cyb3r.pesapal.com/pesapalv3";

        if (!consumerKey || !consumerSecret) throw new Error("PesaPal configuration missing");

        // 1. Authenticate to get Bearer Token
        console.log("Authenticating with PesaPal...");
        const authResponse = await fetch(`${pesapalUrl}/api/Auth/RequestToken`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
        });

        if (!authResponse.ok) {
            const authErrorData = await authResponse.text();
            console.log("PesaPal authentication failed:", authErrorData);
            throw new Error("PesaPal authentication failed");
        }
        const { token: bearerToken } = await authResponse.json();
        console.log("PesaPal authenticated successfully");


        // 2. Register IPN URL (Optional - PesaPal's IPN endpoint is unreliable)
        let ipnId = Deno.env.get("PESAPAL_IPN_ID");
        const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "") ?? "";

        if (!ipnId) {
            const callbackUrl = `${supabaseUrl}/functions/v1/pesapal-callback`;
            console.log("Registering IPN URL:", callbackUrl);

            try {
                const ipnResponse = await fetch(`${pesapalUrl}/api/URLSetup/RegisterIPN`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${bearerToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        url: callbackUrl,
                        ipn_notification_type: "POST",
                    }),
                });
                if (ipnResponse.ok) {
                    const ipnData = await ipnResponse.json();
                    ipnId = ipnData.ipn_id;
                    console.log("IPN registered successfully:", ipnId);
                } else {
                    const ipnErrorData = await ipnResponse.text();
                    console.warn("IPN Registration failed (continuing without IPN):", ipnErrorData);
                    // Don't throw - IPN is optional, we can proceed without it
                }
            } catch (error) {
                console.warn("IPN Registration error (continuing without IPN):", error);
                // Don't throw - IPN is optional, we can proceed without it
            }
        }


        // 3. Create Booking Record (Pending)
        const supabaseService = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            { auth: { persistSession: false } }
        );

        const { data: booking, error: bookingError } = await supabaseService
            .from("bookings")
            .insert({
                tour_id: tourId.toString(),
                user_id: user.id,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                participants,
                start_date: startDate?.split('T')[0],
                total_amount: expectedTotal,
                special_requests: specialRequests,
                payment_status: "pending",
                status: "pending",
                payment_method: "pesapal",
                residency_type: residency,
            })
            .select()
            .single();

        if (bookingError) {
            console.error("Booking Creation Error:", bookingError);
            throw new Error(`Failed to create booking record: ${bookingError.message}`);
        }

        // 4. Submit Order
        const orderRequest: any = {
            id: booking.id, // MerchantReference
            currency: currency,
            amount: expectedTotal,
            description: `Payment for ${tourTitle}`,
            callback_url: `${Deno.env.get("APP_URL") || 'http://localhost:8080'}/booking-success?bookingId=${booking.id}`,
            billing_address: {
                email_address: customerEmail,
                phone_number: customerPhone,
                first_name: customerName.split(' ')[0],
                last_name: customerName.split(' ').slice(1).join(' ') || "Valued Customer",
            },
        };

        // Only include notification_id if IPN was successfully registered
        if (ipnId) {
            orderRequest.notification_id = ipnId;
        }


        const orderResponse = await fetch(`${pesapalUrl}/api/Transactions/SubmitOrderRequest`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderRequest),
        });

        if (!orderResponse.ok) {
            const errText = await orderResponse.text();
            console.error("PesaPal Order Error (Status " + orderResponse.status + "):", errText);
            throw new Error(`Failed to submit PesaPal order: ${orderResponse.status} ${orderResponse.statusText}`);
        }

        const orderData = await orderResponse.json();
        console.log("PesaPal Order Response:", orderData);

        // Check for functional error (PesaPal returns 200 with error body sometimes)
        if (orderData.error) {
            console.error("PesaPal API Error:", orderData.error);
            throw new Error(`PesaPal API Error: ${orderData.error.message || orderData.error.code}`);
        }

        // 5. Audit - Log Transaction
        const { error: txError } = await supabaseService
            .from("pesapal_transactions")
            .insert({
                booking_id: booking.id,
                order_tracking_id: orderData.order_tracking_id,
                merchant_reference: booking.id,
                amount: expectedTotal,
                currency: currency,
                status: "INITIATED",
                customer_email: customerEmail,
                gateway_response: orderData
            });

        if (txError) {
            console.error("Transaction Logging Error:", txError);
            // Don't throw here, the order is already submitted
        }

        return new Response(
            JSON.stringify({
                success: true,
                url: orderData.redirect_url,
                orderTrackingId: orderData.order_tracking_id,
                bookingId: booking.id,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
    } catch (error) {
        console.error("PesaPal Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
