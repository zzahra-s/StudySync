// server.js
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');
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

// ── Member 3 routes ─────────────────────────────────────────────────────────────
const deadlineRoutes     = require('./routes/deadlineRoutes');
const materialRoutes     = require('./routes/materialRoutes');
const bookRoutes         = require('./routes/bookRoutes');
const taskProgressRoutes = require('./routes/taskProgressRoutes');

const app  = express();
const PORT = process.env.PORT || 5001;

// ── Security & Logging Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use(limiter);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api',          semesterRoutes);
app.use('/api',          courseRoutes);
app.use('/api',          gradeRoutes);

// Member 2 routes
app.use('/api',          gpaRoutes);
app.use('/api',          scenarioRoutes);
app.use('/api',          reportRoutes);

// Member 3 routes - Deadlines & Study Planner, Materials, Books, Task Progress
app.use('/api',          deadlineRoutes);
app.use('/api',          materialRoutes);
app.use('/api',          bookRoutes);
app.use('/api',          taskProgressRoutes);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'StudySync server is running on port ' + PORT });
});

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, error: err.message });
    }
    res.status(500).json({ success: false, error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`StudySync server running on http://localhost:${PORT}`);
    console.log('Health check: http://localhost:' + PORT + '/health');
});

