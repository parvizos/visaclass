import nodemailer from 'nodemailer';
import { queryDatabase } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Email templates
const emailTemplates = {
  applicationSubmitted: (data) => ({
    subject: 'Application Received - VISACLASS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">VISACLASS</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">University Application System</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-bottom: 20px;">Application Received Successfully!</h2>
          
          <p style="color: #666; line-height: 1.6;">Dear ${data.personalInfo.firstName} ${data.personalInfo.lastName},</p>
          
          <p style="color: #666; line-height: 1.6;">Thank you for submitting your application to <strong>${data.programSelection.universityName}</strong> for the <strong>${data.programSelection.program}</strong> program.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Application Details:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Application ID:</strong> ${data.applicationId}</li>
              <li><strong>University:</strong> ${data.programSelection.universityName}</li>
              <li><strong>Program:</strong> ${data.programSelection.program}</li>
              <li><strong>Degree Type:</strong> ${data.programSelection.degreeType}</li>
              <li><strong>Intake:</strong> ${data.programSelection.intake}</li>
              <li><strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleDateString()}</li>
            </ul>
          </div>
          
          <h3 style="color: #333;">What happens next?</h3>
          <ol style="color: #666; line-height: 1.8;">
            <li>Your application will be reviewed by our admissions team</li>
            <li>You will receive updates on your application status via email</li>
            <li>Additional documents may be requested if needed</li>
            <li>Final decision will be communicated within 2-4 weeks</li>
          </ol>
          
          <div style="background: #e8f5e9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #2e7d32;"><strong>Application Status:</strong> Under Review</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">If you have any questions, please don't hesitate to contact us at <a href="mailto:admissions@visaclass.com" style="color: #667eea;">admissions@visaclass.com</a></p>
          
          <p style="color: #666; line-height: 1.6;">Best regards,<br>The VISACLASS Admissions Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © 2024 VISACLASS. All rights reserved. | 
            <a href="#" style="color: #667eea;">Privacy Policy</a> | 
            <a href="#" style="color: #667eea;">Terms of Service</a>
          </p>
        </div>
      </div>
    `,
  }),

  applicationStatusChanged: (data) => ({
    subject: `Application Status Update - ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">VISACLASS</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">University Application System</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-bottom: 20px;">Application Status Update</h2>
          
          <p style="color: #666; line-height: 1.6;">Dear ${data.personalInfo.firstName} ${data.personalInfo.lastName},</p>
          
          <p style="color: #666; line-height: 1.6;">We're writing to inform you that your application status has been updated.</p>
          
          <div style="background: ${data.status === 'approved' ? '#e8f5e9' : data.status === 'rejected' ? '#ffebee' : '#fff3e0'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${data.status === 'approved' ? '#4caf50' : data.status === 'rejected' ? '#f44336' : '#ff9800'};">
            <p style="margin: 0; color: ${data.status === 'approved' ? '#2e7d32' : data.status === 'rejected' ? '#c62828' : '#e65100'};">
              <strong>New Status:</strong> ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}
            </p>
          </div>
          
          ${data.adminNotes ? `
            <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #333;">Additional Notes:</h4>
              <p style="margin: 0; color: #666; line-height: 1.6;">${data.adminNotes}</p>
            </div>
          ` : ''}
          
          ${data.rejectionReason ? `
            <div style="background: #ffebee; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #c62828;">Reason for Rejection:</h4>
              <p style="margin: 0; color: #666; line-height: 1.6;">${data.rejectionReason}</p>
            </div>
          ` : ''}
          
          ${data.status === 'approved' ? `
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <h3 style="margin: 0 0 10px 0; color: #1976d2;">🎉 Congratulations!</h3>
              <p style="margin: 0; color: #666; line-height: 1.6;">Your application has been approved! You will receive further instructions regarding enrollment, visa requirements, and next steps.</p>
            </div>
          ` : ''}
          
          <p style="color: #666; line-height: 1.6;">If you have any questions about this update, please contact our admissions team.</p>
          
          <p style="color: #666; line-height: 1.6;">Best regards,<br>The VISACLASS Admissions Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © 2024 VISACLASS. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  contactFormSubmitted: (data) => ({
    subject: `New Contact Form Submission: ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">VISACLASS</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">New Contact Form Submission</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-bottom: 20px;">Contact Form Details</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Information:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Name:</strong> ${data.name}</li>
              <li><strong>Email:</strong> ${data.email}</li>
              ${data.phone ? `<li><strong>Phone:</strong> ${data.phone}</li>` : ''}
              ${data.country ? `<li><strong>Country:</strong> ${data.country}</li>` : ''}
              <li><strong>Subject:</strong> ${data.subject}</li>
              <li><strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleDateString()}</li>
            </ul>
          </div>
          
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="mailto:${data.email}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reply to Sender
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © 2024 VISACLASS. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  autoReplyContact: (data) => ({
    subject: 'Thank you for contacting VISACLASS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">VISACLASS</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">University Application System</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-bottom: 20px;">Thank you for contacting us!</h2>
          
          <p style="color: #666; line-height: 1.6;">Dear ${data.name},</p>
          
          <p style="color: #666; line-height: 1.6;">We have received your message regarding "<strong>${data.subject}</strong>" and will get back to you within 24-48 hours.</p>
          
          <div style="background: #e8f5e9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #2e7d32;"><strong>Reference ID:</strong> ${data.contactId}</p>
          </div>
          
          <h3 style="color: #333;">Your Message:</h3>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 10px 0;">
            <p style="margin: 0; color: #666; line-height: 1.6;">${data.message}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">In the meantime, you can explore our website for more information about universities and programs.</p>
          
          <p style="color: #666; line-height: 1.6;">Best regards,<br>The VISACLASS Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © 2024 VISACLASS. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  // Booking system email templates
  welcome: (data) => ({
    subject: `Welcome to VISACLASS Booking System, ${data.passengerName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to VISACLASS! 🎉</h2>
        <p>Dear ${data.passengerName},</p>
        <p>Thank you for registering with VISACLASS Booking System. Your account has been successfully created.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your Account Details:</h3>
          <p><strong>Passenger ID:</strong> ${data.passengerId}</p>
          <p><strong>Email:</strong> ${data.to}</p>
        </div>
        <p>You can now book flights, manage your reservations, and enjoy our premium services.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <br>
        <p>Best regards,<br>The VISACLASS Team</p>
      </div>
    `,
    text: `Welcome to VISACLASS! Dear ${data.passengerName}, Thank you for registering. Your account has been created successfully. Passenger ID: ${data.passengerId}`
  }),

  booking_created: (data) => ({
    subject: `Booking Confirmation - ${data.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Booking Created Successfully ✈️</h2>
        <p>Dear ${data.passengerName},</p>
        <p>Your booking has been created successfully. Here are your booking details:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details:</h3>
          <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
          <p><strong>Trip Type:</strong> ${data.trip_type.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Route:</strong> ${data.origin} → ${data.destination}</p>
          <p><strong>Departure Date:</strong> ${new Date(data.departureDate).toLocaleDateString()}</p>
          ${data.returnDate ? `<p><strong>Return Date:</strong> ${new Date(data.returnDate).toLocaleDateString()}</p>` : ''}
          <p><strong>Passengers:</strong> ${data.passengersCount}</p>
          <p><strong>Total Amount:</strong> ${data.currency} ${data.totalAmount.toFixed(2)}</p>
        </div>
        
        <p><strong>Important:</strong> Your booking is currently pending. Please complete the payment to confirm your reservation.</p>
        <p>You will receive another email once your payment is processed.</p>
        
        <br>
        <p>Best regards,<br>The VISACLASS Team</p>
      </div>
    `,
    text: `Booking Created - ${data.bookingReference}. Dear ${data.passengerName}, Your booking from ${data.origin} to ${data.destination} on ${data.departureDate} has been created. Total: ${data.currency} ${data.totalAmount}. Please complete payment to confirm.`
  }),

  payment_confirmation: (data) => ({
    subject: `Payment Confirmed - ${data.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Payment Confirmed! ✅</h2>
        <p>Dear ${data.passengerName},</p>
        <p>Your payment has been successfully processed and your booking is now confirmed.</p>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #10b981;">
          <h3>Payment Details:</h3>
          <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
          <p><strong>Amount Paid:</strong> ${data.currency} ${data.amount.toFixed(2)}</p>
          <p><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: bold;">CONFIRMED</span></p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20pxpx; border-radius: 8px; margin: 20px 0;">
          <h3>What's Next?</h3>
          <ul>
            <li>You will receive your e-ticket 24 hours before departure</li>
            <li>Check-in opens 24 hours before your flight</li>
            <li>Please arrive at the airport at least 2 hours before departure</li>
          </ul>
        </div>
        
        ${data.receiptUrl ? `<p><a href="${data.receiptUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Receipt</a></p>` : ''}
        
        <br>
        <p>Best regards,<br>The VISACLASS Team</p>
      </div>
    `,
    text: `Payment Confirmed - ${data.bookingReference}. Dear ${data.passengerName}, Your payment of ${data.currency} ${data.amount} has been processed successfully. Your booking is now confirmed.`
  }),

  booking_cancelled: (data) => ({
    subject: `Booking Cancelled - ${data.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Booking Cancelled</h2>
        <p>Dear ${data.passengerName},</p>
        <p>Your booking has been cancelled as requested.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ef4444;">
          <h3>Cancellation Details:</h3>
          <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
          <p><strong>Cancellation Reason:</strong> ${data.reason}</p>
          <p><strong>Status:</strong> <span style="color: #ef4444; font-weight: bold;">CANCELLED</span></p>
        </div>
        
        <p>If you didn't request this cancellation, please contact our support team immediately.</p>
        
        <br>
        <p>Best regards,<br>The VISACLASS Team</p>
      </div>
    `,
    text: `Booking Cancelled - ${data.bookingReference}. Dear ${data.passengerName}, Your booking has been cancelled. Reason: ${data.reason}. If this wasn't requested, please contact support.`
  }),
};

// Email service class
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Only initialize if we have proper email credentials
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
          process.env.EMAIL_USER !== 'your-email@gmail.com') {
        this.transporter = createTransporter();
        console.log('✅ Email service initialized');
      } else {
        console.log('⚠️  Email credentials not configured. Email notifications disabled.');
        console.log('   To enable emails, configure EMAIL_USER and EMAIL_PASS in .env');
      }
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
    }
  }

  async sendEmail(to, subject, html) {
    if (!this.transporter) {
      console.log('📧 Email service not configured - would send to:', to, 'with subject:', subject);
      return { messageId: 'mock-email-id', service: 'disabled' };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  async sendApplicationConfirmation(applicantData) {
    const template = emailTemplates.applicationSubmitted(applicantData);
    return this.sendEmail(applicantData.personalInfo.email, template.subject, template.html);
  }

  async sendApplicationStatusUpdate(applicantData) {
    const template = emailTemplates.applicationStatusChanged(applicantData);
    return this.sendEmail(applicantData.personalInfo.email, template.subject, template.html);
  }

  async sendContactNotification(contactData) {
    const template = emailTemplates.contactFormSubmitted(contactData);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@visaclass.com';
    return this.sendEmail(adminEmail, template.subject, template.html);
  }

  async sendContactAutoReply(contactData) {
    const template = emailTemplates.autoReplyContact(contactData);
    return this.sendEmail(contactData.email, template.subject, template.html);
  }

  // Booking system email methods
  async sendWelcomeEmail(passengerData) {
    const template = emailTemplates.welcome(passengerData);
    return this.sendEmail(passengerData.to || passengerData.email, template.subject, template.html);
  }

  async sendBookingConfirmation(bookingData) {
    const template = emailTemplates.booking_created(bookingData);
    return this.sendEmail(bookingData.to || bookingData.email, template.subject, template.html);
  }

  async sendPaymentConfirmation(paymentData) {
    const template = emailTemplates.payment_confirmation(paymentData);
    return this.sendEmail(paymentData.to || paymentData.email, template.subject, template.html);
  }

  async sendBookingCancellation(cancellationData) {
    const template = emailTemplates.booking_cancelled(cancellationData);
    return this.sendEmail(cancellationData.to || cancellationData.email, template.subject, template.html);
  }

  // Enhanced sendEmail function with database logging
  async sendEmailWithLogging(options) {
    try {
      // Get template if provided
      let emailContent;
      if (options.template && emailTemplates[options.template]) {
        emailContent = emailTemplates[options.template](options);
      } else {
        emailContent = {
          subject: options.subject,
          html: options.html || options.text,
          text: options.text
        };
      }
      
      // Send email
      const result = await this.sendEmail(options.to, emailContent.subject, emailContent.html);
      
      // Log to database if passenger_id or booking_id is provided
      if (options.passengerId || options.bookingId) {
        try {
          await queryDatabase(
            `INSERT INTO email_logs (passenger_id, booking_id, to_email, subject, template, status, sent_at) 
             VALUES (?, ?, ?, ?, ?, 'sent', CURRENT_TIMESTAMP)`,
            [
              options.passengerId || null,
              options.bookingId || null,
              options.to,
              emailContent.subject,
              options.template || null
            ]
          );
        } catch (dbError) {
          console.error('Failed to log email to database:', dbError);
        }
      }
      
      return {
        success: true,
        messageId: result.messageId,
        to: options.to,
        subject: emailContent.subject
      };
      
    } catch (error) {
      console.error('Email sending failed:', error);
      
      // Log email failure to database
      if (options.passengerId || options.bookingId) {
        try {
          await queryDatabase(
            `INSERT INTO email_logs (passenger_id, booking_id, to_email, subject, template, status, error_message) 
             VALUES (?, ?, ?, ?, ?, 'failed', ?)`,
            [
              options.passengerId || null,
              options.bookingId || null,
              options.to,
              options.subject,
              options.template || null,
              error.message
            ]
          );
        } catch (dbError) {
          console.error('Failed to log email failure to database:', dbError);
        }
      }
      
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  async testConnection() {
    if (!this.transporter) {
      console.log('⚠️  Email service not initialized - skipping connection test');
      return true;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const emailService = new EmailService();

// Export individual functions for easier imports
export const sendEmail = async (options) => {
  return await emailService.sendEmailWithLogging(options);
};

// Test email connection on startup
emailService.testConnection().catch(console.error);

export default emailService;
