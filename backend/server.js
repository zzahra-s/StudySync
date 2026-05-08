
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { getConnectionPool } = require('./db');
const deadlinesRoutes = require('./routes/deadlines');
const studyPlannerRoutes = require('./routes/study-planner');
const studyHoursRoutes = require('./routes/study-hours');
const topCoursesRoutes = require('./routes/top-courses');
const materialsRoutes = require('./routes/materials');
const booksRoutes = require('./routes/books');
const taskProgressRoutes = require('./routes/task-progress');

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

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const dummyUser = {
    id: '1',
    email,
    name: 'Test Student'
  };

  const token = jwt.sign(
    { userId: dummyUser.id, email: dummyUser.email },
    process.env.JWT_SECRET || 'mySuperSecretKey123',
    { expiresIn: '1h' }
  );

  res.json({ token, user: dummyUser });
});

app.get('/api/students/:id', (req, res) => {
  res.json({
    id: req.params.id,
    name: 'Test Student',
    email: 'student@example.com'
  });
});

app.use('/api', deadlinesRoutes);
app.use('/api', studyPlannerRoutes);
app.use('/api', studyHoursRoutes);
app.use('/api', topCoursesRoutes);
app.use('/api', materialsRoutes);
app.use('/api', booksRoutes);
app.use('/api', taskProgressRoutes);

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