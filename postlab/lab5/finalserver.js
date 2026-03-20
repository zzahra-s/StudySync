
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const PORT = 5001;

app.use(bodyParser.json());

const connectionString = 'Server=localhost,1433;Database=PowerPuffDB;User Id=sa;Password=YourStrong@Password1;Encrypt=false;TrustServerCertificate=true;';

process.on('uncaughtException', (err) => console.error('Uncaught:', err.message));
process.on('unhandledRejection', (reason) => console.error('Unhandled:', reason));

app.get('/', (req, res) => {
    res.send('PowerPuff API is running');
});


// GET /creatures all creatures with their powers
// GET /creatures?type=Hero heroes only
// GET /creatures?type=Villain villains only
// GET /creatures?status=Alive filter by status
// GET /creatures/:id  one creature + powers + ingredients + rank
// POST /creatures insert a new creature


app.get('/creatures', async (req, res) => {
    const { type, status } = req.query;
    try {
        const pool = await sql.connect(connectionString);
        const request = pool.request();

        let query = `
            SELECT C.CreatureID, C.Name, C.Type, C.Status,
                   P.Name AS SpecificPower
            FROM Creature C
            LEFT JOIN Power P ON C.SpecificPowerID = P.PowerID
            WHERE 1=1
        `;

        if (type) {
            query += ' AND C.Type = @type';
            request.input('type', sql.VarChar(10), type);
        }
        if (status) {
            query += ' AND C.Status = @status';
            request.input('status', sql.VarChar(10), status);
        }
        query += ' ORDER BY C.CreatureID ASC';

        const creatures = await request.query(query);

        const powers = await pool.request().query(`
            SELECT CP.CreatureID, P.PowerID, P.Name AS PowerName, P.Description
            FROM Creature_Power CP
            JOIN Power P ON CP.PowerID = P.PowerID
        `);

        const result = creatures.recordset.map(c => ({
            ...c,
            Powers: powers.recordset
                .filter(p => p.CreatureID === c.CreatureID)
                .map(p => ({ PowerID: p.PowerID, Name: p.PowerName, Description: p.Description }))
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/creatures/:id', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);

        const creature = await pool.request()
            .input('CreatureID', sql.Int, req.params.id)
            .query(`
                SELECT C.CreatureID, C.Name, C.Type, C.Status,
                       P.Name AS SpecificPower
                FROM Creature C
                LEFT JOIN Power P ON C.SpecificPowerID = P.PowerID
                WHERE C.CreatureID = @CreatureID
            `);

        if (creature.recordset.length === 0)
            return res.status(404).json({ error: 'Creature not found' });

        const powers = await pool.request()
            .input('CreatureID', sql.Int, req.params.id)
            .query(`
                SELECT P.PowerID, P.Name, P.Description
                FROM Creature_Power CP
                JOIN Power P ON CP.PowerID = P.PowerID
                WHERE CP.CreatureID = @CreatureID
            `);

        const ingredients = await pool.request()
            .input('CreatureID', sql.Int, req.params.id)
            .query(`
                SELECT I.IngredientID, I.Name, I.Description
                FROM Creature_Ingredient CI
                JOIN Ingredient I ON CI.IngredientID = I.IngredientID
                WHERE CI.CreatureID = @CreatureID
            `);

        const rank = await pool.request()
            .input('CreatureID', sql.Int, req.params.id)
            .query('SELECT Level FROM Rank WHERE CreatureID = @CreatureID');

        res.json({
            ...creature.recordset[0],
            Powers:      powers.recordset,
            Ingredients: ingredients.recordset,
            Rank:        rank.recordset[0] || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/creatures', async (req, res) => {
    const { Name, Type, SpecificPowerID, Status } = req.body;

    if (!Name || !Type)
        return res.status(400).json({ error: 'Name and Type are required' });
    if (!['Hero', 'Villain'].includes(Type))
        return res.status(400).json({ error: 'Type must be Hero or Villain' });
    if (Status && !['Alive', 'Dead'].includes(Status))
        return res.status(400).json({ error: 'Status must be Alive or Dead' });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('Name',            sql.VarChar(100), Name)
            .input('Type',            sql.VarChar(10),  Type)
            .input('SpecificPowerID', sql.Int,          SpecificPowerID || null)
            .input('Status',          sql.VarChar(10),  Status || 'Alive')
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


// GET /powers all powers + creatures that have them
// GET /powers/:id single power
// POST /powers insert a new power

app.get('/powers', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);
        const powers = await pool.request().query('SELECT * FROM Power');
        const assignments = await pool.request().query(`
            SELECT CP.PowerID, C.CreatureID, C.Name AS CreatureName, C.Type
            FROM Creature_Power CP
            JOIN Creature C ON CP.CreatureID = C.CreatureID
        `);
        const result = powers.recordset.map(p => ({
            ...p,
            Creatures: assignments.recordset
                .filter(a => a.PowerID === p.PowerID)
                .map(a => ({ CreatureID: a.CreatureID, Name: a.CreatureName, Type: a.Type }))
        }));
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/powers/:id', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('PowerID', sql.Int, req.params.id)
            .query('SELECT * FROM Power WHERE PowerID = @PowerID');
        if (result.recordset.length === 0)
            return res.status(404).json({ error: 'Power not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/powers', async (req, res) => {
    const { Name, Description } = req.body;
    if (!Name)
        return res.status(400).json({ error: 'Name is required' });
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('Name',        sql.VarChar(100), Name)
            .input('Description', sql.Text,         Description || null)
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

// GET /ingredients all ingredients + creatures that use them
// POST /ingredients insert a new ingredient

app.get('/ingredients', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);
        const ingredients = await pool.request().query('SELECT * FROM Ingredient');
        const assignments = await pool.request().query(`
            SELECT CI.IngredientID, C.CreatureID, C.Name AS CreatureName
            FROM Creature_Ingredient CI
            JOIN Creature C ON CI.CreatureID = C.CreatureID
        `);
        const result = ingredients.recordset.map(i => ({
            ...i,
            UsedBy: assignments.recordset
                .filter(a => a.IngredientID === i.IngredientID)
                .map(a => ({ CreatureID: a.CreatureID, Name: a.CreatureName }))
        }));
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/ingredients', async (req, res) => {
    const { Name, Description } = req.body;
    if (!Name)
        return res.status(400).json({ error: 'Name is required' });
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('Name',        sql.VarChar(100), Name)
            .input('Description', sql.Text,         Description || null)
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


// GET /fights all fights with names + winner
// GET /fights?creature_id=1 fights involving a specific creature
// POST /fights log a new fight


app.get('/fights', async (req, res) => {
    const { creature_id } = req.query;
    try {
        const pool = await sql.connect(connectionString);
        const request = pool.request();

        let query = `
            SELECT F.FightID,
                   C1.Name AS Creature1, C1.Type AS Creature1Type,
                   C2.Name AS Creature2, C2.Type AS Creature2Type,
                   W.Name  AS Winner,
                   F.Date
            FROM Fight F
            JOIN Creature C1 ON F.Creature1ID = C1.CreatureID
            JOIN Creature C2 ON F.Creature2ID = C2.CreatureID
            LEFT JOIN Creature W ON F.WinnerID = W.CreatureID
            WHERE 1=1
        `;

        if (creature_id) {
            query += ' AND (F.Creature1ID = @cid OR F.Creature2ID = @cid)';
            request.input('cid', sql.Int, parseInt(creature_id));
        }
        query += ' ORDER BY F.Date DESC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/fights', async (req, res) => {
    const { Creature1ID, Creature2ID, WinnerID } = req.body;
    if (!Creature1ID || !Creature2ID)
        return res.status(400).json({ error: 'Creature1ID and Creature2ID are required' });
    if (Creature1ID === Creature2ID)
        return res.status(400).json({ error: 'A creature cannot fight itself' });
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('Creature1ID', sql.Int, Creature1ID)
            .input('Creature2ID', sql.Int, Creature2ID)
            .input('WinnerID',    sql.Int, WinnerID || null)
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


// GET /ranks leaderboard sorted highest first
// POST /ranks assign a rank to a creature

app.get('/ranks', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request().query(`
            SELECT R.RankID, C.Name AS Creature, C.Type, R.Level
            FROM Rank R
            JOIN Creature C ON R.CreatureID = C.CreatureID
            ORDER BY R.Level DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/ranks', async (req, res) => {
    const { CreatureID, Level } = req.body;
    if (!CreatureID || !Level)
        return res.status(400).json({ error: 'CreatureID and Level are required' });
    if (Level < 1)
        return res.status(400).json({ error: 'Level must be at least 1' });
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('CreatureID', sql.Int, CreatureID)
            .input('Level',      sql.Int, Level)
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

// GET /deaths  all death logs with creature names
// POST /deaths  log a death + mark creature as Dead

app.get('/deaths', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request().query(`
            SELECT D.DeathID, C.Name AS Creature, C.Type, D.Cause, D.DeathDate
            FROM DeathLog D
            JOIN Creature C ON D.CreatureID = C.CreatureID
            ORDER BY D.DeathDate DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/deaths', async (req, res) => {
    const { CreatureID, Cause } = req.body;
    if (!CreatureID)
        return res.status(400).json({ error: 'CreatureID is required' });
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('CreatureID', sql.Int,  CreatureID)
            .input('Cause',      sql.Text, Cause || null)
            .query(`
                INSERT INTO DeathLog (CreatureID, Cause)
                OUTPUT INSERTED.*
                VALUES (@CreatureID, @Cause)
            `);
        await pool.request()
            .input('CreatureID', sql.Int, CreatureID)
            .query(`UPDATE Creature SET Status = 'Dead' WHERE CreatureID = @CreatureID`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /family  all relations with creature names
// POST /family add a family relation

app.get('/family', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request().query(`
            SELECT F.RelationID,
                   C1.Name AS Creature1, C1.Type AS Type1,
                   C2.Name AS Creature2, C2.Type AS Type2,
                   F.RelationType
            FROM FamilyRelation F
            JOIN Creature C1 ON F.Creature1ID = C1.CreatureID
            JOIN Creature C2 ON F.Creature2ID = C2.CreatureID
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/family', async (req, res) => {
    const { Creature1ID, Creature2ID, RelationType } = req.body;
    if (!Creature1ID || !Creature2ID || !RelationType)
        return res.status(400).json({ error: 'Creature1ID, Creature2ID, and RelationType are required' });
    const validTypes = ['Sibling', 'Parent-Child', 'Cousin', 'Other'];
    if (!validTypes.includes(RelationType))
        return res.status(400).json({ error: `RelationType must be one of: ${validTypes.join(', ')}` });
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('Creature1ID',  sql.Int,         Creature1ID)
            .input('Creature2ID',  sql.Int,         Creature2ID)
            .input('RelationType', sql.VarChar(20), RelationType)
            .query(`
                INSERT INTO FamilyRelation (Creature1ID, Creature2ID, RelationType)
                OUTPUT INSERTED.*
                VALUES (@Creature1ID, @Creature2ID, @RelationType)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});