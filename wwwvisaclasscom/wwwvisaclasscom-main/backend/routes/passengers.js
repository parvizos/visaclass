import express from 'express';
import Joi from 'joi';
import { queryDatabase } from '../config/database-sqlite.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Validation schemas
const passengerSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).required(),
  last_name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).optional(),
  date_of_birth: Joi.date().optional(),
  passport_number: Joi.string().max(50).optional(),
  nationality: Joi.string().max(100).optional()
});

const bookingSchema = Joi.object({
  passenger_id: Joi.number().integer().positive().required(),
  trip_type: Joi.string().valid('one_way', 'round_trip', 'multi_city').required(),
  origin: Joi.string().min(3).max(100).required(),
  destination: Joi.string().min(3).max(100).required(),
  departure_date: Joi.date().iso().required(),
  return_date: Joi.date().iso().when('trip_type', {
    is: 'round_trip',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  passengers_count: Joi.number().integer().min(1).max(10).default(1),
  total_amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD')
});

// Get all passengers
router.get('/', async (req, res) => {
  try {
    const passengers = await queryDatabase(
      'SELECT id, first_name, last_name, email, phone, nationality, created_at FROM passengers ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      data: passengers,
      count: passengers.length
    });
  } catch (error) {
    console.error('Error fetching passengers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch passengers'
    });
  }
});

// Get passenger by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const passenger = await queryDatabase(
      'SELECT * FROM passengers WHERE id = ?',
      [id]
    );
    
    if (passenger.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }
    
    res.json({
      success: true,
      data: passenger[0]
    });
  } catch (error) {
    console.error('Error fetching passenger:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch passenger'
    });
  }
});

// Create new passenger
router.post('/', async (req, res) => {
  try {
    const { error, value } = passengerSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    // Check if email already exists
    const existingPassenger = await queryDatabase(
      'SELECT id FROM passengers WHERE email = ?',
      [value.email]
    );
    
    if (existingPassenger.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Passenger with this email already exists'
      });
    }
    
    const result = await queryDatabase(
      `INSERT INTO passengers (first_name, last_name, email, phone, date_of_birth, passport_number, nationality) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        value.first_name,
        value.last_name,
        value.email,
        value.phone || null,
        value.date_of_birth || null,
        value.passport_number || null,
        value.nationality || null
      ]
    );
    
    // Get the created passenger
    const newPassenger = await queryDatabase(
      'SELECT * FROM passengers WHERE id = ?',
      [result.insertId]
    );
    
    // Send welcome email
    try {
      await sendEmail({
        to: value.email,
        subject: 'Welcome to VISACLASS Booking System',
        template: 'welcome',
        passengerName: `${value.first_name} ${value.last_name}`,
        passengerId: result.insertId
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Passenger created successfully',
      data: newPassenger[0]
    });
  } catch (error) {
    console.error('Error creating passenger:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create passenger'
    });
  }
});

// Update passenger
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = passengerSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    // Check if passenger exists
    const existingPassenger = await queryDatabase(
      'SELECT id FROM passengers WHERE id = ?',
      [id]
    );
    
    if (existingPassenger.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }
    
    // Check if email is taken by another passenger
    if (value.email !== existingPassenger[0].email) {
      const emailCheck = await queryDatabase(
        'SELECT id FROM passengers WHERE email = ? AND id != ?',
        [value.email, id]
      );
      
      if (emailCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    await queryDatabase(
      `UPDATE passengers 
       SET first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?, passport_number = ?, nationality = ?
       WHERE id = ?`,
      [
        value.first_name,
        value.last_name,
        value.email,
        value.phone || null,
        value.date_of_birth || null,
        value.passport_number || null,
        value.nationality || null,
        id
      ]
    );
    
    // Get updated passenger
    const updatedPassenger = await queryDatabase(
      'SELECT * FROM passengers WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Passenger updated successfully',
      data: updatedPassenger[0]
    });
  } catch (error) {
    console.error('Error updating passenger:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update passenger'
    });
  }
});

// Delete passenger
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await queryDatabase(
      'DELETE FROM passengers WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Passenger deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting passenger:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete passenger'
    });
  }
});

// Get passenger bookings
router.get('/:id/bookings', async (req, res) => {
  try {
    const { id } = req.params;
    
    const bookings = await queryDatabase(
      `SELECT b.*, p.first_name, p.last_name, p.email 
       FROM bookings b 
       JOIN passengers p ON b.passenger_id = p.id 
       WHERE b.passenger_id = ? 
       ORDER BY b.created_at DESC`,
      [id]
    );
    
    res.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Error fetching passenger bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch passenger bookings'
    });
  }
});

export default router;
