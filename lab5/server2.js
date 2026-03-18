// server.js
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
require('dotenv').config();

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

// --- Test route ---
app.get('/', (req, res) => {
    res.send('Hello from PowerPuff Node.js Backend');
});

//get all creatures
app.get('/creatures', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Creature');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// get creature by ID
app.get('/creatures/:id', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('CreatureID', sql.Int, req.params.id)
            .query('SELECT * FROM Creature WHERE CreatureID = @CreatureID');
        if (result.recordset.length === 0)
            return res.status(404).json({ error: 'Creature not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// post a new creature
app.post('/creatures', async (req, res) => {
    const { Name, Type, SpecificPowerID, Status } = req.body;

    if (!Name || !Type) {
        return res.status(400).json({ error: 'Name and Type are required' });
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('Name', sql.VarChar(100), Name)
            .input('Type', sql.VarChar(10), Type)
            .input('SpecificPowerID', sql.Int, SpecificPowerID || null)
            .input('Status', sql.VarChar(10), Status || 'Alive')
            .query(`
                INSERT INTO Creature (Name, Type, SpecificPowerID, Status)
                OUTPUT INSERTED.*
                VALUES (@Name, @Type, @SpecificPowerID, @Status)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


//get all powers
app.get('/powers', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Power');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST a new power
app.post('/powers', async (req, res) => {
    const { Name, Description } = req.body;

    if (!Name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('Name', sql.VarChar(100), Name)
            .input('Description', sql.Text, Description || null)
            .query(`
                INSERT INTO Power (Name, Description)
                OUTPUT INSERTED.*
                VALUES (@Name, @Description)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// get all ingredients
app.get('/ingredients', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Ingredient');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// post a new ingredient
app.post('/ingredients', async (req, res) => {
    const { Name, Description } = req.body;

    if (!Name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('Name', sql.VarChar(100), Name)
            .input('Description', sql.Text, Description || null)
            .query(`
                INSERT INTO Ingredient (Name, Description)
                OUTPUT INSERTED.*
                VALUES (@Name, @Description)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// get all fights
app.get('/fights', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
            SELECT 
                F.FightID,
                C1.Name AS Creature1,
                C2.Name AS Creature2,
                W.Name AS Winner,
                F.Date
            FROM Fight F
            JOIN Creature C1 ON F.Creature1ID = C1.CreatureID
            JOIN Creature C2 ON F.Creature2ID = C2.CreatureID
            LEFT JOIN Creature W ON F.WinnerID = W.CreatureID
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

//post a new fight
app.post('/fights', async (req, res) => {
    const { Creature1ID, Creature2ID, WinnerID } = req.body;

    if (!Creature1ID || !Creature2ID) {
        return res.status(400).json({ error: 'Creature1ID and Creature2ID are required' });
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('Creature1ID', sql.Int, Creature1ID)
            .input('Creature2ID', sql.Int, Creature2ID)
            .input('WinnerID', sql.Int, WinnerID || null)
            .query(`
                INSERT INTO Fight (Creature1ID, Creature2ID, WinnerID)
                OUTPUT INSERTED.*
                VALUES (@Creature1ID, @Creature2ID, @WinnerID)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// get all ranks
app.get('/ranks', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
            SELECT R.RankID, C.Name AS Creature, R.Level
            FROM Rank R
            JOIN Creature C ON R.CreatureID = C.CreatureID
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

//post a new rank
app.post('/ranks', async (req, res) => {
    const { CreatureID, Level } = req.body;

    if (!CreatureID || !Level) {
        return res.status(400).json({ error: 'CreatureID and Level are required' });
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('CreatureID', sql.Int, CreatureID)
            .input('Level', sql.Int, Level)
            .query(`
                INSERT INTO Rank (CreatureID, Level)
                OUTPUT INSERTED.*
                VALUES (@CreatureID, @Level)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});