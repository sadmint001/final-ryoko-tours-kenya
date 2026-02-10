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
    const body = await req.json();
    console.log("M-Pesa Callback received:", JSON.stringify(body, null, 2));

    // Create Supabase client with service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { Body } = body;
    const { stkCallback } = Body;

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata;
      const items = callbackMetadata.Item;

      const amount = items.find((item: any) => item.Name === "Amount")?.Value;
      const mpesaReceiptNumber = items.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value;
      const transactionDate = items.find((item: any) => item.Name === "TransactionDate")?.Value;
      const phoneNumber = items.find((item: any) => item.Name === "PhoneNumber")?.Value;

      // Update booking payment status
      const { error } = await supabaseService
        .from("bookings")
        .update({
          payment_status: "paid",
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("customer_phone", `+${phoneNumber}`)
        .eq("payment_status", "pending");

      if (error) {
        console.error("Error updating booking:", error);
      } else {
        console.log("Booking updated successfully for M-Pesa payment");
      }
    } else {
      // Payment failed
      console.log("M-Pesa payment failed:", stkCallback.ResultDesc);

      // Optionally update booking status to failed
      // Note: We'd need a better way to match the booking, perhaps storing the CheckoutRequestID
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("M-Pesa Callback Error:", error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message,
        details: (error as Error).stack
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});