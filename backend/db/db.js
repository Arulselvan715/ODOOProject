// ============================================================
// db/db.js — Neon PostgreSQL Connection Pool
// ============================================================
const { Pool } = require('pg');
require('dotenv').config();

// Use Neon connection string with SSL required
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon cloud database
  }
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('   Make sure DATABASE_URL is set correctly in .env');
  } else {
    console.log('✅ Connected to Neon PostgreSQL database');
    release();
  }
});

module.exports = pool;
