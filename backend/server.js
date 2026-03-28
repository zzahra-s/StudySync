// server.js
const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

dotenv.config();

// ── Existing routes ────────────────────────────────────────────────────────────
const authRoutes     = require('./routes/Authroutes');
const studentRoutes  = require('./routes/Studentroutes');
const semesterRoutes = require('./routes/Semesterroutes');
const courseRoutes   = require('./routes/Courseroutes');
const gradeRoutes    = require('./routes/Graderoutes');

// ── New routes (Member 2) ──────────────────────────────────────────────────────
const gpaRoutes      = require('./routes/Gparoutes');
const scenarioRoutes = require('./routes/Scenarioroutes');
const reportRoutes   = require('./routes/Reportroutes');

const app  = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api',          semesterRoutes);
app.use('/api',          courseRoutes);
app.use('/api',          gradeRoutes);

// New routes
app.use('/api',          gpaRoutes);       // CGPA, semester-gpa, admin/average-gpa
app.use('/api',          scenarioRoutes);  // scenarios CRUD + projection
app.use('/api',          reportRoutes);    // course-grades, courses-per-semester, incomplete-courses

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'StudySync server is running' });
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`StudySync server running on http://localhost:${PORT}`);
});