import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export const connectDatabase = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, '..', 'database.sqlite'),
      driver: sqlite3.Database
    });
    
    console.log('✅ SQLite database connected successfully');
    
    // Create tables
    await createTables();
    
    return db;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const createTables = async () => {
  try {
    // Create passengers table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS passengers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        date_of_birth TEXT,
        passport_number TEXT,
        nationality TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create bookings table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        passenger_id INTEGER NOT NULL,
        booking_reference TEXT UNIQUE NOT NULL,
        trip_type TEXT NOT NULL CHECK(trip_type IN ('one_way', 'round_trip', 'multi_city')),
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        departure_date TEXT NOT NULL,
        return_date TEXT,
        passengers_count INTEGER NOT NULL DEFAULT 1,
        total_amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'refunded', 'failed')),
        stripe_payment_intent_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (passenger_id) REFERENCES passengers(id) ON DELETE CASCADE
      )
    `);

    // Create payments table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        stripe_payment_intent_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT NOT NULL CHECK(status IN ('pending', 'succeeded', 'failed', 'canceled')),
        payment_method TEXT,
        stripe_receipt_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `);

    // Create email_logs table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        passenger_id INTEGER,
        booking_id INTEGER,
        to_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        template TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('sent', 'failed', 'pending')),
        error_message TEXT,
        sent_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (passenger_id) REFERENCES passengers(id) ON DELETE SET NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
      )
    `);

    // Create applications table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        nationality TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        passport_number TEXT NOT NULL,
        applying_for TEXT NOT NULL CHECK(applying_for IN ('bachelor', 'master', 'phd')),
        last_education TEXT NOT NULL,
        gpa TEXT NOT NULL,
        program_language TEXT NOT NULL CHECK(program_language IN ('english', 'turkish')),
        target_program TEXT NOT NULL,
        target_university TEXT,
        can_pay_tuition BOOLEAN DEFAULT 0,
        needs_scholarship BOOLEAN DEFAULT 0,
        monthly_budget TEXT,
        documents TEXT,
        payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'refunded', 'failed')),
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'under_review', 'accepted', 'rejected')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create application_payments table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS application_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        payment_reference TEXT UNIQUE NOT NULL,
        stripe_payment_intent_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        payment_type TEXT NOT NULL CHECK(payment_type IN ('application_fee', 'tuition_deposit', 'full_tuition', 'service_fee')),
        status TEXT NOT NULL CHECK(status IN ('pending', 'succeeded', 'failed', 'canceled', 'refunded')),
        payment_method TEXT,
        stripe_receipt_url TEXT,
        refund_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
      )
    `);

    // Insert sample data
    await db.exec(`
      INSERT OR IGNORE INTO passengers (first_name, last_name, email, phone, date_of_birth, nationality) 
      VALUES 
        ('John', 'Doe', 'john.doe@example.com', '+1234567890', '1990-01-15', 'US'),
        ('Jane', 'Smith', 'jane.smith@example.com', '+0987654321', '1985-05-22', 'UK')
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Failed to create tables:', error.message);
    throw error;
  }
};

export const queryDatabase = async (sql, params = []) => {
  try {
    if (sql.trim().toLowerCase().startsWith('select')) {
      return await db.all(sql, params);
    } else {
      const result = await db.run(sql, params);
      if (sql.trim().toLowerCase().startsWith('insert')) {
        return { insertId: result.lastID, affectedRows: result.changes };
      }
      return { affectedRows: result.changes };
    }
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

export const closeDatabase = async () => {
  if (db) {
    await db.close();
    console.log('Database connection closed');
  }
};

export default db;
