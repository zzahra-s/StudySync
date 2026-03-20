
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const PORT = 5001;

app.use(bodyParser.json());

const connectionString = 'Server=localhost,1433;Database=lab3;User Id=sa;Password=YourStrong@Password1;Encrypt=false;TrustServerCertificate=true;';

process.on('uncaughtException', (err) => console.error('Uncaught:', err.message));
process.on('unhandledRejection', (reason) => console.error('Unhandled:', reason));

//Test 
app.get('/', (req, res) => {
    res.send('Lab3 API is running');
});

// GET /movies all movies
// GET /movies?genre=Sci-Fi filter by genre
// GET /movies?after=2010 released after year
// GET /movies?before=2020 released before year
// GET /movies?min_rating=8.5filter by min rating

// GET /sci-fi all Sci-Fi movies
// GET /sci-fi?after=2010  Sci-Fi movies after 2010
// GET /sci-fi?before=2020 Sci-Fi movies before 2020
// GET /sci-fi?min_rating=8.5 Sci-Fi movies with min rating

// GET /action  all Action movies
// GET /action?after=2010 Action movies after 2010
//
// GET /animation all Animation movies
// GET /thriller all Thriller movies
// GET /drama all Drama movies
// GET /comedy all Comedy movies


// Helper tobuild movie query with filters
async function getMovies(res, genre, query_params) {
    const { after, before, min_rating } = query_params;
    try {
        const pool = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM Movies WHERE 1=1';

        if (genre) {
            query += ' AND Genre = @genre';
            request.input('genre', sql.VarChar(50), genre);
        }
        if (after) {
            query += ' AND ReleaseYear > @after';
            request.input('after', sql.Int, parseInt(after));
        }
        if (before) {
            query += ' AND ReleaseYear < @before';
            request.input('before', sql.Int, parseInt(before));
        }
        if (min_rating) {
            query += ' AND Rating >= @min_rating';
            request.input('min_rating', sql.Decimal(3, 1), parseFloat(min_rating));
        }

        query += ' ORDER BY ReleaseYear DESC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

// All movies with optional filters
app.get('/movies', (req, res) => {
    getMovies(res, req.query.genre || null, req.query);
});

// Genre specific shortcut routes
app.get('/sci-fi',    (req, res) => getMovies(res, 'Sci-Fi',    req.query));
app.get('/action',    (req, res) => getMovies(res, 'Action',    req.query));
app.get('/animation', (req, res) => getMovies(res, 'Animation', req.query));
app.get('/thriller',  (req, res) => getMovies(res, 'Thriller',  req.query));
app.get('/drama',     (req, res) => getMovies(res, 'Drama',     req.query));
app.get('/comedy',    (req, res) => getMovies(res, 'Comedy',    req.query));
app.get('/family',    (req, res) => getMovies(res, 'Family',    req.query));
app.get('/sports',    (req, res) => getMovies(res, 'Sports',    req.query));

// post a new movie
app.post('/movies', async (req, res) => {
    const { MovieID, Title, Genre, ReleaseYear, Rating, RuntimeMinutes } = req.body;

    if (!MovieID || !Title || !Genre || !ReleaseYear || !Rating)
        return res.status(400).json({ error: 'MovieID, Title, Genre, ReleaseYear, and Rating are required' });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('MovieID', sql.Int, MovieID)
            .input('Title', sql.VarChar(100), Title)
            .input('Genre', sql.VarChar(50), Genre)
            .input('ReleaseYear', sql.Int, ReleaseYear)
            .input('Rating', sql.Decimal(3, 1), Rating)
            .input('RuntimeMinutes', sql.Int, RuntimeMinutes || null)
            .query(`
                INSERT INTO Movies (MovieID, Title, Genre, ReleaseYear, Rating, RuntimeMinutes)
                OUTPUT INSERTED.*
                VALUES (@MovieID, @Title, @Genre, @ReleaseYear, @Rating, @RuntimeMinutes)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// GET /football all players
// GET /football?position=Forward filter by position
// GET /football?country=Argentina filter by country
// GET /football?club=PSG filter by club
// GET /football?min_goals=300 players with goals >= value
// GET /football?max_goals=200 players with goals <= value

app.get('/football', async (req, res) => {
    const { position, country, club, min_goals, max_goals } = req.query;

    try {
        const pool = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM Football WHERE 1=1';

        if (position) {
            query += ' AND Position = @position';
            request.input('position', sql.VarChar(50), position);
        }
        if (country) {
            query += ' AND Country = @country';
            request.input('country', sql.VarChar(50), country);
        }
        if (club) {
            query += ' AND Club = @club';
            request.input('club', sql.VarChar(50), club);
        }
        if (min_goals) {
            query += ' AND GoalsScored >= @min_goals';
            request.input('min_goals', sql.Int, parseInt(min_goals));
        }
        if (max_goals) {
            query += ' AND GoalsScored <= @max_goals';
            request.input('max_goals', sql.Int, parseInt(max_goals));
        }

        query += ' ORDER BY GoalsScored DESC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

//post a new football player
app.post('/football', async (req, res) => {
    const { PlayerID, Name, Position, GoalsScored, Club, Country } = req.body;

    if (!PlayerID || !Name || !Position || GoalsScored === undefined || !Club || !Country)
        return res.status(400).json({ error: 'PlayerID, Name, Position, GoalsScored, Club, and Country are required' });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('PlayerID', sql.Int, PlayerID)
            .input('Name', sql.VarChar(100), Name)
            .input('Position', sql.VarChar(50), Position)
            .input('GoalsScored', sql.Int, GoalsScored)
            .input('Club', sql.VarChar(50), Club)
            .input('Country', sql.VarChar(50), Country)
            .query(`
                INSERT INTO Football (PlayerID, Name, Position, GoalsScored, Club, Country)
                OUTPUT INSERTED.*
                VALUES (@PlayerID, @Name, @Position, @GoalsScored, @Club, @Country)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// GET /cricket all players
// GET /cricket?role=Batsman filter by role
// GET /cricket?country=India filter by country
// GET /cricket?min_runs=5000 players with runs >= value
// GET /cricket?min_wickets=100 players with wickets >= value

app.get('/cricket', async (req, res) => {
    const { role, country, min_runs, min_wickets } = req.query;

    try {
        const pool = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM Cricket WHERE 1=1';

        if (role) {
            query += ' AND Role = @role';
            request.input('role', sql.VarChar(50), role);
        }
        if (country) {
            query += ' AND Country = @country';
            request.input('country', sql.VarChar(50), country);
        }
        if (min_runs) {
            query += ' AND RunsScored >= @min_runs';
            request.input('min_runs', sql.Int, parseInt(min_runs));
        }
        if (min_wickets) {
            query += ' AND WicketsTaken >= @min_wickets';
            request.input('min_wickets', sql.Int, parseInt(min_wickets));
        }

        query += ' ORDER BY RunsScored DESC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// post a new cricket player
app.post('/cricket', async (req, res) => {
    const { PlayerID, Name, Role, RunsScored, WicketsTaken, Country } = req.body;

    if (!PlayerID || !Name || !Role || RunsScored === undefined || WicketsTaken === undefined || !Country)
        return res.status(400).json({ error: 'PlayerID, Name, Role, RunsScored, WicketsTaken, and Country are required' });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('PlayerID', sql.Int, PlayerID)
            .input('Name', sql.VarChar(100), Name)
            .input('Role', sql.VarChar(50), Role)
            .input('RunsScored', sql.Int, RunsScored)
            .input('WicketsTaken', sql.Int, WicketsTaken)
            .input('Country', sql.VarChar(50), Country)
            .query(`
                INSERT INTO Cricket (PlayerID, Name, Role, RunsScored, WicketsTaken, Country)
                OUTPUT INSERTED.*
                VALUES (@PlayerID, @Name, @Role, @RunsScored, @WicketsTaken, @Country)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /space all missions
// GET /space?agency=NASA filter by agency
// GET /space?after=2000 launched after year
// GET /space?before=2020  launched before year
// GET /space?min_duration=100 missions lasting >= days
// GET /space?max_duration=500  missions lasting <= days


app.get('/space', async (req, res) => {
    const { agency, after, before, min_duration, max_duration } = req.query;

    try {
        const pool = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM SpaceMissions WHERE 1=1';

        if (agency) {
            query += ' AND Agency = @agency';
            request.input('agency', sql.VarChar(50), agency);
        }
        if (after) {
            query += ' AND LaunchYear > @after';
            request.input('after', sql.Int, parseInt(after));
        }
        if (before) {
            query += ' AND LaunchYear < @before';
            request.input('before', sql.Int, parseInt(before));
        }
        if (min_duration) {
            query += ' AND DurationDays >= @min_duration';
            request.input('min_duration', sql.Int, parseInt(min_duration));
        }
        if (max_duration) {
            query += ' AND DurationDays <= @max_duration';
            request.input('max_duration', sql.Int, parseInt(max_duration));
        }

        query += ' ORDER BY LaunchYear DESC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// post a new space mission
app.post('/space', async (req, res) => {
    const { MissionID, MissionName, LaunchYear, Agency, DurationDays } = req.body;

    if (!MissionID || !MissionName || !LaunchYear || !Agency || !DurationDays)
        return res.status(400).json({ error: 'MissionID, MissionName, LaunchYear, Agency, and DurationDays are required' });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('MissionID', sql.Int, MissionID)
            .input('MissionName', sql.VarChar(100), MissionName)
            .input('LaunchYear', sql.Int, LaunchYear)
            .input('Agency', sql.VarChar(50), Agency)
            .input('DurationDays', sql.Int, DurationDays)
            .query(`
                INSERT INTO SpaceMissions (MissionID, MissionName, LaunchYear, Agency, DurationDays)
                OUTPUT INSERTED.*
                VALUES (@MissionID, @MissionName, @LaunchYear, @Agency, @DurationDays)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /recipes all recipes
// GET /recipes?cuisine=Italian filter by cuisine
// GET /recipes?max_time=30 ready in <= minutes
// GET /recipes?max_cost=4.00 filter by max cost

app.get('/recipes', async (req, res) => {
    const { cuisine, max_time, max_cost } = req.query;

    try {
        const pool = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM Recipes WHERE 1=1';

        if (cuisine) {
            query += ' AND Cuisine = @cuisine';
            request.input('cuisine', sql.VarChar(50), cuisine);
        }
        if (max_time) {
            query += ' AND CookingTime <= @max_time';
            request.input('max_time', sql.Int, parseInt(max_time));
        }
        if (max_cost) {
            query += ' AND Cost <= @max_cost';
            request.input('max_cost', sql.Decimal(5, 2), parseFloat(max_cost));
        }

        query += ' ORDER BY CookingTime ASC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST a new recipe
app.post('/recipes', async (req, res) => {
    const { RecipeID, Name, Cuisine, Ingredients, CookingTime, Cost } = req.body;

    if (!RecipeID || !Name || !Cuisine || !CookingTime)
        return res.status(400).json({ error: 'RecipeID, Name, Cuisine, and CookingTime are required' });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('RecipeID', sql.Int, RecipeID)
            .input('Name', sql.VarChar(100), Name)
            .input('Cuisine', sql.VarChar(50), Cuisine)
            .input('Ingredients', sql.Text, Ingredients || null)
            .input('CookingTime', sql.Int, CookingTime)
            .input('Cost', sql.Decimal(5, 2), Cost || null)
            .query(`
                INSERT INTO Recipes (RecipeID, Name, Cuisine, Ingredients, CookingTime, Cost)
                OUTPUT INSERTED.*
                VALUES (@RecipeID, @Name, @Cuisine, @Ingredients, @CookingTime, @Cost)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /workouts all workouts
// GET /workouts?category=Cardio filter by category
// GET /workouts?max_duration=30 workouts within minutes
// GET /workouts?min_calories=200 workouts burning >= calories

app.get('/workouts', async (req, res) => {
    const { category, max_duration, min_calories } = req.query;

    try {
        const pool = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM Workouts WHERE 1=1';

        if (category) {
            query += ' AND Category = @category';
            request.input('category', sql.VarChar(50), category);
        }
        if (max_duration) {
            query += ' AND Duration <= @max_duration';
            request.input('max_duration', sql.Int, parseInt(max_duration));
        }
        if (min_calories) {
            query += ' AND CaloriesBurned >= @min_calories';
            request.input('min_calories', sql.Int, parseInt(min_calories));
        }

        query += ' ORDER BY CaloriesBurned DESC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST a new workout
app.post('/workouts', async (req, res) => {
    const { WorkoutID, Name, Category, Duration, CaloriesBurned } = req.body;

    if (!WorkoutID || !Name || !Category || !Duration || !CaloriesBurned)
        return res.status(400).json({ error: 'WorkoutID, Name, Category, Duration, and CaloriesBurned are required' });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('WorkoutID', sql.Int, WorkoutID)
            .input('Name', sql.VarChar(100), Name)
            .input('Category', sql.VarChar(50), Category)
            .input('Duration', sql.Int, Duration)
            .input('CaloriesBurned', sql.Int, CaloriesBurned)
            .query(`
                INSERT INTO Workouts (WorkoutID, Name, Category, Duration, CaloriesBurned)
                OUTPUT INSERTED.*
                VALUES (@WorkoutID, @Name, @Category, @Duration, @CaloriesBurned)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /poetry  all poems
// GET /poetry?era=Romantic filter by era
// GET /poetry?theme=Love  filter by theme
// GET /poetry?poet=Rumi  filter by poet name (partial)

app.get('/poetry', async (req, res) => {
    const { era, theme, poet } = req.query;

    try {
        const pool = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM Poetry WHERE 1=1';

        if (era) {
            query += ' AND Era = @era';
            request.input('era', sql.VarChar(50), era);
        }
        if (theme) {
            query += ' AND Theme = @theme';
            request.input('theme', sql.VarChar(50), theme);
        }
        if (poet) {
            query += ' AND Poet LIKE @poet';
            request.input('poet', sql.VarChar(100), `%${poet}%`);
        }

        query += ' ORDER BY PoemID ASC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST a new poem
app.post('/poetry', async (req, res) => {
    const { PoemID, Title, Poet, Era, Theme } = req.body;

    if (!PoemID || !Title || !Poet || !Theme)
        return res.status(400).json({ error: 'PoemID, Title, Poet, and Theme are required' });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('PoemID', sql.Int, PoemID)
            .input('Title', sql.VarChar(100), Title)
            .input('Poet', sql.VarChar(100), Poet)
            .input('Era', sql.VarChar(50), Era || null)
            .input('Theme', sql.VarChar(50), Theme)
            .query(`
                INSERT INTO Poetry (PoemID, Title, Poet, Era, Theme)
                OUTPUT INSERTED.*
                VALUES (@PoemID, @Title, @Poet, @Era, @Theme)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.get('/physics', async (req, res) => {
    const { field, after, before, min_impact } = req.query;

    try {
        const pool = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM PhysicsExperiments WHERE 1=1';

        if (field) {
            query += ' AND Field = @field';
            request.input('field', sql.VarChar(50), field);
        }
        if (after) {
            query += ' AND YearConducted > @after';
            request.input('after', sql.Int, parseInt(after));
        }
        if (before) {
            query += ' AND YearConducted < @before';
            request.input('before', sql.Int, parseInt(before));
        }
        if (min_impact) {
            query += ' AND ImpactScore >= @min_impact';
            request.input('min_impact', sql.Decimal(4, 1), parseFloat(min_impact));
        }

        query += ' ORDER BY ImpactScore DESC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST a new physics experiment
app.post('/physics', async (req, res) => {
    const { ExperimentID, Title, Field, YearConducted, ImpactScore } = req.body;
 
    if (!ExperimentID || !Title || !Field || !YearConducted || !ImpactScore)
        return res.status(400).json({ error: 'ExperimentID, Title, Field, YearConducted, and ImpactScore are required' });
 
    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('ExperimentID', sql.Int, ExperimentID)
            .input('Title', sql.VarChar(100), Title)
            .input('Field', sql.VarChar(50), Field)
            .input('YearConducted', sql.Int, YearConducted)
            .input('ImpactScore', sql.Decimal(4, 1), ImpactScore)
            .query(`
                INSERT INTO PhysicsExperiments (ExperimentID, Title, Field, YearConducted, ImpactScore)
                OUTPUT INSERTED.*
                VALUES (@ExperimentID, @Title, @Field, @YearConducted, @ImpactScore)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}); 
    


app.get('/maths', async (req, res) => {
    const { category, difficulty, min_points } = req.query;

    try {
        const pool = await sql.connect(connectionString);
        const request = pool.request();

        let query = 'SELECT * FROM Mathematics WHERE 1=1';

        if (category) {
            query += ' AND Category = @category';
            request.input('category', sql.VarChar(50), category);
        }
        if (difficulty) {
            query += ' AND DifficultyLevel = @difficulty';
            request.input('difficulty', sql.VarChar(20), difficulty);
        }
        if (min_points) {
            query += ' AND Points >= @min_points';
            request.input('min_points', sql.Int, parseInt(min_points));
        }

        query += ' ORDER BY Points DESC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST a new maths problem
app.post('/maths', async (req, res) => {
    const { ProblemID, Title, Category, DifficultyLevel, Points, Description } = req.body;

    if (!ProblemID || !Title || !Category || !DifficultyLevel || !Points)
        return res.status(400).json({ error: 'ProblemID, Title, Category, DifficultyLevel, and Points are required' });

    const validDifficulties = ['Easy', 'Medium', 'Hard', 'Insanely Hard'];
    if (!validDifficulties.includes(DifficultyLevel))
        return res.status(400).json({ error: `DifficultyLevel must be one of: ${validDifficulties.join(', ')}` });

    try {
        const pool = await sql.connect(connectionString);
        const result = await pool.request()
            .input('ProblemID', sql.Int, ProblemID)
            .input('Title', sql.VarChar(100), Title)
            .input('Category', sql.VarChar(50), Category)
            .input('DifficultyLevel', sql.VarChar(20), DifficultyLevel)
            .input('Points', sql.Int, Points)
            .input('Description', sql.Text, Description || null)
            .query(`
                INSERT INTO Mathematics (ProblemID, Title, Category, DifficultyLevel, Points, Description)
                OUTPUT INSERTED.*
                VALUES (@ProblemID, @Title, @Category, @DifficultyLevel, @Points, @Description)
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