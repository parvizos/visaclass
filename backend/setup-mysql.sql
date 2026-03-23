-- Create database
CREATE DATABASE IF NOT EXISTS visaclass_booking;
USE visaclass_booking;

-- Create passengers table
CREATE TABLE IF NOT EXISTS passengers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  date_of_birth DATE,
  passport_number VARCHAR(100),
  nationality VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  passenger_id INT NOT NULL,
  booking_reference VARCHAR(255) UNIQUE NOT NULL,
  trip_type ENUM('one_way', 'round_trip', 'multi_city') NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
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
  FOREIGN KEY (passenger_id) REFERENCES passengers(id) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  stripe_payment_intent_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('pending', 'succeeded', 'failed', 'canceled') NOT NULL,
  payment_method VARCHAR(100),
  stripe_receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Create email_logs table
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
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  nationality VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  passport_number VARCHAR(100) NOT NULL,
  applying_for ENUM('bachelor', 'master', 'phd') NOT NULL,
  last_education TEXT NOT NULL,
  gpa VARCHAR(10) NOT NULL,
  program_language ENUM('english', 'turkish') NOT NULL,
  target_program VARCHAR(255) NOT NULL,
  target_university VARCHAR(255),
  can_pay_tuition BOOLEAN DEFAULT FALSE,
  needs_scholarship BOOLEAN DEFAULT FALSE,
  monthly_budget VARCHAR(50),
  documents TEXT,
  payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
  status ENUM('pending', 'under_review', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create application_payments table
CREATE TABLE IF NOT EXISTS application_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  payment_reference VARCHAR(255) UNIQUE NOT NULL,
  stripe_payment_intent_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_type ENUM('application_fee', 'tuition_deposit', 'full_tuition', 'service_fee') NOT NULL,
  status ENUM('pending', 'succeeded', 'failed', 'canceled', 'refunded') NOT NULL,
  payment_method VARCHAR(100),
  stripe_receipt_url TEXT,
  refund_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT IGNORE INTO passengers (first_name, last_name, email, phone, date_of_birth, nationality) 
VALUES 
  ('John', 'Doe', 'john.doe@example.com', '+1234567890', '1990-01-15', 'US'),
  ('Jane', 'Smith', 'jane.smith@example.com', '+0987654321', '1985-05-22', 'UK');
