
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const { getConnectionPool } = require('./db');
const authRoutes = require('./routes/Authroutes');
const studentRoutes = require('./routes/Studentroutes');
const semesterRoutes = require('./routes/Semesterroutes');
const courseRoutes = require('./routes/Courseroutes');
const gradeRoutes = require('./routes/Graderoutes');
const gpaRoutes = require('./routes/Gparoutes');
const scenarioRoutes = require('./routes/Scenarioroutes');
const reportRoutes = require('./routes/Reportroutes');
const deadlinesRoutes = require('./routes/deadlines');
const taskProgressRoutes = require('./routes/task-progress');
const taskManagerRoutes = require('./routes/task-manager');
const courseOptionsRoutes = require('./routes/course-options');
const targetCGPARoutes = require('./routes/TargetCGPAroutes');
const bookMaterialRoutes = require('./routes/book-material');
const courseMaterialRoutes = require('./routes/course-material');
dotenv.config({ path: require('path').join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
// FRONTEND_URL can hold one or more comma-separated origins; unset allows all (local dev).
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// RESTORED BACKEND LOGGING
app.use(morgan('dev'));
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend working' });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api', semesterRoutes);
app.use('/api', courseRoutes);
app.use('/api', gradeRoutes);
app.use('/api', gpaRoutes);
app.use('/api', scenarioRoutes);
app.use('/api', reportRoutes);
app.use('/api', deadlinesRoutes);
app.use('/api', taskProgressRoutes);
app.use('/api', taskManagerRoutes);
app.use('/api', courseOptionsRoutes);
app.use('/api', targetCGPARoutes);
app.use('/api', bookMaterialRoutes);
app.use('/api', courseMaterialRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

async function startServer() {
  try {
    const pool = await getConnectionPool();
    await pool.query('SELECT 1');
    console.log('Connected to Postgres');
  } catch (error) {
    console.warn('Could not connect to Postgres:', error.message || error);
  }

  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

// Vercel imports this file and serves the exported app; locally it is run directly.
if (require.main === module) {
  startServer();
}

module.exports = app;
