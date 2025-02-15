import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

export const paypalOptions = {
  "client-id": PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "subscription",
};

export const SUBSCRIPTION_PLANS = {
  PRO: {
    price: 29.99,
    features: [
      'Unlimited blog posts',
      'Up to 10 languages translation',
      'Video transcription',
      'Priority support'
    ]
  },
  ENTERPRISE: {
    price: 99.99,
    features: [
      'Everything in Pro',
      'Unlimited languages',
      'Custom domain',
      'Advanced analytics',
      'Dedicated support'
    ]
  }
}; 