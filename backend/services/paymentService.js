import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Create payment intent
export const createPaymentIntent = async (params) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      metadata: params.metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
      confirmation_method: 'manual',
    });
    
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
    throw new Error(`Payment intent creation failed: ${error.message}`);
  }
};

// Confirm payment
export const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert back to dollars
      currency: paymentIntent.currency.toUpperCase(),
      receipt_url: paymentIntent.charges.data[0]?.receipt_url || null,
      created: paymentIntent.created,
      metadata: paymentIntent.metadata
    };
  } catch (error) {
    console.error('Stripe payment confirmation failed:', error);
    throw new Error(`Payment confirmation failed: ${error.message}`);
  }
};

// Create refund
export const createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundParams = {
      payment_intent: paymentIntentId,
    };
    
    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }
    
    const refund = await stripe.refunds.create(refundParams);
    
    return {
      id: refund.id,
      amount: refund.amount / 100, // Convert back to dollars
      currency: refund.currency.toUpperCase(),
      status: refund.status,
      receipt_url: refund.receipt_url,
      created: refund.created
    };
  } catch (error) {
    console.error('Stripe refund creation failed:', error);
    throw new Error(`Refund creation failed: ${error.message}`);
  }
};

// Get payment method details
export const getPaymentMethod = async (paymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    
    return {
      id: paymentMethod.id,
      type: paymentMethod.type,
      card: paymentMethod.card ? {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
        fingerprint: paymentMethod.card.fingerprint
      } : null,
      billing_details: paymentMethod.billing_details
    };
  } catch (error) {
    console.error('Stripe payment method retrieval failed:', error);
    throw new Error(`Payment method retrieval failed: ${error.message}`);
  }
};

// Create customer
export const createCustomer = async (params) => {
  try {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      phone: params.phone,
      metadata: params.metadata || {},
    });
    
    return customer;
  } catch (error) {
    console.error('Stripe customer creation failed:', error);
    throw new Error(`Customer creation failed: ${error.message}`);
  }
};

// Attach payment method to customer
export const attachPaymentMethodToCustomer = async (paymentMethodId, customerId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    return paymentMethod;
  } catch (error) {
    console.error('Stripe payment method attachment failed:', error);
    throw new Error(`Payment method attachment failed: ${error.message}`);
  }
};

// Create payment intent with customer
export const createPaymentIntentWithCustomer = async (params) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      customer: params.customerId,
      payment_method: params.paymentMethodId,
      metadata: params.metadata || {},
      confirmation_method: params.confirmationMethod || 'manual',
      setup_future_usage: params.setupFutureUsage || 'off_session',
    });
    
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent creation with customer failed:', error);
    throw new Error(`Payment intent creation with customer failed: ${error.message}`);
  }
};

// Handle webhook events
export const constructWebhookEvent = (payload, signature, secret) => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error('Stripe webhook construction failed:', error);
    throw new Error(`Webhook construction failed: ${error.message}`);
  }
};

// Get account balance
export const getAccountBalance = async () => {
  try {
    const balance = await stripe.balance.retrieve();
    
    return {
      available: balance.available.map(b => ({
        amount: b.amount / 100, // Convert to dollars
        currency: b.currency.toUpperCase()
      })),
      pending: balance.pending.map(b => ({
        amount: b.amount / 100, // Convert to dollars
        currency: b.currency.toUpperCase()
      }))
    };
  } catch (error) {
    console.error('Stripe balance retrieval failed:', error);
    throw new Error(`Balance retrieval failed: ${error.message}`);
  }
};

export default stripe;
