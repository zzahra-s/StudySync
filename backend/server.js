const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/Authroutes');
const studentRoutes = require('./routes/Studentroutes');
const semesterRoutes = require('./routes/Semesterroutes');
const courseRoutes = require('./routes/Courseroutes');
const gradeRoutes = require('./routes/Graderoutes');

const app = express();
const PORT = process.env.DB_PORT || 5001;



// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api', semesterRoutes);
app.use('/api', courseRoutes);
app.use('/api', gradeRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'StudySync server is running' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`StudySync server running on port ${PORT}`);
});
