const sql = require('mssql');
const dotenv = require('dotenv');
dotenv.config();

const config = {
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to sql server');
        return pool;
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });
module.exports = { sql, poolPromise };
