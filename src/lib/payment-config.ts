// Payment Configuration for Ryoko Tours Africa
export const PAYMENT_CONFIG = {
  // Stripe Configuration
  stripe: {
    publishableKey: import.meta.env.MODE === 'production'
      ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      : import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST || 'pk_test_...',
    currency: 'kes',
    mode: import.meta.env.MODE === 'production' ? 'live' : 'test',
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

  // Payment Methods
  enabledMethods: ['stripe', 'mpesa', 'bank'],
  
  // Sandbox/Test Mode
  isTestMode: process.env.NODE_ENV !== 'production',
};

// Test card numbers for Stripe sandbox
export const STRIPE_TEST_CARDS = {
  success: '4242424242424242',
  decline: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expired: '4000000000000069',
  incorrectCvc: '4000000000000127',
  processingError: '4000000000000119',
};

// M-Pesa test phone numbers
export const MPESA_TEST_PHONES = [
  '254708374149',
  '254708374150',
  '254708374151',
  '254708374152',
  '254708374153',
];

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Booking status constants
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;
