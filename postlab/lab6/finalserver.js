const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const PORT = 5001;

app.use(bodyParser.json());
const connectionString = 'Server=localhost,1433;Database=Mystical_Adventures;User Id=sa;Password=YourStrong@Password1;Encrypt=false;TrustServerCertificate=true;';

process.on('uncaughtException', (err) => console.error('Uncaught:', err.message));
process.on('unhandledRejection', (reason) => console.error('Unhandled:', reason));
app.get('/', (req, res) => {
    res.send('Mystical Adventures API is running');
});

// ============================================================
// MISSIONS ENDPOINTS
//
// GET /missions                          → all missions
// GET /missions/:id                      → single mission by ID
// GET /missions?type=Investigation       → filter by type
// GET /missions?status=Ongoing           → filter by status
// GET /missions?difficulty=Extreme       → filter by difficulty
// GET /missions?type=Investigation&status=Ongoing  → combine filters
//
// POST /missions                         → insert a new mission
// ============================================================

// GET missions with optional filters
app.get('/missions', async (req, res) => {
    const { type, status, difficulty } = req.query;

    try {
        const pool = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM Missions WHERE 1=1';

        if (type) {
            query += ' AND Type = @type';
            request.input('type', sql.NVarChar(50), type);
        }
        if (status) {
            query += ' AND Status = @status';
            request.input('status', sql.NVarChar(50), status);
        }
        if (difficulty) {
            query += ' AND DifficultyLevel = @difficulty';
            request.input('difficulty', sql.NVarChar(50), difficulty);
        }

        query += ' ORDER BY MissionID ASC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET single mission by ID
app.get('/missions/:id', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('MissionID', sql.Int, req.params.id)
            .query('SELECT * FROM Missions WHERE MissionID = @MissionID');

        if (result.recordset.length === 0)
            return res.status(404).json({ error: 'Mission not found' });

        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST a new mission
app.post('/missions', async (req, res) => {
    const { Title, Type, DifficultyLevel, Status } = req.body;

    // Validate required fields
    if (!Title || !Type || !DifficultyLevel)
        return res.status(400).json({ error: 'Title, Type, and DifficultyLevel are required' });

    // Validate allowed values
    const validTypes       = ['Investigation', 'Dungeon Raid', 'Artifact Retrieval', 'Espionage'];
    const validDifficulty  = ['Low', 'Medium', 'High', 'Extreme'];
    const validStatus      = ['Pending', 'Ongoing', 'Completed', 'Failed'];

    if (!validTypes.includes(Type))
        return res.status(400).json({ error: `Type must be one of: ${validTypes.join(', ')}` });

    if (!validDifficulty.includes(DifficultyLevel))
        return res.status(400).json({ error: `DifficultyLevel must be one of: ${validDifficulty.join(', ')}` });

    if (Status && !validStatus.includes(Status))
        return res.status(400).json({ error: `Status must be one of: ${validStatus.join(', ')}` });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('Title',          sql.NVarChar(200), Title)
            .input('Type',           sql.NVarChar(50),  Type)
            .input('DifficultyLevel',sql.NVarChar(50),  DifficultyLevel)
            .input('Status',         sql.NVarChar(50),  Status || 'Pending')
            .query(`
                INSERT INTO Missions (Title, Type, DifficultyLevel, Status)
                OUTPUT INSERTED.*
                VALUES (@Title, @Type, @DifficultyLevel, @Status)
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