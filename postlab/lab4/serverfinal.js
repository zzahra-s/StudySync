
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const PORT = 5001;

app.use(bodyParser.json());

const connectionString = 'Server=localhost,1433;Database=lab4f;User Id=sa;Password=YourStrong@Password1;Encrypt=false;TrustServerCertificate=true;';

process.on('uncaughtException', (err) => console.error('Uncaught:', err.message));
process.on('unhandledRejection', (reason) => console.error('Unhandled:', reason));

app.get('/', (req, res) => {
    res.send('PowerPuff API is running');
});

//  GET  /drivers  all drivers
//  GET  /drivers?country=UK  filter by country
//  GET  /drivers?born_after=1990 born after year
//  GET  /drivers?born_before=2000  born before year
//  GET  /drivers/:id  driver + cars + rewards


app.get('/drivers', async (req, res) => {
    const { country, born_after, born_before } = req.query;
    try {
        const pool    = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM Driver WHERE 1=1';
        if (country)     { query += ' AND country = @country';                  request.input('country',     sql.VarChar(50), country); }
        if (born_after)  { query += ' AND YEAR(date_of_birth) > @born_after';   request.input('born_after',  sql.Int, parseInt(born_after)); }
        if (born_before) { query += ' AND YEAR(date_of_birth) < @born_before';  request.input('born_before', sql.Int, parseInt(born_before)); }
        query += ' ORDER BY last_name ASC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.get('/drivers/:id', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);

        const driver = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Driver WHERE driver_id = @id');

        if (!driver.recordset.length)
            return res.status(404).json({ error: 'Driver not found' });

        const cars = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT C.*, DC.purchase_date
                    FROM   Car C
                    JOIN   Driver_Car DC ON C.car_id = DC.car_id
                    WHERE  DC.driver_id = @id`);

        const rewards = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT reward_name, reward_amount, reward_date
                    FROM   Driver_Reward
                    WHERE  driver_id = @id
                    ORDER  BY reward_date DESC`);

        res.json({ ...driver.recordset[0], Cars: cars.recordset, Rewards: rewards.recordset });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.post('/drivers', async (req, res) => {
    const { first_name, last_name, country, date_of_birth, license_number } = req.body;

    if (!first_name || !last_name || !license_number)
        return res.status(400).json({ error: 'first_name, last_name, and license_number are required' });

    try {
        const pool   = await sql.connect(connectionString);
        const result = await pool.request()
            .input('first_name',     sql.VarChar(50), first_name)
            .input('last_name',      sql.VarChar(50), last_name)
            .input('country',        sql.VarChar(50), country        || null)
            .input('date_of_birth',  sql.Date,        date_of_birth  || null)
            .input('license_number', sql.VarChar(20), license_number)
            .query(`INSERT INTO Driver (first_name, last_name, country, date_of_birth, license_number)
                    OUTPUT INSERTED.*
                    VALUES (@first_name, @last_name, @country, @date_of_birth, @license_number)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

//  GET  /cars  all cars
//  GET  /cars?brand=Mercedes filter by brand
//  GET  /cars?min_hp=800 horsepower >= value
//  GET  /cars?max_price=500000  price <= value
//  GET  /cars?made_after=2015 year_manufactured > value
//  GET  /cars?made_before=2020 year_manufactured < value
//  GET  /cars/:id  car + upgrades


app.get('/cars', async (req, res) => {
    const { brand, min_hp, max_price, made_after, made_before } = req.query;
    try {
        const pool    = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM Car WHERE 1=1';
        if (brand)       { query += ' AND brand = @brand';                          request.input('brand',       sql.VarChar(50),     brand); }
        if (min_hp)      { query += ' AND horsepower >= @min_hp';                   request.input('min_hp',      sql.Int,             parseInt(min_hp)); }
        if (max_price)   { query += ' AND price <= @max_price';                     request.input('max_price',   sql.Decimal(10,2),   parseFloat(max_price)); }
        if (made_after)  { query += ' AND year_manufactured > @made_after';         request.input('made_after',  sql.Int,             parseInt(made_after)); }
        if (made_before) { query += ' AND year_manufactured < @made_before';        request.input('made_before', sql.Int,             parseInt(made_before)); }
        query += ' ORDER BY year_manufactured DESC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.get('/cars/:id', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);

        const car = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Car WHERE car_id = @id');

        if (!car.recordset.length)
            return res.status(404).json({ error: 'Car not found' });

        const upgrades = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT U.*, CU.install_date
                    FROM   Upgrade U
                    JOIN   Car_Upgrade CU ON U.upgrade_id = CU.upgrade_id
                    WHERE  CU.car_id = @id`);

        res.json({ ...car.recordset[0], Upgrades: upgrades.recordset });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.post('/cars', async (req, res) => {
    const { model, brand, horsepower, top_speed, year_manufactured, price } = req.body;

    if (!model || !brand || !horsepower || !top_speed || !year_manufactured || !price)
        return res.status(400).json({ error: 'model, brand, horsepower, top_speed, year_manufactured, and price are required' });

    try {
        const pool   = await sql.connect(connectionString);
        const result = await pool.request()
            .input('model',             sql.VarChar(50),   model)
            .input('brand',             sql.VarChar(50),   brand)
            .input('horsepower',        sql.Int,           horsepower)
            .input('top_speed',         sql.Int,           top_speed)
            .input('year_manufactured', sql.Int,           year_manufactured)
            .input('price',             sql.Decimal(10,2), price)
            .query(`INSERT INTO Car (model, brand, horsepower, top_speed, year_manufactured, price)
                    OUTPUT INSERTED.*
                    VALUES (@model, @brand, @horsepower, @top_speed, @year_manufactured, @price)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});


//  GET  /upgrades  all upgrades
//  GET  /upgrades?type=Engine filter by upgrade_type
//  GET  /upgrades?min_boost=30 performance_boost >= value
//  GET  /upgrades?max_price=10000 price <= value
//  POST /upgrades insert a new upgrade


app.get('/upgrades', async (req, res) => {
    const { type, min_boost, max_price } = req.query;
    try {
        const pool    = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM Upgrade WHERE 1=1';
        if (type)      { query += ' AND upgrade_type = @type';           request.input('type',      sql.VarChar(50),   type); }
        if (min_boost) { query += ' AND performance_boost >= @min_boost'; request.input('min_boost', sql.Int,           parseInt(min_boost)); }
        if (max_price) { query += ' AND price <= @max_price';             request.input('max_price', sql.Decimal(10,2), parseFloat(max_price)); }
        query += ' ORDER BY performance_boost DESC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.post('/upgrades', async (req, res) => {
    const { upgrade_name, upgrade_type, performance_boost, price } = req.body;

    if (!upgrade_name || !upgrade_type || !performance_boost || !price)
        return res.status(400).json({ error: 'upgrade_name, upgrade_type, performance_boost, and price are required' });

    const validTypes = ['Engine','Tires','Nitrous','Brakes','Aerodynamics'];
    if (!validTypes.includes(upgrade_type))
        return res.status(400).json({ error: `upgrade_type must be one of: ${validTypes.join(', ')}` });

    try {
        const pool   = await sql.connect(connectionString);
        const result = await pool.request()
            .input('upgrade_name',     sql.VarChar(50),   upgrade_name)
            .input('upgrade_type',     sql.VarChar(50),   upgrade_type)
            .input('performance_boost',sql.Int,           performance_boost)
            .input('price',            sql.Decimal(10,2), price)
            .query(`INSERT INTO Upgrade (upgrade_name, upgrade_type, performance_boost, price)
                    OUTPUT INSERTED.*
                    VALUES (@upgrade_name, @upgrade_type, @performance_boost, @price)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

//  GET  /races all races
//  GET  /races?after=2023-01-01 race_date > value
//  GET  /races?before=2025-01-01 race_date < value
//  GET  /races?location=Monaco partial location match
//  GET  /races?min_length=3 track_length >= value
//  GET  /races/:id  race + participants + results
//  POST /races  insert a new race

app.get('/races', async (req, res) => {
    const { after, before, location, min_length } = req.query;
    try {
        const pool    = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM Race WHERE 1=1';
        if (after)      { query += ' AND race_date > @after';           request.input('after',      sql.DateTime,    new Date(after)); }
        if (before)     { query += ' AND race_date < @before';          request.input('before',     sql.DateTime,    new Date(before)); }
        if (location)   { query += ' AND location LIKE @location';      request.input('location',   sql.VarChar(100),`%${location}%`); }
        if (min_length) { query += ' AND track_length >= @min_length';  request.input('min_length', sql.Decimal(5,2),parseFloat(min_length)); }
        query += ' ORDER BY race_date DESC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.get('/races/:id', async (req, res) => {
    try {
        const pool = await sql.connect(connectionString);

        const race = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Race WHERE race_id = @id');

        if (!race.recordset.length)
            return res.status(404).json({ error: 'Race not found' });

        const participants = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT D.driver_id, D.first_name, D.last_name, D.country,
                           C.car_id, C.model, C.brand
                    FROM   Race_Participant RP
                    JOIN   Driver D ON RP.driver_id = D.driver_id
                    JOIN   Car    C ON RP.car_id    = C.car_id
                    WHERE  RP.race_id = @id`);

        const results = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT RR.finishing_position, RR.completion_time,
                           D.first_name, D.last_name
                    FROM   Race_Result RR
                    JOIN   Driver D ON RR.driver_id = D.driver_id
                    WHERE  RR.race_id = @id
                    ORDER  BY RR.finishing_position ASC`);

        res.json({ ...race.recordset[0], Participants: participants.recordset, Results: results.recordset });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.post('/races', async (req, res) => {
    const { race_name, location, race_date, track_length, max_participants } = req.body;

    if (!race_name || !track_length || !max_participants)
        return res.status(400).json({ error: 'race_name, track_length, and max_participants are required' });

    try {
        const pool   = await sql.connect(connectionString);
        const result = await pool.request()
            .input('race_name',        sql.VarChar(50),   race_name)
            .input('location',         sql.VarChar(100),  location         || null)
            .input('race_date',        sql.DateTime,      race_date ? new Date(race_date) : new Date())
            .input('track_length',     sql.Decimal(5,2),  track_length)
            .input('max_participants', sql.Int,           max_participants)
            .query(`INSERT INTO Race (race_name, location, race_date, track_length, max_participants)
                    OUTPUT INSERTED.*
                    VALUES (@race_name, @location, @race_date, @track_length, @max_participants)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

//  GET  /results all results with names
//  GET  /results?race_id=1 results for a race
//  GET  /results?driver_id=1 results for a driver
//  GET  /results?position=1  all firstplace finishes
//  POST /results  post a race result


app.get('/results', async (req, res) => {
    const { race_id, driver_id, position } = req.query;
    try {
        const pool    = await sql.connect(connectionString);
        const request = pool.request();

        let query = `
            SELECT RR.race_id, R.race_name, R.location, R.race_date,
                   RR.finishing_position, RR.completion_time,
                   D.driver_id, D.first_name, D.last_name, D.country
            FROM   Race_Result RR
            JOIN   Race   R ON RR.race_id   = R.race_id
            JOIN   Driver D ON RR.driver_id = D.driver_id
            WHERE  1=1`;

        if (race_id)   { query += ' AND RR.race_id            = @race_id';   request.input('race_id',   sql.Int, parseInt(race_id)); }
        if (driver_id) { query += ' AND RR.driver_id          = @driver_id'; request.input('driver_id', sql.Int, parseInt(driver_id)); }
        if (position)  { query += ' AND RR.finishing_position = @position';  request.input('position',  sql.Int, parseInt(position)); }
        query += ' ORDER BY RR.race_id, RR.finishing_position ASC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.post('/results', async (req, res) => {
    const { race_id, driver_id, finishing_position, completion_time } = req.body;

    if (!race_id || !driver_id || !finishing_position || !completion_time)
        return res.status(400).json({ error: 'race_id, driver_id, finishing_position, and completion_time are required' });

    try {
        const pool   = await sql.connect(connectionString);
        const result = await pool.request()
            .input('race_id',           sql.Int,         race_id)
            .input('driver_id',         sql.Int,         driver_id)
            .input('finishing_position',sql.Int,         finishing_position)
            .input('completion_time',   sql.Decimal(6,2),completion_time)
            .query(`INSERT INTO Race_Result (race_id, driver_id, finishing_position, completion_time)
                    OUTPUT INSERTED.*
                    VALUES (@race_id, @driver_id, @finishing_position, @completion_time)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

//  GET  /rewards all rewards with driver names
//  GET  /rewards?driver_id=1  rewards for a driver
//  GET  /rewards?min_amount=5000 reward_amount >= value
//  GET  /rewards?after=2024-01-01 reward_date > value
//  POST /rewards add a reward

app.get('/rewards', async (req, res) => {
    const { driver_id, min_amount, after } = req.query;
    try {
        const pool    = await sql.connect(connectionString);
        const request = pool.request();

        let query = `
            SELECT DR.driver_id, D.first_name, D.last_name, D.country,
                   DR.reward_name, DR.reward_amount, DR.reward_date
            FROM   Driver_Reward DR
            JOIN   Driver D ON DR.driver_id = D.driver_id
            WHERE  1=1`;

        if (driver_id)  { query += ' AND DR.driver_id     = @driver_id';  request.input('driver_id',  sql.Int,           parseInt(driver_id)); }
        if (min_amount) { query += ' AND DR.reward_amount >= @min_amount'; request.input('min_amount', sql.Decimal(10,2), parseFloat(min_amount)); }
        if (after)      { query += ' AND DR.reward_date   > @after';       request.input('after',      sql.Date,          new Date(after)); }
        query += ' ORDER BY DR.reward_date DESC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.post('/rewards', async (req, res) => {
    const { driver_id, reward_name, reward_amount, reward_date } = req.body;

    if (!driver_id || !reward_name || reward_amount === undefined)
        return res.status(400).json({ error: 'driver_id, reward_name, and reward_amount are required' });

    try {
        const pool   = await sql.connect(connectionString);
        const result = await pool.request()
            .input('driver_id',    sql.Int,           driver_id)
            .input('reward_name',  sql.VarChar(50),   reward_name)
            .input('reward_amount',sql.Decimal(10,2), reward_amount)
            .input('reward_date',  sql.Date,          reward_date ? new Date(reward_date) : new Date())
            .query(`INSERT INTO Driver_Reward (driver_id, reward_name, reward_amount, reward_date)
                    OUTPUT INSERTED.*
                    VALUES (@driver_id, @reward_name, @reward_amount, @reward_date)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));