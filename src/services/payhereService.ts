// PayHere Payment Service
export interface PayHerePayment {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
}

export interface PayHereConfig {
  merchant_id: string;
  merchant_secret: string;
  sandbox: boolean;
}

// PayHere configuration for sandbox
const PAYHERE_CONFIG: PayHereConfig = {
  merchant_id: '1221149', // PayHere sandbox merchant ID
  merchant_secret: 'MzE5NjAyMzI4MTE1NzI4NzE4NzE5Mzc4NzQyNzM2MjE4NzI5Mw==', // PayHere sandbox secret
  sandbox: true
};

// Generate MD5 hash for PayHere
const generateHash = (
  merchant_id: string,
  order_id: string,
  amount: string,
  currency: string,
  merchant_secret: string
): string => {
  const hash_string = merchant_id + order_id + amount + currency + merchant_secret;
  
  // Simple MD5 implementation for browser
  const md5 = (str: string): string => {
    const crypto = require('crypto-js');
    return crypto.MD5(str).toString();
  };
  
  try {
    return md5(hash_string).toUpperCase();
  } catch (error) {
    // Fallback hash generation
    let hash = 0;
    for (let i = 0; i < hash_string.length; i++) {
      const char = hash_string.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase();
  }
};

export const createPayHerePayment = (
  orderId: string,
  amount: number,
  courseName: string,
  userDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }
): PayHerePayment => {
  const amountStr = amount.toFixed(2);
  
  const payment: PayHerePayment = {
    merchant_id: PAYHERE_CONFIG.merchant_id,
    return_url: `${window.location.origin}/payment/success`,
    cancel_url: `${window.location.origin}/payment/cancel`,
    notify_url: `${window.location.origin}/payment/notify`,
    order_id: orderId,
    items: courseName,
    amount: amountStr,
    currency: 'LKR',
    hash: generateHash(
      PAYHERE_CONFIG.merchant_id,
      orderId,
      amountStr,
      'LKR',
      PAYHERE_CONFIG.merchant_secret
    ),
    first_name: userDetails.firstName,
    last_name: userDetails.lastName,
    email: userDetails.email,
    phone: userDetails.phone || '',
    address: '',
    city: 'Colombo',
    country: 'Sri Lanka'
  };

  return payment;
};

export const initializePayHere = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if PayHere script is already loaded
    if (window.payhere) {
      resolve();
      return;
    }

    // Load PayHere script
    const script = document.createElement('script');
    script.src = PAYHERE_CONFIG.sandbox 
      ? 'https://www.payhere.lk/lib/payhere.js'
      : 'https://www.payhere.lk/lib/payhere.js';
    
    script.onload = () => {
      if (window.payhere) {
        resolve();
      } else {
        reject(new Error('PayHere failed to load'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load PayHere script'));
    };
    
    document.head.appendChild(script);
  });
};

export const processPayment = async (
  payment: PayHerePayment,
  onSuccess: (orderId: string) => void,
  onError: (error: string) => void,
  onDismiss: () => void
): Promise<void> => {
  try {
    await initializePayHere();
    
    window.payhere.onCompleted = function(orderId: string) {
      console.log('Payment completed. OrderID:', orderId);
      onSuccess(orderId);
    };

    window.payhere.onDismissed = function() {
      console.log('Payment dismissed');
      onDismiss();
    };

    window.payhere.onError = function(error: string) {
      console.log('Payment error:', error);
      onError(error);
    };

    // Start payment
    window.payhere.startPayment(payment);
    
  } catch (error) {
    console.error('PayHere initialization error:', error);
    onError('Failed to initialize payment system');
  }
};

// Declare PayHere types for TypeScript
declare global {
  interface Window {
    payhere: {
      startPayment: (payment: PayHerePayment) => void;
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
    };
  }
}