import { supabase } from '@/integrations/supabase/client';
import { PAYMENT_CONFIG, PAYMENT_STATUS, BOOKING_STATUS } from '@/lib/payment-config';
import { useAuth } from '@/contexts/AuthContext';

export interface PaymentRequest {
  destinationId: number;
  destinationTitle: string;
  participants: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate?: string;
  specialRequests?: string;
}

export interface PaymentResponse {
  success: boolean;
  url?: string;
  message?: string;
  error?: string;
  checkoutRequestId?: string;
  bookingId?: string;
}

export class PaymentService {
  private static async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      Authorization: `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  // Stripe Payment
  static async processStripePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-booking-payment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tourId: paymentData.destinationId,
          tourTitle: paymentData.destinationTitle,
          participants: paymentData.participants,
          totalAmount: paymentData.totalAmount,
          customerName: paymentData.customerName,
          customerEmail: paymentData.customerEmail,
          customerPhone: paymentData.customerPhone,
          startDate: paymentData.startDate,
          specialRequests: paymentData.specialRequests,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed');
      }

      return {
        success: true,
        url: result.url,
        message: 'Payment session created successfully',
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  // M-Pesa Payment
  static async processMpesaPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/mpesa-payment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phoneNumber: paymentData.customerPhone,
          amount: paymentData.totalAmount,
          tourId: paymentData.destinationId,
          customerName: paymentData.customerName,
          customerEmail: paymentData.customerEmail,
          participants: paymentData.participants,
          startDate: paymentData.startDate,
          specialRequests: paymentData.specialRequests,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'M-Pesa payment failed');
      }

      return {
        success: true,
        message: 'M-Pesa payment initiated successfully',
        checkoutRequestId: result.checkoutRequestId,
        bookingId: result.bookingId,
      };
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'M-Pesa payment failed',
      };
    }
  }

  // Bank Transfer Payment
  static async processBankTransfer(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create booking record
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          tour_id: paymentData.destinationId.toString(),
          user_id: user.id,
          customer_name: paymentData.customerName,
          customer_email: paymentData.customerEmail,
          customer_phone: paymentData.customerPhone,
          participants: paymentData.participants,
          start_date: paymentData.startDate?.split('T')[0],
          total_amount: paymentData.totalAmount,
          special_requests: paymentData.specialRequests,
          payment_status: PAYMENT_STATUS.PENDING,
          status: BOOKING_STATUS.PENDING,
          payment_method: 'bank_transfer',
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create booking');
      }

      return {
        success: true,
        message: 'Bank transfer booking created successfully',
        bookingId: booking.id,
      };
    } catch (error) {
      console.error('Bank transfer error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bank transfer failed',
      };
    }
  }

  // Get Bank Transfer Details
  static getBankTransferDetails(amount: number, reference: string) {
    return {
      accountNumber: PAYMENT_CONFIG.bankTransfer.accountNumber,
      bankName: PAYMENT_CONFIG.bankTransfer.bankName,
      accountName: PAYMENT_CONFIG.bankTransfer.accountName,
      swiftCode: PAYMENT_CONFIG.bankTransfer.swiftCode,
      branchCode: PAYMENT_CONFIG.bankTransfer.branchCode,
      amount: amount,
      reference: reference,
    };
  }

  // Check Payment Status
  static async checkPaymentStatus(bookingId: string): Promise<{
    paymentStatus: string;
    bookingStatus: string;
    updatedAt: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('payment_status, status, updated_at')
        .eq('id', bookingId)
        .single();

      if (error) {
        throw error;
      }

      return {
        paymentStatus: data.payment_status,
        bookingStatus: data.status,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return null;
    }
  }

  // Get Payment History
  static async getPaymentHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          tour_id,
          customer_name,
          customer_email,
          participants,
          total_amount,
          payment_status,
          status,
          created_at,
          updated_at,
          tours (
            title,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  // Validate Payment Data
  static validatePaymentData(paymentData: PaymentRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!paymentData.destinationId) {
      errors.push('Destination is required');
    }

    if (!paymentData.customerName?.trim()) {
      errors.push('Customer name is required');
    }

    if (!paymentData.customerEmail?.trim()) {
      errors.push('Customer email is required');
    }

    if (!paymentData.customerPhone?.trim()) {
      errors.push('Customer phone is required');
    }

    if (paymentData.participants < 1) {
      errors.push('At least one participant is required');
    }

    if (paymentData.totalAmount <= 0) {
      errors.push('Total amount must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Format Currency
  static formatCurrency(amount: number, currency: string = 'KES'): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Get Test Mode Info
  static getTestModeInfo() {
    if (!PAYMENT_CONFIG.isTestMode) {
      return null;
    }

    return {
      stripe: {
        testCards: {
          success: '4242424242424242',
          decline: '4000000000000002',
          insufficientFunds: '4000000000009995',
        },
        testCvc: '123',
        testExpiry: '12/25',
      },
      mpesa: {
        testPhones: [
          '254708374149',
          '254708374150',
          '254708374151',
        ],
      },
    };
  }
}
