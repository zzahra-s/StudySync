
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
require('dotenv').config(); // load .env variables
require('dotenv').config();
console.log('DB_SERVER:', process.env.DB_SERVER);  
console.log('DB_USER:', process.env.DB_USER);     
const app = express();
const PORT = 5001;

app.use(bodyParser.json());

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

//test
app.get('/', (req, res) => {
    res.send('Hello from Node.js Backend');
});

// to get all missions
app.get('/missions', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Missions');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

//to post a new mission
app.post('/missions', async (req, res) => {
    const { Title, Type, DifficultyLevel, Status } = req.body;

    if (!Title || !Type || !DifficultyLevel) {
        return res.status(400).send({ error: 'Title, Type, and DifficultyLevel are required' });
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('Title', sql.NVarChar(200), Title)
            .input('Type', sql.NVarChar(50), Type)
            .input('DifficultyLevel', sql.NVarChar(50), DifficultyLevel)
            .input('Status', sql.NVarChar(50), Status || 'Pending')
            .query(`
                INSERT INTO Missions (Title, Type, DifficultyLevel, Status)
                OUTPUT INSERTED.*
                VALUES (@Title, @Type, @DifficultyLevel, @Status)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});