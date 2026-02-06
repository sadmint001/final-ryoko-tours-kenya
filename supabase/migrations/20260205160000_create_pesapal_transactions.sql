-- Create a dedicated pesapal_transactions table for auditing
CREATE TABLE IF NOT EXISTS public.pesapal_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id),
    order_tracking_id TEXT UNIQUE,
    merchant_reference TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    status TEXT,
    payment_method TEXT,
    customer_email TEXT,
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add tracking columns to bookings if they don't exist
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pesapal_order_tracking_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pesapal_merchant_reference TEXT;

-- Enable RLS
ALTER TABLE public.pesapal_transactions ENABLE ROW LEVEL SECURITY;

-- Admins can view all transactions
CREATE POLICY "Admins can view all pesapal transactions" 
ON public.pesapal_transactions FOR SELECT 
TO authenticated 
USING ( public.is_admin(auth.uid()) );

-- Add trigger for updated_at
CREATE TRIGGER update_pesapal_transactions_updated_at
  BEFORE UPDATE ON public.pesapal_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
