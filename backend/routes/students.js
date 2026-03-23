import express from 'express';
import { queryDatabase } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get student profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.studentId;
    
    const students = await queryDatabase(
      `SELECT id, first_name, last_name, email, nationality, passport_number, 
              email_verified, created_at, updated_at 
       FROM students WHERE id = ?`,
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const student = students[0];

    // Get student's applications
    const applications = await queryDatabase(
      `SELECT a.*, u.name as university_name, p.program_name
       FROM applications a
       LEFT JOIN universities u ON a.target_university = u.id
       LEFT JOIN programs p ON a.target_program = p.id
       WHERE a.student_id = ?
       ORDER BY a.created_at DESC`,
      [studentId]
    );

    res.json({
      success: true,
      data: {
        student,
        applications
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

// Update student profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.studentId;
    const { firstName, lastName, nationality, passportNumber } = req.body;

    const result = await queryDatabase(
      `UPDATE students 
       SET first_name = ?, last_name = ?, nationality = ?, passport_number = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [firstName, lastName, nationality, passportNumber, studentId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get student's applications
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.studentId;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE a.student_id = ?';
    const params = [studentId];

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    const applications = await queryDatabase(
      `SELECT a.*, u.name as university_name, p.program_name
       FROM applications a
       LEFT JOIN universities u ON a.target_university = u.id
       LEFT JOIN programs p ON a.target_program = p.id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const totalCount = await queryDatabase(
      `SELECT COUNT(*) as count FROM applications a ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get applications'
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.studentId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get current password
    const students = await queryDatabase(
      'SELECT password FROM students WHERE id = ?',
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify current password
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(currentPassword, students[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await queryDatabase(
      'UPDATE students SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, studentId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

export default router;
