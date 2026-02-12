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
        // PesaPal sends OrderTrackingId and MerchantReference (bookingId) in the query params
        const url = new URL(req.url);
        const orderTrackingId = url.searchParams.get("OrderTrackingId");
        const merchantReference = url.searchParams.get("OrderMerchantReference");
        const orderNotificationType = url.searchParams.get("OrderNotificationType");

        if (!orderTrackingId) throw new Error("Missing OrderTrackingId");

        const consumerKey = Deno.env.get("PESAPAL_CONSUMER_KEY");
        const consumerSecret = Deno.env.get("PESAPAL_CONSUMER_SECRET");
        const isLive = Deno.env.get("PESAPAL_IS_LIVE") === "true";
        const pesapalUrl = isLive
            ? "https://pay.pesapal.com/v3"
            : "https://cybqa.pesapal.com/pesapalv3";

        // 1. Authenticate to get Bearer Token
        const authResponse = await fetch(`${pesapalUrl}/api/Auth/RequestToken`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
        });

        if (!authResponse.ok) throw new Error("PesaPal authentication failed");
        const { token: bearerToken } = await authResponse.json();

        // 2. Get Transaction Status from PesaPal (Server-to-Server Verification)
        const statusResponse = await fetch(`${pesapalUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        });

        if (!statusResponse.ok) throw new Error("Failed to verify transaction status");
        const statusData = await statusResponse.json();

        // PesaPal payment_status codes: 0 - Pending, 1 - Completed, 2 - Failed, 3 - Invalid
        const isSuccess = statusData.payment_status_description === "COMPLETED" || statusData.status_code === 1;

        // 3. Update Database using service role
        const supabaseService = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            { auth: { persistSession: false } }
        );

        const bookingId = merchantReference || statusData.merchant_reference;

        // Update Booking Record
        const updateData: any = {
            payment_status: isSuccess ? "paid" : (statusData.status_code === 2 ? "failed" : "pending"),
            pesapal_order_tracking_id: orderTrackingId,
            pesapal_merchant_reference: bookingId
        };

        if (isSuccess) {
            updateData.status = "confirmed";
        }

        const { error: updateError } = await supabaseService
            .from("bookings")
            .update(updateData)
            .eq("id", bookingId);

        if (updateError) {
            console.error("Booking Update Error:", updateError);
        }

        // Update Transaction Record (Auditing)
        const { error: txError } = await supabaseService
            .from("pesapal_transactions")
            .upsert({
                booking_id: bookingId,
                order_tracking_id: orderTrackingId,
                merchant_reference: bookingId,
                amount: statusData.amount,
                status: statusData.payment_status_description,
                payment_method: statusData.payment_method,
                gateway_response: statusData,
                updated_at: new Date().toISOString()
            }, { onConflict: 'order_tracking_id' });

        if (txError) {
            console.error("Transaction Update Error:", txError);
        }

        // 4. Respond according to Notification Type
        if (orderNotificationType === "IPNCHANGE") {
            // PesaPal expects a specific JSON response for IPN notifications
            console.log("Responding to IPN notification...");
            return new Response(
                JSON.stringify({
                    orderNotificationType: "IPNCHANGE",
                    orderTrackingId: orderTrackingId,
                    orderMerchantReference: bookingId,
                    status: 200
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
        } else {
            // Callback: Redirect to frontend success page
            const frontendUrl = Deno.env.get("PUBLIC_SITE_URL") || Deno.env.get("APP_URL") || "http://localhost:8080";
            const redirectUrl = `${frontendUrl}/booking-success?bookingId=${bookingId}&trackingId=${orderTrackingId}`;

            console.log("Redirecting user to success page:", redirectUrl);

            return new Response(null, {
                status: 302,
                headers: {
                    ...corsHeaders,
                    "Location": redirectUrl,
                },
            });
        }
    } catch (error) {
        console.error("PesaPal Callback Error:", error);
        return new Response(
            JSON.stringify({
                error: (error as Error).message,
                details: (error as Error).stack
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
