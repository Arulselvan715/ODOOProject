-- ============================================================
-- Traveloop PostgreSQL Schema for Neon Cloud Database
-- Run this in Neon SQL Editor: https://console.neon.tech
-- ============================================================

-- Drop existing tables in reverse dependency order (safe to re-run)
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS packing_checklist CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS trip_stops CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  profile_image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TRIPS TABLE
-- ============================================================
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  cover_image TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(64) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TRIP STOPS (Itinerary Cities/Destinations)
-- ============================================================
CREATE TABLE trip_stops (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city VARCHAR(200) NOT NULL,
  country VARCHAR(100),
  arrival_date DATE,
  departure_date DATE,
  order_index INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ACTIVITIES (Per Stop)
-- ============================================================
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  stop_id INTEGER NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  cost NUMERIC(10, 2) DEFAULT 0,
  duration_hours NUMERIC(5, 2) DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- BUDGETS (Per Trip — one row per trip)
-- ============================================================
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER UNIQUE NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  transport_cost NUMERIC(10, 2) DEFAULT 0,
  stay_cost NUMERIC(10, 2) DEFAULT 0,
  food_cost NUMERIC(10, 2) DEFAULT 0,
  other_cost NUMERIC(10, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PACKING CHECKLIST (Per Trip)
-- ============================================================
CREATE TABLE packing_checklist (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  item_name VARCHAR(200) NOT NULL,
  is_packed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- NOTES / JOURNAL (Per Trip)
-- ============================================================
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title VARCHAR(200),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES for query performance
-- ============================================================
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_share_token ON trips(share_token);
CREATE INDEX idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX idx_activities_stop_id ON activities(stop_id);
CREATE INDEX idx_packing_trip_id ON packing_checklist(trip_id);
CREATE INDEX idx_notes_trip_id ON notes(trip_id);

-- ============================================================
-- Verify tables were created
-- ============================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
