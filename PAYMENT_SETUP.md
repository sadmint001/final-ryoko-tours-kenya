# Payment Integration Setup Guide

This guide will help you set up Stripe and M-Pesa payments for Ryoko Tours Africa in sandbox/test mode.

## 🚀 Quick Start

### 1. Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration (Test Mode)
REACT_APP_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_your_stripe_test_key

# M-Pesa Configuration (Sandbox)
REACT_APP_MPESA_CONSUMER_KEY=your_mpesa_consumer_key
REACT_APP_MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
REACT_APP_MPESA_BUSINESS_SHORTCODE=174379
REACT_APP_MPESA_PASSKEY=your_mpesa_passkey
```

### 2. Supabase Edge Functions Environment Variables

Set these in your Supabase dashboard under Settings > Edge Functions:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# M-Pesa
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=your_mpesa_passkey
```

## 🔧 Stripe Setup

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Navigate to the Dashboard
3. Switch to "Test mode" (toggle in the top right)

### 2. Get API Keys
1. Go to Developers > API keys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### 3. Test Card Numbers
Use these test card numbers for testing:

- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Insufficient Funds**: `4000000000009995`
- **Expired**: `4000000000000069`
- **Incorrect CVC**: `4000000000000127`

**Test Details:**
- CVC: `123`
- Expiry: `12/25`
- ZIP: Any 5 digits

## 📱 M-Pesa Setup

### 1. Create M-Pesa Developer Account
1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an account and verify your email
3. Navigate to "My Apps" and create a new app

### 2. Get API Credentials
1. In your app dashboard, find:
   - **Consumer Key**
   - **Consumer Secret**
   - **Business Shortcode** (use `174379` for sandbox)
   - **Passkey** (generate in the app settings)

### 3. Test Phone Numbers
Use these test phone numbers for sandbox testing:

- `254708374149`
- `254708374150`
- `254708374151`
- `254708374152`
- `254708374153`

## 🗄️ Database Setup

### 1. Create Bookings Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  participants INTEGER NOT NULL DEFAULT 1,
  start_date DATE,
  total_amount DECIMAL(10,2) NOT NULL,
  special_requests TEXT,
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  stripe_session_id TEXT,
  mpesa_checkout_request_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session ON bookings(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mpesa_checkout ON bookings(mpesa_checkout_request_id);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all bookings" ON bookings
  FOR ALL USING (auth.role() = 'service_role');
```

### 2. Create Admin Function

```sql
-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Add your admin logic here
  -- For now, return true for testing
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🚀 Deploy Edge Functions

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link Your Project
```bash
supabase link --project-ref your-project-ref
```

### 4. Deploy Functions
```bash
supabase functions deploy create-booking-payment
supabase functions deploy mpesa-payment
supabase functions deploy mpesa-callback
```

## 🧪 Testing

### 1. Test Stripe Payment
1. Go to the booking page
2. Select a destination and fill in details
3. Choose "Credit/Debit Card (Stripe)"
4. Use test card number: `4242424242424242`
5. Complete the payment flow

### 2. Test M-Pesa Payment
1. Go to the booking page
2. Select a destination and fill in details
3. Choose "M-Pesa"
4. Use test phone number: `254708374149`
5. Complete the payment flow

### 3. Test Bank Transfer
1. Go to the booking page
2. Select a destination and fill in details
3. Choose "Bank Transfer"
4. Complete the booking (no actual payment required)

## 🔍 Monitoring

### 1. Stripe Dashboard
- Check payments in [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
- View webhook events in Developers > Webhooks

### 2. M-Pesa Dashboard
- Check transactions in [M-Pesa Developer Portal](https://developer.safaricom.co.ke)
- View API logs and responses

### 3. Supabase Dashboard
- Check Edge Function logs in Supabase Dashboard
- Monitor database changes in Table Editor

## 🚨 Troubleshooting

### Common Issues

1. **Stripe Payment Fails**
   - Check if test mode is enabled
   - Verify API keys are correct
   - Ensure webhook endpoints are configured

2. **M-Pesa Payment Fails**
   - Verify sandbox credentials
   - Check phone number format (should start with 254)
   - Ensure business shortcode is correct

3. **Edge Functions Not Working**
   - Check function logs in Supabase Dashboard
   - Verify environment variables are set
   - Ensure functions are deployed

### Debug Mode

Enable debug logging by adding this to your environment:

```env
REACT_APP_DEBUG_PAYMENTS=true
```

## 🔄 Production Setup

When ready for production:

1. **Stripe**: Switch to live mode and use live API keys
2. **M-Pesa**: Use production credentials from Safaricom
3. **Environment**: Set `NODE_ENV=production`
4. **Security**: Enable proper authentication and authorization
5. **Monitoring**: Set up proper logging and error tracking

## 📞 Support

For issues with:
- **Stripe**: Contact Stripe Support
- **M-Pesa**: Contact Safaricom Developer Support
- **Supabase**: Check Supabase Documentation
- **App Issues**: Check the code and logs

---

**Note**: This setup is for sandbox/test mode. For production, ensure all security measures are in place and use live credentials.
