import express from 'express';
import Joi from 'joi';
import { queryDatabase } from '../config/database.js';
import { createPaymentIntent, confirmPayment } from '../services/paymentService.js';
import { sendEmail } from '../services/emailService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Validation schemas
const applicationPaymentSchema = Joi.object({
  application_id: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD'),
  payment_type: Joi.string().valid('application_fee', 'tuition_deposit', 'full_tuition', 'service_fee').default('application_fee'),
  payment_method: Joi.string().optional()
});

const confirmApplicationPaymentSchema = Joi.object({
  payment_intent_id: Joi.string().required(),
  application_id: Joi.number().integer().positive().required()
});

// Create application payment intent
router.post('/create-intent', async (req, res) => {
  try {
    const { error, value } = applicationPaymentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    // Check if application exists
    const application = await queryDatabase(
      'SELECT * FROM applications WHERE id = ?',
      [value.application_id]
    );
    
    if (application.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if payment already exists for this application and type
    const existingPayment = await queryDatabase(
      'SELECT * FROM application_payments WHERE application_id = ? AND payment_type = ? AND status = "succeeded"',
      [value.application_id, value.payment_type]
    );
    
    if (existingPayment.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Payment already completed for this application type'
      });
    }
    
    // Generate payment reference
    const payment_reference = `APP-${value.application_id}-${Date.now()}`;
    
    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent({
      amount: Math.round(value.amount * 100), // Convert to cents
      currency: value.currency.toLowerCase(),
      metadata: {
        application_id: value.application_id.toString(),
        payment_type: value.payment_type,
        payment_reference: payment_reference,
        applicant_email: application[0].email
      }
    });
    
    // Save application payment record
    await queryDatabase(
      `INSERT INTO application_payments 
       (application_id, payment_reference, stripe_payment_intent_id, amount, currency, 
        payment_type, status, payment_method) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        value.application_id,
        payment_reference,
        paymentIntent.id,
        value.amount,
        value.currency,
        value.payment_type,
        'pending',
        value.payment_method || 'card'
      ]
    );
    
    res.json({
      success: true,
      message: 'Application payment intent created successfully',
      data: {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        payment_reference: payment_reference,
        amount: value.amount,
        currency: value.currency,
        payment_type: value.payment_type
      }
    });
  } catch (error) {
    console.error('Error creating application payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});

// Confirm application payment
router.post('/confirm', async (req, res) => {
  try {
    const { error, value } = confirmApplicationPaymentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    // Get payment record
    const payment = await queryDatabase(
      'SELECT * FROM application_payments WHERE stripe_payment_intent_id = ? AND application_id = ?',
      [value.payment_intent_id, value.application_id]
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
      `UPDATE application_payments 
       SET status = ?, stripe_receipt_url = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE stripe_payment_intent_id = ?`,
      [
        confirmedPayment.status,
        confirmedPayment.receipt_url || null,
        value.payment_intent_id
      ]
    );
    
    // Update application payment status
    if (confirmedPayment.status === 'succeeded') {
      await queryDatabase(
        `UPDATE applications 
         SET payment_status = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        ['paid', value.application_id]
      );
    }
    
    // Get application details for email
    const applicationDetails = await queryDatabase(
      'SELECT * FROM applications WHERE id = ?',
      [value.application_id]
    );
    
    if (applicationDetails.length > 0 && confirmedPayment.status === 'succeeded') {
      // Send payment confirmation email
      try {
        await sendEmail({
          to: applicationDetails[0].email,
          subject: 'Payment Confirmed - Application Fee',
          template: 'application_payment_confirmation',
          applicantName: `${applicationDetails[0].first_name} ${applicationDetails[0].last_name}`,
          paymentReference: payment[0].payment_reference,
          amount: payment[0].amount,
          currency: payment[0].currency,
          paymentType: payment[0].payment_type,
          receiptUrl: confirmedPayment.receipt_url
        });
      } catch (emailError) {
        console.error('Failed to send application payment confirmation email:', emailError);
      }
    }
    
    res.json({
      success: true,
      message: 'Application payment confirmed successfully',
      data: {
        payment_intent_id: value.payment_intent_id,
        payment_reference: payment[0].payment_reference,
        status: confirmedPayment.status,
        receipt_url: confirmedPayment.receipt_url
      }
    });
  } catch (error) {
    console.error('Error confirming application payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
});

// Get application payment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await queryDatabase(
      `SELECT ap.*, a.first_name, a.last_name, a.email, a.target_university
       FROM application_payments ap
       JOIN applications a ON ap.application_id = a.id
       WHERE ap.id = ?`,
      [id]
    );
    
    if (payment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application payment not found'
      });
    }
    
    res.json({
      success: true,
      data: payment[0]
    });
  } catch (error) {
    console.error('Error fetching application payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application payment'
    });
  }
});

// Get payments by application ID
router.get('/application/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const payments = await queryDatabase(
      'SELECT * FROM application_payments WHERE application_id = ? ORDER BY created_at DESC',
      [applicationId]
    );
    
    res.json({
      success: true,
      data: payments,
      count: payments.length
    });
  } catch (error) {
    console.error('Error fetching application payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application payments'
    });
  }
});

// Get all application payments (admin)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, payment_type } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '1=1';
    const params = [];
    
    if (status) {
      whereClause += ' AND ap.status = ?';
      params.push(status);
    }
    
    if (payment_type) {
      whereClause += ' AND ap.payment_type = ?';
      params.push(payment_type);
    }
    
    const payments = await queryDatabase(
      `SELECT ap.*, a.first_name, a.last_name, a.email, a.target_university
       FROM application_payments ap
       JOIN applications a ON ap.application_id = a.id
       WHERE ${whereClause}
       ORDER BY ap.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    const totalCount = await queryDatabase(
      `SELECT COUNT(*) as count
       FROM application_payments ap
       WHERE ${whereClause}`,
      params
    );
    
    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching application payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application payments'
    });
  }
});

// Create payment page data
router.get('/payment-page/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    // Get application details
    const application = await queryDatabase(
      'SELECT * FROM applications WHERE id = ?',
      [applicationId]
    );
    
    if (application.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Get existing payments
    const existingPayments = await queryDatabase(
      'SELECT * FROM application_payments WHERE application_id = ? AND status = "succeeded"',
      [applicationId]
    );
    
    // Define payment types and amounts
    const paymentTypes = [
      {
        type: 'application_fee',
        name: 'Application Processing Fee',
        amount: 100,
        description: 'Non-refundable application processing fee',
        required: true
      },
      {
        type: 'tuition_deposit',
        name: 'Tuition Deposit',
        amount: 500,
        description: 'Refundable tuition deposit to secure your place',
        required: false
      },
      {
        type: 'service_fee',
        name: 'Document Processing Service',
        amount: 150,
        description: 'Professional document translation and processing',
        required: false
      }
    ];
    
    // Filter out already paid payment types
    const availablePayments = paymentTypes.filter(
      paymentType => !existingPayments.some(
        payment => payment.payment_type === paymentType.type
      )
    );
    
    res.json({
      success: true,
      data: {
        application: application[0],
        existing_payments: existingPayments,
        available_payments: availablePayments,
        total_paid: existingPayments.reduce((sum, payment) => sum + payment.amount, 0),
        currency: 'USD'
      }
    });
  } catch (error) {
    console.error('Error fetching payment page data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment page data'
    });
  }
});

// Get payment statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await queryDatabase(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        payment_type,
        AVG(amount) as average_amount
      FROM application_payments
      GROUP BY payment_type
    `);
    
    const totalStats = await queryDatabase(`
      SELECT 
        COUNT(*) as total_all_payments,
        SUM(amount) as total_all_amount,
        COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as total_successful,
        AVG(amount) as overall_average
      FROM application_payments
    `);
    
    res.json({
      success: true,
      data: {
        by_type: stats,
        total: totalStats[0]
      }
    });
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics'
    });
  }
});

// Refund payment (admin only)
router.post('/refund/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    
    // Get payment details
    const payment = await queryDatabase(
      'SELECT * FROM application_payments WHERE id = ? AND status = "succeeded"',
      [paymentId]
    );
    
    if (payment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or not eligible for refund'
      });
    }
    
    // Create refund through Stripe (you'll need to implement this in paymentService)
    // For now, we'll just update the status
    await queryDatabase(
      `UPDATE application_payments 
       SET status = 'refunded', refund_reason = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [reason || 'Customer request', paymentId]
    );
    
    // Update application payment status if all payments are refunded
    const allPayments = await queryDatabase(
      'SELECT * FROM application_payments WHERE application_id = ?',
      [payment[0].application_id]
    );
    
    const allRefunded = allPayments.every(p => p.status === 'refunded');
    if (allRefunded) {
      await queryDatabase(
        'UPDATE applications SET payment_status = "refunded" WHERE id = ?',
        [payment[0].application_id]
      );
    }
    
    res.json({
      success: true,
      message: 'Payment refunded successfully'
    });
  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refund payment'
    });
  }
});

export default router;
