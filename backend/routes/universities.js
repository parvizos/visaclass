import express from 'express';
import { queryDatabase } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all universities
router.get('/', async (req, res) => {
  try {
    const { city, search } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (city) {
      whereClause += ' AND city = ?';
      params.push(city);
    }

    if (search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const universities = await queryDatabase(
      `SELECT * FROM universities ${whereClause} ORDER BY name`,
      params
    );

    res.json({
      success: true,
      data: universities
    });

  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get universities'
    });
  }
});

// Get university by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const universities = await queryDatabase(
      `SELECT u.*, 
              (SELECT COUNT(*) FROM applications WHERE target_university = u.id) as application_count
       FROM universities u 
       WHERE u.id = ?`,
      [id]
    );

    if (universities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    // Get programs for this university
    const programs = await queryDatabase(
      'SELECT * FROM programs WHERE university_id = ? ORDER BY program_name',
      [id]
    );

    const university = universities[0];
    university.programs = programs;

    res.json({
      success: true,
      data: university
    });

  } catch (error) {
    console.error('Get university error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get university'
    });
  }
});

// Add new university (admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, city, description, website, applicationDeadline } = req.body;

    if (!name || !city) {
      return res.status(400).json({
        success: false,
        message: 'Name and city are required'
      });
    }

    const result = await queryDatabase(
      `INSERT INTO universities (name, city, description, website, application_deadline, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [name, city, description, website, applicationDeadline]
    );

    res.status(201).json({
      success: true,
      message: 'University added successfully',
      data: {
        id: result.insertId,
        name,
        city
      }
    });

  } catch (error) {
    console.error('Add university error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add university'
    });
  }
});

// Update university (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, description, website, applicationDeadline } = req.body;

    const result = await queryDatabase(
      `UPDATE universities 
       SET name = ?, city = ?, description = ?, website = ?, application_deadline = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, city, description, website, applicationDeadline, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    res.json({
      success: true,
      message: 'University updated successfully'
    });

  } catch (error) {
    console.error('Update university error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update university'
    });
  }
});

// Delete university (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if university has applications
    const applications = await queryDatabase(
      'SELECT COUNT(*) as count FROM applications WHERE target_university = ?',
      [id]
    );

    if (applications[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete university with existing applications'
      });
    }

    const result = await queryDatabase(
      'DELETE FROM universities WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    res.json({
      success: true,
      message: 'University deleted successfully'
    });

  } catch (error) {
    console.error('Delete university error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete university'
    });
  }
});

// Get university statistics
router.get('/:id/stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const stats = await queryDatabase(
      `SELECT 
              COUNT(*) as total_applications,
              COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_applications,
              COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_applications,
              COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_applications
       FROM applications 
       WHERE target_university = ?`,
      [id]
    );

    res.json({
      success: true,
      data: stats[0]
    });

  } catch (error) {
    console.error('Get university stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get university statistics'
    });
  }
});

export default router;
