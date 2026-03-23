-- VISACLASS Booking System Database Schema
-- MySQL Database

CREATE DATABASE IF NOT EXISTS visaclass_booking;
USE visaclass_booking;

-- Passengers table
CREATE TABLE IF NOT EXISTS passengers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  passport_number VARCHAR(50),
  nationality VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_name (last_name, first_name)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  passenger_id INT NOT NULL,
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  trip_type ENUM('one_way', 'round_trip', 'multi_city') NOT NULL,
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  passengers_count INT NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (passenger_id) REFERENCES passengers(id) ON DELETE CASCADE,
  INDEX idx_passenger (passenger_id),
  INDEX idx_reference (booking_reference),
  INDEX idx_status (status),
  INDEX idx_dates (departure_date, return_date)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  stripe_payment_intent_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('pending', 'succeeded', 'failed', 'canceled') NOT NULL,
  payment_method VARCHAR(50),
  stripe_receipt_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking (booking_id),
  INDEX idx_stripe_intent (stripe_payment_intent_id),
  INDEX idx_status (status)
);

-- Email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  passenger_id INT,
  booking_id INT,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  template VARCHAR(100),
  status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (passenger_id) REFERENCES passengers(id) ON DELETE SET NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_passenger (passenger_id),
  INDEX idx_booking (booking_id),
  INDEX idx_status (status),
  INDEX idx_email (to_email)
);

-- Insert sample data (optional)
-- This can be removed in production
INSERT IGNORE INTO passengers (first_name, last_name, email, phone, date_of_birth, nationality) 
VALUES 
('John', 'Doe', 'john.doe@example.com', '+1234567890', '1990-01-15', 'US'),
('Jane', 'Smith', 'jane.smith@example.com', '+0987654321', '1985-05-22', 'UK');

COMMIT;
