import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { queryDatabase } from '../config/database.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Register new student
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, nationality } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !nationality) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if student already exists
    const existingStudent = await queryDatabase(
      'SELECT id FROM students WHERE email = ?',
      [email]
    );

    if (existingStudent.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const result = await queryDatabase(
      `INSERT INTO students (first_name, last_name, email, password, nationality, email_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [firstName, lastName, email, hashedPassword, nationality]
    );

    // Generate verification token
    const verificationToken = jwt.sign(
      { studentId: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: 'Verify Your Email - VISACLASS',
        template: 'email_verification',
        studentName: `${firstName} ${lastName}`,
        verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        studentId: result.insertId,
        email: email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Login student
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find student
    const students = await queryDatabase(
      'SELECT * FROM students WHERE email = ?',
      [email]
    );

    if (students.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const student = students[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!student.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        studentId: student.id, 
        email: student.email,
        role: 'student'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        student: {
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          email: student.email,
          nationality: student.nationality,
          emailVerified: student.email_verified
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Verify email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { studentId, email } = decoded;

    // Update email verification status
    await queryDatabase(
      'UPDATE students SET email_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [studentId]
    );

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token'
    });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if student exists
    const students = await queryDatabase(
      'SELECT id, first_name FROM students WHERE email = ?',
      [email]
    );

    if (students.length === 0) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    const student = students[0];

    // Generate reset token
    const resetToken = jwt.sign(
      { studentId: student.id, email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send reset email
    try {
      await sendEmail({
        to: email,
        subject: 'Reset Your Password - VISACLASS',
        template: 'password_reset',
        studentName: student.first_name,
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
    }

    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request'
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { studentId } = decoded;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await queryDatabase(
      'UPDATE students SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, studentId]
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin
    const admins = await queryDatabase(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const admin = admins[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        email: admin.email,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin login failed'
    });
  }
});

export default router;
