
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

// get all missions
app.get('/missions', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .query('SELECT * FROM Missions');
    res.json(result.recordset); // send all missions as JSON
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

//get mission by its id
app.get('/missions/:id', async (req, res) => {
  const missionId = req.params.id;
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('MissionID', sql.Int, missionId)
      .query('SELECT * FROM Missions WHERE MissionID = @MissionID');
    
    if (result.recordset.length === 0) {
      return res.status(404).send({ error: 'Mission not found' });
    }

    res.json(result.recordset[0]); // send the mission
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

//get by status
app.get('/missions/status/:status', async (req, res) => {
  const status = req.params.status; // e.g., 'Pending', 'Ongoing', 'Completed', 'Failed'
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('Status', sql.NVarChar(50), status)
      .query('SELECT * FROM Missions WHERE Status = @Status');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});