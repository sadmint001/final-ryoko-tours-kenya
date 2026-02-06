// Payment Configuration for Ryoko Tours Africa
export const PAYMENT_CONFIG = {
  // PesaPal Configuration
  pesapal: {
    environment: import.meta.env.MODE === 'production' ? 'live' : 'sandbox',
  },

  // M-Pesa Configuration
  mpesa: {
    environment: import.meta.env.MODE === 'production' ? 'live' : 'sandbox',
    businessShortCode: import.meta.env.VITE_MPESA_BUSINESS_SHORTCODE || '174379',
    consumerKey: import.meta.env.VITE_MPESA_CONSUMER_KEY,
    consumerSecret: import.meta.env.VITE_MPESA_CONSUMER_SECRET,
    passkey: import.meta.env.VITE_MPESA_PASSKEY,
  },

  // Bank Transfer Configuration
  bankTransfer: {
    accountNumber: '1234567890',
    bankName: 'KCB Bank',
    accountName: 'Ryoko Tours Africa',
    swiftCode: 'KCBLKEXX',
    branchCode: '001',
  },

  // Enabled Payment Methods
  enabledMethods: ['pesapal', 'mpesa', 'bank'],

  // Test Mode Flag
  isTestMode: process.env.NODE_ENV !== 'production',
};

// M-Pesa Test Phone Numbers
export const MPESA_TEST_PHONES = [
  '254708374149',
  '254708374150',
  '254708374151',
];

// Payment Status Constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Booking Status Constants
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;
