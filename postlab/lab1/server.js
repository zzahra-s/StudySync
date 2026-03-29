const express = require('express');
const cors = require('cors');
require('dotenv').config();


const booksRoutes = require('./routes/booksRoutes'); // Lab 1 post-lab

const app = express();
app.use(express.json());
app.use(cors());

// Lab 1 post-lab
app.use('/api', booksRoutes);


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
