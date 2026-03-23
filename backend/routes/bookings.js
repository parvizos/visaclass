import express from 'express';
import Joi from 'joi';
import { queryDatabase } from '../config/database-sqlite.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Validation schemas
const bookingSchema = Joi.object({
  passenger_id: Joi.number().integer().positive().required(),
  trip_type: Joi.string().valid('one_way', 'round_trip', 'multi_city').required(),
  origin: Joi.string().min(3).max(100).required(),
  destination: Joi.string().min(3).max(100).required(),
  departure_date: Joi.date().iso().required(),
  return_date: Joi.date().iso().when('trip_type', {
    is: 'round_trip',
    then: Joi.date().iso().min(Joi.ref('departure_date')).required(),
    otherwise: Joi.optional()
  }),
  passengers_count: Joi.number().integer().min(1).max(10).default(1),
  total_amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD')
});

// Generate unique booking reference
function generateBookingReference() {
  const prefix = 'VC';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const { status, payment_status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT b.*, p.first_name, p.last_name, p.email 
      FROM bookings b 
      JOIN passengers p ON b.passenger_id = p.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    
    if (payment_status) {
      query += ' AND b.payment_status = ?';
      params.push(payment_status);
    }
    
    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const bookings = await queryDatabase(query, params);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM bookings b 
      WHERE 1=1
      ${status ? 'AND b.status = ?' : ''}
      ${payment_status ? 'AND b.payment_status = ?' : ''}
    `;
    const countParams = [];
    if (status) countParams.push(status);
    if (payment_status) countParams.push(payment_status);
    
    const countResult = await queryDatabase(countQuery, countParams);
    
    res.json({
      success: true,
      data: bookings,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < countResult[0].total
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await queryDatabase(
      `SELECT b.*, p.first_name, p.last_name, p.email, p.phone, p.nationality
       FROM bookings b 
       JOIN passengers p ON b.passenger_id = p.id 
       WHERE b.id = ?`,
      [id]
    );
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Get payment information
    const payments = await queryDatabase(
      'SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC',
      [id]
    );
    
    res.json({
      success: true,
      data: {
        ...booking[0],
        payments
      }
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    const { error, value } = bookingSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    // Check if passenger exists
    const passenger = await queryDatabase(
      'SELECT * FROM passengers WHERE id = ?',
      [value.passenger_id]
    );
    
    if (passenger.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }
    
    // Generate unique booking reference
    let bookingReference;
    let referenceExists = true;
    let attempts = 0;
    
    while (referenceExists && attempts < 10) {
      bookingReference = generateBookingReference();
      const existing = await queryDatabase(
        'SELECT id FROM bookings WHERE booking_reference = ?',
        [bookingReference]
      );
      referenceExists = existing.length > 0;
      attempts++;
    }
    
    if (referenceExists) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate unique booking reference'
      });
    }
    
    // Create booking
    const result = await queryDatabase(
      `INSERT INTO bookings 
       (passenger_id, booking_reference, trip_type, origin, destination, 
        departure_date, return_date, passengers_count, total_amount, currency, 
        status, payment_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        value.passenger_id,
        bookingReference,
        value.trip_type,
        value.origin,
        value.destination,
        value.departure_date,
        value.return_date || null,
        value.passengers_count,
        value.total_amount,
        value.currency,
        'pending',
        'pending'
      ]
    );
    
    // Get the created booking
    const newBooking = await queryDatabase(
      `SELECT b.*, p.first_name, p.last_name, p.email 
       FROM bookings b 
       JOIN passengers p ON b.passenger_id = p.id 
       WHERE b.id = ?`,
      [result.insertId]
    );
    
    // Send booking confirmation email
    try {
      await sendEmail({
        to: passenger[0].email,
        subject: `Booking Created - ${bookingReference}`,
        template: 'booking_created',
        passengerName: `${passenger[0].first_name} ${passenger[0].last_name}`,
        bookingReference,
        origin: value.origin,
        destination: value.destination,
        departureDate: value.departure_date,
        returnDate: value.return_date,
        passengersCount: value.passengers_count,
        totalAmount: value.total_amount,
        currency: value.currency
      });
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking[0]
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// Update booking
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = bookingSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    // Check if booking exists
    const existingBooking = await queryDatabase(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );
    
    if (existingBooking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Don't allow updates if booking is confirmed or completed
    if (['confirmed', 'completed'].includes(existingBooking[0].status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update confirmed or completed booking'
      });
    }
    
    await queryDatabase(
      `UPDATE bookings 
       SET trip_type = ?, origin = ?, destination = ?, departure_date = ?, 
           return_date = ?, passengers_count = ?, total_amount = ?, currency = ?
       WHERE id = ?`,
      [
        value.trip_type,
        value.origin,
        value.destination,
        value.departure_date,
        value.return_date || null,
        value.passengers_count,
        value.total_amount,
        value.currency,
        id
      ]
    );
    
    // Get updated booking
    const updatedBooking = await queryDatabase(
      `SELECT b.*, p.first_name, p.last_name, p.email 
       FROM bookings b 
       JOIN passengers p ON b.passenger_id = p.id 
       WHERE b.id = ?`,
      [id]
    );
    
    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking[0]
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking'
    });
  }
});

// Cancel booking
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Check if booking exists
    const booking = await queryDatabase(
      `SELECT b.*, p.first_name, p.last_name, p.email 
       FROM bookings b 
       JOIN passengers p ON b.passenger_id = p.id 
       WHERE b.id = ?`,
      [id]
    );
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Don't allow cancellation if already cancelled or completed
    if (['cancelled', 'completed'].includes(booking[0].status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking[0].status}`
      });
    }
    
    await queryDatabase(
      'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['cancelled', id]
    );
    
    // Send cancellation email
    try {
      await sendEmail({
        to: booking[0].email,
        subject: `Booking Cancelled - ${booking[0].booking_reference}`,
        template: 'booking_cancelled',
        passengerName: `${booking[0].first_name} ${booking[0].last_name}`,
        bookingReference: booking[0].booking_reference,
        reason: reason || 'No reason provided'
      });
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

// Search bookings
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20 } = req.query;
    
    const searchQuery = `
      SELECT b.*, p.first_name, p.last_name, p.email 
      FROM bookings b 
      JOIN passengers p ON b.passenger_id = p.id 
      WHERE b.booking_reference LIKE ? 
         OR p.first_name LIKE ? 
         OR p.last_name LIKE ? 
         OR p.email LIKE ?
      ORDER BY b.created_at DESC 
      LIMIT ?`;
    
    const searchPattern = `%${query}%`;
    const bookings = await queryDatabase(searchQuery, [
      searchPattern, searchPattern, searchPattern, searchPattern, 
      parseInt(limit)
    ]);
    
    res.json({
      success: true,
      data: bookings,
      count: bookings.length,
      query
    });
  } catch (error) {
    console.error('Error searching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search bookings'
    });
  }
});

export default router;
