// server.js
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
require('dotenv').config();

const app = express();
const PORT = 5001;

app.use(bodyParser.json());

//Connection String 
const connectionString = process.env.DB_CONNECTION_STRING;

// test
app.get('/', (req, res) => {
    res.send('Hello from Racing Node.js Backend');
});


// get all drivers
app.get('/drivers', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request().query('SELECT * FROM Driver');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// get driver by ID with their cars
app.get('/drivers/:id', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);

        const driver = await pool.request()
            .input('driver_id', sql.Int, req.params.id)
            .query('SELECT * FROM Driver WHERE driver_id = @driver_id');

        if (driver.recordset.length === 0)
            return res.status(404).json({ error: 'Driver not found' });

        const cars = await pool.request()
            .input('driver_id', sql.Int, req.params.id)
            .query(`
                SELECT C.*, DC.purchase_date
                FROM Car C
                JOIN Driver_Car DC ON C.car_id = DC.car_id
                WHERE DC.driver_id = @driver_id
            `);

        res.json({ ...driver.recordset[0], Cars: cars.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// post a new driver
app.post('/drivers', async (req, res) => {
    const { first_name, last_name, country, date_of_birth, license_number } = req.body;

    if (!first_name || !last_name || !license_number)
        return res.status(400).json({ error: 'first_name, last_name, and license_number are required' });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('first_name', sql.VarChar(50), first_name)
            .input('last_name', sql.VarChar(50), last_name)
            .input('country', sql.VarChar(50), country || null)
            .input('date_of_birth', sql.Date, date_of_birth || null)
            .input('license_number', sql.VarChar(20), license_number)
            .query(`
                INSERT INTO Driver (first_name, last_name, country, date_of_birth, license_number)
                OUTPUT INSERTED.*
                VALUES (@first_name, @last_name, @country, @date_of_birth, @license_number)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


//get all cars
app.get('/cars', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request().query('SELECT * FROM Car');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// getcar by ID with upgrades
app.get('/cars/:id', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);

        const car = await pool.request()
            .input('car_id', sql.Int, req.params.id)
            .query('SELECT * FROM Car WHERE car_id = @car_id');

        if (car.recordset.length === 0)
            return res.status(404).json({ error: 'Car not found' });

        const upgrades = await pool.request()
            .input('car_id', sql.Int, req.params.id)
            .query(`
                SELECT U.*, CU.install_date
                FROM Upgrade U
                JOIN Car_Upgrade CU ON U.upgrade_id = CU.upgrade_id
                WHERE CU.car_id = @car_id
            `);

        res.json({ ...car.recordset[0], Upgrades: upgrades.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// posta new car
app.post('/cars', async (req, res) => {
    const { model, brand, horsepower, top_speed, year_manufactured, price } = req.body;

    if (!model || !brand || !horsepower || !top_speed || !year_manufactured || !price)
        return res.status(400).json({ error: 'model, brand, horsepower, top_speed, year_manufactured, and price are required' });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('model', sql.VarChar(50), model)
            .input('brand', sql.VarChar(50), brand)
            .input('horsepower', sql.Int, horsepower)
            .input('top_speed', sql.Int, top_speed)
            .input('year_manufactured', sql.Int, year_manufactured)
            .input('price', sql.Decimal(10, 2), price)
            .query(`
                INSERT INTO Car (model, brand, horsepower, top_speed, year_manufactured, price)
                OUTPUT INSERTED.*
                VALUES (@model, @brand, @horsepower, @top_speed, @year_manufactured, @price)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// get all upgrades
app.get('/upgrades', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request().query('SELECT * FROM Upgrade');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// post a new upgrade
app.post('/upgrades', async (req, res) => {
    const { upgrade_name, upgrade_type, performance_boost, price } = req.body;

    if (!upgrade_name || !upgrade_type || !performance_boost || !price)
        return res.status(400).json({ error: 'upgrade_name, upgrade_type, performance_boost, and price are required' });

    const validTypes = ['Engine', 'Tires', 'Nitrous', 'Brakes', 'Aerodynamics'];
    if (!validTypes.includes(upgrade_type))
        return res.status(400).json({ error: `upgrade_type must be one of: ${validTypes.join(', ')}` });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('upgrade_name', sql.VarChar(50), upgrade_name)
            .input('upgrade_type', sql.VarChar(50), upgrade_type)
            .input('performance_boost', sql.Int, performance_boost)
            .input('price', sql.Decimal(10, 2), price)
            .query(`
                INSERT INTO Upgrade (upgrade_name, upgrade_type, performance_boost, price)
                OUTPUT INSERTED.*
                VALUES (@upgrade_name, @upgrade_type, @performance_boost, @price)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

//get all races
app.get('/races', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request().query('SELECT * FROM Race ORDER BY race_date DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// get race by ID with participants and results
app.get('/races/:id', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);

        const race = await pool.request()
            .input('race_id', sql.Int, req.params.id)
            .query('SELECT * FROM Race WHERE race_id = @race_id');

        if (race.recordset.length === 0)
            return res.status(404).json({ error: 'Race not found' });

        const participants = await pool.request()
            .input('race_id', sql.Int, req.params.id)
            .query(`
                SELECT 
                    D.driver_id, D.first_name, D.last_name, D.country,
                    C.car_id, C.model, C.brand
                FROM Race_Participant RP
                JOIN Driver D ON RP.driver_id = D.driver_id
                JOIN Car C ON RP.car_id = C.car_id
                WHERE RP.race_id = @race_id
            `);

        const results = await pool.request()
            .input('race_id', sql.Int, req.params.id)
            .query(`
                SELECT 
                    RR.finishing_position,
                    RR.completion_time,
                    D.first_name, D.last_name
                FROM Race_Result RR
                JOIN Driver D ON RR.driver_id = D.driver_id
                WHERE RR.race_id = @race_id
                ORDER BY RR.finishing_position ASC
            `);

        res.json({
            ...race.recordset[0],
            Participants: participants.recordset,
            Results: results.recordset
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// post a new race
app.post('/races', async (req, res) => {
    const { race_name, location, race_date, track_length, max_participants } = req.body;

    if (!race_name || !track_length || !max_participants)
        return res.status(400).json({ error: 'race_name, track_length, and max_participants are required' });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('race_name', sql.VarChar(50), race_name)
            .input('location', sql.VarChar(100), location || null)
            .input('race_date', sql.DateTime, race_date || new Date())
            .input('track_length', sql.Decimal(5, 2), track_length)
            .input('max_participants', sql.Int, max_participants)
            .query(`
                INSERT INTO Race (race_name, location, race_date, track_length, max_participants)
                OUTPUT INSERTED.*
                VALUES (@race_name, @location, @race_date, @track_length, @max_participants)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// get all race results
app.get('/results', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request().query(`
            SELECT 
                RR.race_id,
                R.race_name,
                RR.finishing_position,
                RR.completion_time,
                D.first_name, D.last_name, D.country
            FROM Race_Result RR
            JOIN Race R ON RR.race_id = R.race_id
            JOIN Driver D ON RR.driver_id = D.driver_id
            ORDER BY RR.race_id, RR.finishing_position
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// post a race result
app.post('/results', async (req, res) => {
    const { race_id, driver_id, finishing_position, completion_time } = req.body;

    if (!race_id || !driver_id || !finishing_position || !completion_time)
        return res.status(400).json({ error: 'race_id, driver_id, finishing_position, and completion_time are required' });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('race_id', sql.Int, race_id)
            .input('driver_id', sql.Int, driver_id)
            .input('finishing_position', sql.Int, finishing_position)
            .input('completion_time', sql.Decimal(6, 2), completion_time)
            .query(`
                INSERT INTO Race_Result (race_id, driver_id, finishing_position, completion_time)
                OUTPUT INSERTED.*
                VALUES (@race_id, @driver_id, @finishing_position, @completion_time)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


//get all rewards
app.get('/rewards', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request().query(`
            SELECT 
                DR.driver_id,
                D.first_name, D.last_name,
                DR.reward_name,
                DR.reward_amount,
                DR.reward_date
            FROM Driver_Reward DR
            JOIN Driver D ON DR.driver_id = D.driver_id
            ORDER BY DR.reward_date DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// post a new reward
app.post('/rewards', async (req, res) => {
    const { driver_id, reward_name, reward_amount, reward_date } = req.body;

    if (!driver_id || !reward_name || reward_amount === undefined)
        return res.status(400).json({ error: 'driver_id, reward_name, and reward_amount are required' });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('driver_id', sql.Int, driver_id)
            .input('reward_name', sql.VarChar(50), reward_name)
            .input('reward_amount', sql.Decimal(10, 2), reward_amount)
            .input('reward_date', sql.Date, reward_date || new Date())
            .query(`
                INSERT INTO Driver_Reward (driver_id, reward_name, reward_amount, reward_date)
                OUTPUT INSERTED.*
                VALUES (@driver_id, @reward_name, @reward_amount, @reward_date)
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