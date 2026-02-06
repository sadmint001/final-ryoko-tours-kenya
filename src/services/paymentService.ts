import { supabase } from '@/integrations/supabase/client';
import { PAYMENT_CONFIG, PAYMENT_STATUS, BOOKING_STATUS } from '@/lib/payment-config';

export interface PaymentRequest {
  destinationId: string;
  destinationTitle: string;
  participants: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate?: string;
  specialRequests?: string;
  residency_type: string;
}

export interface PaymentResponse {
  success: boolean;
  url?: string;
  message?: string;
  error?: string;
  checkoutRequestId?: string;
  bookingId?: string;
  orderTrackingId?: string;
  reference?: string;
}

export class PaymentService {
  /**
   * Helper to create a booking record in the database
   */
  private static async createBookingRecord(paymentData: PaymentRequest, paymentMethod: string, status: any = BOOKING_STATUS.PENDING) {
    const { data: { user } } = await supabase.auth.getUser();

    // Check if we already have a user for this email or use a null UUID for guests
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        tour_id: paymentData.destinationId,
        user_id: userId,
        customer_name: paymentData.customerName,
        customer_email: paymentData.customerEmail,
        customer_phone: paymentData.customerPhone,
        participants: paymentData.participants,
        start_date: paymentData.startDate?.split('T')[0],
        total_amount: paymentData.totalAmount,
        special_requests: paymentData.specialRequests,
        payment_status: PAYMENT_STATUS.PENDING,
        status: status,
        payment_method: paymentMethod,
        residency_type: paymentData.residency_type
      })
      .select()
      .single();

    if (error) {
      console.error(`Error creating booking for ${paymentMethod}:`, error);
      throw new Error('Failed to create booking record');
    }

    return booking;
  }

  /**
   * PesaPal Payment - Processes payment via PesaPal v3 integration
   */
  static async processPesapalPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Initiating PesaPal payment invocation...', paymentData);

      const { data, error } = await supabase.functions.invoke('pesapal-payment', {
        body: {
          ...paymentData,
          tourId: paymentData.destinationId // Ensure tourId is passed as expected by function
        },
      });

      if (error) {
        console.error('Pesapal invocation error:', error);
        return { success: false, error: error.message || 'Failed to initiate PesaPal payment' };
      }

      if (!data || !data.url) {
        console.error('Invalid PesaPal response data:', data);
        return { success: false, error: data?.error || 'Invalid response from payment service' };
      }

      return {
        success: true,
        url: data.url,
        orderTrackingId: data.orderTrackingId,
        bookingId: data.bookingId,
        message: 'PesaPal payment session created successfully',
      };
    } catch (error) {
      console.error('Pesapal payment service error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to process PesaPal payment' };
    }
  }

  /**
   * M-Pesa Payment - Initiates STK Push
   */
  static async processMpesaPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Initiating M-Pesa payment flow...', paymentData);

      // 1. Create booking first
      const booking = await this.createBookingRecord(paymentData, 'mpesa');

      // 2. Invoke M-Pesa STK Push
      const { data, error } = await supabase.functions.invoke('mpesa-payment', {
        body: {
          phoneNumber: paymentData.customerPhone,
          amount: paymentData.totalAmount,
          destinationId: paymentData.destinationId,
          bookingId: booking.id,
          customerName: paymentData.customerName,
          customerEmail: paymentData.customerEmail,
          participants: paymentData.participants,
          startDate: paymentData.startDate,
          specialRequests: paymentData.specialRequests,
          residency: paymentData.residency_type
        },
      });

      if (error) {
        console.error('M-Pesa invocation error:', error);
        return { success: false, bookingId: booking.id, error: error.message || 'M-Pesa payment failed' };
      }

      // 3. Update booking with M-Pesa reference if available
      if (data?.reference) {
        await supabase
          .from('bookings')
          .update({ mpesa_reference: data.reference })
          .eq('id', booking.id);
      }

      return {
        success: true,
        message: 'M-Pesa payment initiated successfully',
        checkoutRequestId: data?.checkoutRequestId,
        bookingId: booking.id,
        reference: data?.reference
      };
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'M-Pesa payment failed',
      };
    }
  }

  /**
   * Bank Transfer - Creates a pending booking
   */
  static async processBankTransfer(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const booking = await this.createBookingRecord(paymentData, 'bank_transfer');

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

  /**
   * Utility to get Bank Details for display
   */
  static getBankTransferDetails(amount: number, reference: string) {
    return {
      accountNumber: PAYMENT_CONFIG.bankTransfer?.accountNumber || '',
      bankName: PAYMENT_CONFIG.bankTransfer?.bankName || '',
      accountName: PAYMENT_CONFIG.bankTransfer?.accountName || '',
      swiftCode: PAYMENT_CONFIG.bankTransfer?.swiftCode || '',
      branchCode: PAYMENT_CONFIG.bankTransfer?.branchCode || '',
      amount: amount,
      reference: reference,
    };
  }

  /**
   * Checks payment status from DB
   */
  static async checkPaymentStatus(bookingId: string) {
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

  /**
   * Formats currency based on locale
   */
  static formatCurrency(amount: number, residency: string = 'citizen'): string {
    const currency = residency === 'citizen' ? 'KES' : 'USD';
    const locale = residency === 'citizen' ? 'en-KE' : 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}
