// ============================================================
// server.js — Traveloop Express Server (Neon PostgreSQL)
// ============================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: '*', // Update to specific origin in production
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ── Route Imports ────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const { nestedRouter: stopNestedRouter, router: stopRouter } = require('./routes/stopRoutes');
const { nestedRouter: activityNestedRouter, router: activityRouter } = require('./routes/activityRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const { nestedRouter: checklistNestedRouter, router: checklistRouter } = require('./routes/checklistRoutes');
const { nestedRouter: noteNestedRouter, router: noteRouter } = require('./routes/noteRoutes');

// ── Mount Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Nested routes (trip-scoped)
app.use('/api/trips/:tripId/stops', stopNestedRouter);
app.use('/api/trips/:tripId/budget', budgetRoutes);
app.use('/api/trips/:tripId/checklist', checklistNestedRouter);
app.use('/api/trips/:tripId/notes', noteNestedRouter);

// Standalone routes
app.use('/api/stops', stopRouter);
app.use('/api/stops/:stopId/activities', activityNestedRouter);
app.use('/api/activities', activityRouter);
app.use('/api/checklist', checklistRouter);
app.use('/api/notes', noteRouter);

// ── Health Check ─────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: '🌍 Traveloop API is running!' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: '🌍 Traveloop API is healthy!' }));

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Traveloop server running on http://localhost:${PORT}`);
  console.log(`📋 API Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
