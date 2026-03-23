import nodemailer from 'nodemailer';
import { config } from 'dotenv';

// Load environment variables
config();

async function testEmailConfiguration() {
  console.log('🔧 Testing Email Configuration');
  console.log('================================');

  // Check if email credentials are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not configured');
    console.log('\n📧 Setup Options:');
    console.log('');
    console.log('Option 1: Mailtrap (Recommended for development)');
    console.log('1. Go to https://mailtrap.io/');
    console.log('2. Sign up for free account');
    console.log('3. Go to SMTP Settings');
    console.log('4. Copy credentials to your .env file:');
    console.log('   EMAIL_HOST=smtp.mailtrap.io');
    console.log('   EMAIL_PORT=2525');
    console.log('   EMAIL_USER=your-mailtrap-username');
    console.log('   EMAIL_PASS=your-mailtrap-password');
    console.log('');
    console.log('Option 2: Ethereal Email (No signup required)');
    console.log('Run: node scripts/setup-email.js --ethereal');
    console.log('');
    console.log('Option 3: Gmail (Real emails)');
    console.log('1. Enable 2-factor authentication');
    console.log('2. Generate App Password');
    console.log('3. Update .env with Gmail credentials');
    return;
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Test connection
    await transporter.verify();
    console.log('✅ Email service connected successfully');

    // Send test email
    const testEmail = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: 'VISACLASS - Email Test Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🎉 Email Test Successful!</h2>
          <p>Your VISACLASS email service is working correctly.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Configuration Details:</h3>
            <p><strong>Host:</strong> ${process.env.EMAIL_HOST}</p>
            <p><strong>Port:</strong> ${process.env.EMAIL_PORT}</p>
            <p><strong>User:</strong> ${process.env.EMAIL_USER}</p>
            <p><strong>Secure:</strong> ${process.env.EMAIL_SECURE}</p>
          </div>
          <p>Your booking system can now send emails for:</p>
          <ul>
            <li>Passenger registration confirmations</li>
            <li>Booking confirmations</li>
            <li>Payment receipts</li>
            <li>Booking cancellations</li>
          </ul>
        </div>
      `,
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully');
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log('🎉 Email service is ready to use!');

  } catch (error) {
    console.error('❌ Email configuration failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your email credentials');
    console.log('2. Verify SMTP settings');
    console.log('3. Check network connection');
    console.log('4. Try alternative email service');
  }
}

async function setupEtherealEmail() {
  console.log('🔧 Setting up Ethereal Email');
  console.log('==============================');

  try {
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('✅ Ethereal account created successfully');
    console.log('\n📧 Copy these credentials to your .env file:');
    console.log('');
    console.log('EMAIL_HOST=smtp.ethereal.email');
    console.log('EMAIL_PORT=587');
    console.log('EMAIL_SECURE=false');
    console.log(`EMAIL_USER=${testAccount.user}`);
    console.log(`EMAIL_PASS=${testAccount.pass}`);
    console.log('');
    console.log('🌐 View test emails at: https://ethereal.email/messages');
    
    // Test the account
    const transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const testEmail = {
      from: process.env.EMAIL_FROM,
      to: testAccount.user,
      subject: 'VISACLASS - Ethereal Email Test',
      html: '<h1>Success!</h1><p>Your Ethereal email setup is working.</p>',
    };

    const result = await transporter.sendMail(testEmail);
    console.log(`\n✅ Test email sent! Preview: ${nodemailer.getTestMessageUrl(result)}`);

  } catch (error) {
    console.error('❌ Ethereal setup failed:', error.message);
  }
}

// Command line interface
const args = process.argv.slice(2);

if (args.includes('--ethereal')) {
  setupEtherealEmail();
} else {
  testEmailConfiguration();
}
