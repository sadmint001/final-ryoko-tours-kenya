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

        if (!orderTrackingId) throw new Error("Missing OrderTrackingId");

        const consumerKey = Deno.env.get("PESAPAL_CONSUMER_KEY");
        const consumerSecret = Deno.env.get("PESAPAL_CONSUMER_SECRET");
        const isLive = Deno.env.get("PESAPAL_IS_LIVE") === "true";
        const pesapalUrl = isLive
            ? "https://pay.pesapal.com/v3"
            : "https://cyb3r.pesapal.com/pesapalv3";

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

        return new Response(
            JSON.stringify({ success: true, status: statusData.payment_status_description }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
    } catch (error) {
        console.error("PesaPal Callback Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
