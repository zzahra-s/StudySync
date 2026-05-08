
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
const bookMaterialRoutes = require('./routes/book-material');
const courseMaterialRoutes = require('./routes/course-material');
const taskManagerRoutes = require('./routes/task-manager');
const courseOptionsRoutes = require('./routes/course-options');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

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
app.use('/api', bookMaterialRoutes);
app.use('/api', courseMaterialRoutes);
app.use('/api', taskManagerRoutes);
app.use('/api', courseOptionsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

async function startServer() {
  try {
    await getConnectionPool();
    console.log('Connected to SQL Server');
  } catch (error) {
    console.warn('Could not connect to SQL Server:', error.message || error);
  }

  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

startServer();