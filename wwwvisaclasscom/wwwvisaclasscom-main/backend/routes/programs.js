import express from 'express';
import { queryDatabase } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all programs
router.get('/', async (req, res) => {
  try {
    const { universityId, search, degreeLevel } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (universityId) {
      whereClause += ' AND university_id = ?';
      params.push(universityId);
    }

    if (search) {
      whereClause += ' AND (program_name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (degreeLevel) {
      whereClause += ' AND degree_level = ?';
      params.push(degreeLevel);
    }

    const programs = await queryDatabase(
      `SELECT p.*, u.name as university_name, u.city
       FROM programs p
       LEFT JOIN universities u ON p.university_id = u.id
       ${whereClause}
       ORDER BY p.program_name`,
      params
    );

    res.json({
      success: true,
      data: programs
    });

  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get programs'
    });
  }
});

// Get program by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const programs = await queryDatabase(
      `SELECT p.*, u.name as university_name, u.city, u.website
       FROM programs p
       LEFT JOIN universities u ON p.university_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (programs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    // Get application statistics for this program
    const stats = await queryDatabase(
      `SELECT 
              COUNT(*) as total_applications,
              COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_applications,
              COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_applications
       FROM applications 
       WHERE target_program = ?`,
      [id]
    );

    const program = programs[0];
    program.stats = stats[0];

    res.json({
      success: true,
      data: program
    });

  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get program'
    });
  }
});

// Add new program (admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { 
      universityId, 
      programName, 
      degreeLevel, 
      duration, 
      tuitionFee, 
      description, 
      requirements,
      applicationDeadline 
    } = req.body;

    if (!universityId || !programName || !degreeLevel || !tuitionFee) {
      return res.status(400).json({
        success: false,
        message: 'University ID, program name, degree level, and tuition fee are required'
      });
    }

    const result = await queryDatabase(
      `INSERT INTO programs 
       (university_id, program_name, degree_level, duration, tuition_fee, description, requirements, application_deadline, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [universityId, programName, degreeLevel, duration, tuitionFee, description, requirements, applicationDeadline]
    );

    res.status(201).json({
      success: true,
      message: 'Program added successfully',
      data: {
        id: result.insertId,
        programName,
        degreeLevel
      }
    });

  } catch (error) {
    console.error('Add program error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add program'
    });
  }
});

// Update program (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      universityId, 
      programName, 
      degreeLevel, 
      duration, 
      tuitionFee, 
      description, 
      requirements,
      applicationDeadline 
    } = req.body;

    const result = await queryDatabase(
      `UPDATE programs 
       SET university_id = ?, program_name = ?, degree_level = ?, duration = ?, 
           tuition_fee = ?, description = ?, requirements = ?, application_deadline = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [universityId, programName, degreeLevel, duration, tuitionFee, description, requirements, applicationDeadline, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.json({
      success: true,
      message: 'Program updated successfully'
    });

  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update program'
    });
  }
});

// Delete program (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if program has applications
    const applications = await queryDatabase(
      'SELECT COUNT(*) as count FROM applications WHERE target_program = ?',
      [id]
    );

    if (applications[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete program with existing applications'
      });
    }

    const result = await queryDatabase(
      'DELETE FROM programs WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.json({
      success: true,
      message: 'Program deleted successfully'
    });

  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete program'
    });
  }
});

export default router;
