const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/Authroutes');
const studentRoutes = require('./routes/Studentroutes');
const semesterRoutes = require('./routes/Semesterroutes');
const courseRoutes = require('./routes/Courseroutes');
const gradeRoutes = require('./routes/Graderoutes');
const gpaRoutes = require('./routes/Gparoutes');
const scenarioRoutes = require('./routes/Scenarioroutes');
const reportRoutes = require('./routes/Reportroutes');
const deadlineRoutes = require('./routes/deadlineRoutes');
const materialRoutes = require('./routes/materialRoutes');
const bookRoutes = require('./routes/bookRoutes');
const taskProgressRoutes = require('./routes/taskProgressRoutes');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5001')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use('/api', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api', semesterRoutes);
app.use('/api', courseRoutes);
app.use('/api', gradeRoutes);
app.use('/api', gpaRoutes);
app.use('/api', scenarioRoutes);
app.use('/api', reportRoutes);
app.use('/api', deadlineRoutes);
app.use('/api', materialRoutes);
app.use('/api', bookRoutes);
app.use('/api', taskProgressRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS blocked this request origin',
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

module.exports = app;
