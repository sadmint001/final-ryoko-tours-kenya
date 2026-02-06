# Payment Integration Setup Guide

This guide will help you set up PesaPal and M-Pesa payments for Ryoko Tours Africa.

## 🚀 Quick Start

### 1. Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# M-Pesa Configuration (Sandbox)
REACT_APP_MPESA_BUSINESS_SHORTCODE=174379
```

### 2. Supabase Edge Functions Secrets

Set these in your Supabase project using the CLI or Dashboard:

```bash
# PesaPal
npx supabase secrets set PESAPAL_CONSUMER_KEY=your_key
npx supabase secrets set PESAPAL_CONSUMER_SECRET=your_secret
npx supabase secrets set PESAPAL_IS_LIVE=false

# M-Pesa
npx supabase secrets set MPESA_CONSUMER_KEY=your_key
npx supabase secrets set MPESA_CONSUMER_SECRET=your_secret
npx supabase secrets set MPESA_BUSINESS_SHORTCODE=174379
npx supabase secrets set MPESA_PASSKEY=your_passkey

# General
npx supabase secrets set APP_URL=your_deployed_app_url
```

## 💳 PesaPal Setup (v3)

### 1. Create PesaPal Account
1. Go to [PesaPal](https://www.pesapal.com/) and create a merchant account.
2. For testing, use the [PesaPal Sandbox](https://cyb3r.pesapal.com/sandbox).

### 2. Get API Keys
1. Navigate to the API settings in your dashboard.
2. Copy your **Consumer Key** and **Consumer Secret**.
3. Ensure your **IPN (Instant Payment Notification)** URL is registered via the `pesapal-payment` Edge Function (automatically handled by our integration).

## 📱 M-Pesa Setup

### 1. Create M-Pesa Developer Account
1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke).
2. Create an account and create a new app.

### 2. Get API Credentials
- **Consumer Key**
- **Consumer Secret**
- **Business Shortcode** (use `174379` for sandbox)
- **Passkey**

## 🗄️ Database Setup

Ensure your `bookings` table has the following structure:

```sql
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
  mpesa_checkout_request_id TEXT,
  order_tracking_id TEXT, -- For PesaPal
  residency_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Deploy Edge Functions

Deploy the functions using the following commands:

```bash
npx supabase functions deploy pesapal-payment
npx supabase functions deploy pesapal-callback
npx supabase functions deploy mpesa-payment
npx supabase functions deploy mpesa-callback
```

## 🧪 Testing

### 1. PesaPal
1. Choose "Online Card/Mobile (PesaPal)" during booking.
2. You will be redirected to PesaPal's secure checkout.
3. Use PesaPal sandbox card details.

### 2. M-Pesa
1. Choose "M-Pesa Express" during booking.
2. Enter your M-Pesa phone number.
3. Complete the STK push on your phone (Sandbox).

---

**Note**: Stripe is no longer supported in this project. All card payments are handled via PesaPal.
