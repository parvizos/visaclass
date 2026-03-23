import express from 'express';
import Joi from 'joi';
import { queryDatabase } from '../config/database.js';
import { createPaymentIntent, confirmPayment } from '../services/paymentService.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Validation schemas
const paymentIntentSchema = Joi.object({
  booking_id: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD'),
  payment_method: Joi.string().optional()
});

const confirmPaymentSchema = Joi.object({
  payment_intent_id: Joi.string().required(),
  booking_id: Joi.number().integer().positive().required()
});

// Create payment intent
router.post('/create-intent', async (req, res) => {
  try {
    const { error, value } = paymentIntentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    // Check if booking exists
    const booking = await queryDatabase(
      'SELECT * FROM bookings WHERE id = ?',
      [value.booking_id]
    );
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if payment already exists for this booking
    const existingPayment = await queryDatabase(
      'SELECT * FROM payments WHERE booking_id = ? AND status = "succeeded"',
      [value.booking_id]
    );
    
    if (existingPayment.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Payment already completed for this booking'
      });
    }
    
    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent({
      amount: Math.round(value.amount * 100), // Convert to cents
      currency: value.currency.toLowerCase(),
      metadata: {
        booking_id: value.booking_id.toString(),
        passenger_id: booking[0].passenger_id.toString()
      }
    });
    
    // Save payment record
    await queryDatabase(
      `INSERT INTO payments (booking_id, stripe_payment_intent_id, amount, currency, status, payment_method) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        value.booking_id,
        paymentIntent.id,
        value.amount,
        value.currency,
        'pending',
        value.payment_method || 'card'
      ]
    );
    
    res.json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: value.amount,
        currency: value.currency
      }
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});

// Confirm payment
router.post('/confirm', async (req, res) => {
  try {
    const { error, value } = confirmPaymentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    // Get payment record
    const payment = await queryDatabase(
      'SELECT * FROM payments WHERE stripe_payment_intent_id = ? AND booking_id = ?',
      [value.payment_intent_id, value.booking_id]
    );
    
    if (payment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }
    
    // Confirm payment with Stripe
    const confirmedPayment = await confirmPayment(value.payment_intent_id);
    
    // Update payment record
    await queryDatabase(
      `UPDATE payments 
       SET status = ?, stripe_receipt_url = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE stripe_payment_intent_id = ?`,
      [
        confirmedPayment.status,
        confirmedPayment.receipt_url || null,
        value.payment_intent_id
      ]
    );
    
    // Update booking payment status
    const bookingStatus = confirmedPayment.status === 'succeeded' ? 'confirmed' : 'pending';
    await queryDatabase(
      `UPDATE bookings 
       SET payment_status = ?, status = ?, stripe_payment_intent_id = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        confirmedPayment.status,
        bookingStatus,
        value.payment_intent_id,
        value.booking_id
      ]
    );
    
    // Get booking details for email
    const bookingDetails = await queryDatabase(
      `SELECT b.*, p.first_name, p.last_name, p.email 
       FROM bookings b 
       JOIN passengers p ON b.passenger_id = p.id 
       WHERE b.id = ?`,
      [value.booking_id]
    );
    
    if (bookingDetails.length > 0 && confirmedPayment.status === 'succeeded') {
      // Send confirmation email
      try {
        await sendEmail({
          to: bookingDetails[0].email,
          subject: 'Payment Confirmed - Booking Confirmation',
          template: 'payment_confirmation',
          passengerName: `${bookingDetails[0].first_name} ${bookingDetails[0].last_name}`,
          bookingReference: bookingDetails[0].booking_reference,
          amount: payment[0].amount,
          currency: payment[0].currency,
          receiptUrl: confirmedPayment.receipt_url
        });
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError);
      }
    }
    
    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        payment_intent_id: value.payment_intent_id,
        status: confirmedPayment.status,
        receipt_url: confirmedPayment.receipt_url
      }
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await queryDatabase(
      `SELECT p.*, b.booking_reference, b.status as booking_status,
              pass.first_name, pass.last_name, pass.email
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN passengers pass ON b.passenger_id = pass.id
       WHERE p.id = ?`,
      [id]
    );
    
    if (payment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      data: payment[0]
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment'
    });
  }
});

// Get payments by booking ID
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const payments = await queryDatabase(
      'SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC',
      [bookingId]
    );
    
    res.json({
      success: true,
      data: payments,
      count: payments.length
    });
  } catch (error) {
    console.error('Error fetching booking payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking payments'
    });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSucceeded(paymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailed(failedPayment);
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).send('Webhook handler failed');
  }
});

// Helper functions for webhook handling
async function handlePaymentSucceeded(paymentIntent) {
  try {
    await queryDatabase(
      `UPDATE payments 
       SET status = 'succeeded' 
       WHERE stripe_payment_intent_id = ?`,
      [paymentIntent.id]
    );
    
    const bookingId = paymentIntent.metadata.booking_id;
    if (bookingId) {
      await queryDatabase(
        `UPDATE bookings 
         SET payment_status = 'paid', status = 'confirmed' 
         WHERE id = ?`,
        [bookingId]
      );
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  try {
    await queryDatabase(
      `UPDATE payments 
       SET status = 'failed' 
       WHERE stripe_payment_intent_id = ?`,
      [paymentIntent.id]
    );
    
    const bookingId = paymentIntent.metadata.booking_id;
    if (bookingId) {
      await queryDatabase(
        `UPDATE bookings 
         SET payment_status = 'failed' 
         WHERE id = ?`,
        [bookingId]
      );
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

export default router;
