const express = require('express');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');
const salesmanRoutes = require('./routes/salesmanRoutes');
const customersRoutes = require('./routes/customersRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const booksRoutes = require('./routes/booksRoutes'); // Lab 1 post-lab

const app = express();
app.use(express.json());
app.use(cors());

// Lab 1 post-lab
app.use('/api', booksRoutes);

// Lab 2 post-lab
app.use('/api', taskRoutes);
app.use('/api/salesmen', salesmanRoutes);
app.use('/api', customersRoutes);
app.use('/api', ordersRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello from Node.js Backend!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
