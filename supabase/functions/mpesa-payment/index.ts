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
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    // Parse request body
    const {
      phoneNumber,
      amount,
      tourId,
      customerName,
      customerEmail,
      participants,
      startDate,
      specialRequests,
    } = await req.json();

    // M-Pesa API configuration
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    const businessShortCode = Deno.env.get("MPESA_BUSINESS_SHORTCODE") || "174379";
    const passkey = Deno.env.get("MPESA_PASSKEY");

    if (!consumerKey || !consumerSecret || !passkey) {
      throw new Error("M-Pesa configuration missing");
    }

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

    // Generate password
    const password = btoa(`${businessShortCode}${passkey}${timestamp}`);

    // Get access token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to get M-Pesa access token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Format phone number (remove +254 and add 254)
    const formattedPhone = phoneNumber.startsWith('+254')
      ? phoneNumber.replace('+254', '254')
      : phoneNumber.startsWith('0')
        ? phoneNumber.replace('0', '254')
        : phoneNumber;

    // STK Push request
    const stkPushResponse = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: businessShortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: formattedPhone,
          PartyB: businessShortCode,
          PhoneNumber: formattedPhone,
          CallBackURL: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-callback`,
          AccountReference: `Safari-${tourId}`,
          TransactionDesc: `Safari Tour Payment`,
        }),
      }
    );

    if (!stkPushResponse.ok) {
      throw new Error("Failed to initiate M-Pesa payment");
    }

    const stkData = await stkPushResponse.json();

    // Create booking record with Supabase service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: booking, error: bookingError } = await supabaseService
      .from("bookings")
      .insert({
        tour_id: tourId,
        user_id: user.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: phoneNumber,
        participants,
        start_date: startDate?.split('T')[0],
        total_amount: amount,
        special_requests: specialRequests,
        payment_status: "pending",
        status: "pending",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);
      throw new Error("Failed to create booking record");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "M-Pesa payment initiated successfully",
        checkoutRequestId: stkData.CheckoutRequestID,
        bookingId: booking.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("M-Pesa Error:", error);
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