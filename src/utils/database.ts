// This file is now used only by the server.js file
// This code does not run in the browser anymore

import mysql from 'mysql2/promise';

import 'dotenv/config';
// MySQL connection configuration using environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'cli_pat',
  port: parseInt(process.env.DB_PORT || '3306'),
};

// Add error handling for missing environment variables
if (!process.env.DB_PASSWORD) {
  console.warn('Warning: Using default database password. Set DB_PASSWORD environment variable in production.');
}

console.log('Using database config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  // Not logging password for security
});

// Create a connection pool with error handling
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database (create tables if they don't exist)
export const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create patients table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS patients (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          age INT NOT NULL,
          sex ENUM('Male', 'Female', 'Other') NOT NULL,
          contact VARCHAR(50),
          diagnosis TEXT,
          notes TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Patients table created successfully');
    } catch (error) {
      console.error('Error creating patients table:', error);
      throw error;
    }
    
    // Create visits table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visits (
        id VARCHAR(36) PRIMARY KEY,
        patientId VARCHAR(36) NOT NULL,
        date TIMESTAMP NOT NULL,
        diagnosis TEXT,
        prescription TEXT,
        notes TEXT,
        xrayRequired BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);
    
    // Create appointments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(36) PRIMARY KEY,
        patientId VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration INT NOT NULL,
        description TEXT,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);
    
    // Create visit_images table for storing image references
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visit_images (
        id VARCHAR(36) PRIMARY KEY,
        visitId VARCHAR(36) NOT NULL,
        imageData LONGTEXT NOT NULL,
        FOREIGN KEY (visitId) REFERENCES visits(id) ON DELETE CASCADE
      )
    `);
    
    connection.release();
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

// Generic query executor
export const executeQuery = async (query: string, params: any[] = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};
