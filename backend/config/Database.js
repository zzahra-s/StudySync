const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'StudySync',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '12345678',
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
        console.log('✅ Connected to SQL Server (StudySync DB) - sa/12345678');
        return pool;
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        console.log('💡 SQL Server? DB StudySync? User:sa Pass:12345678?');
        process.exit(1);
    });

module.exports = { sql, poolPromise };

