const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Support both DB_SERVER and DB_HOST env names.
  server: process.env.DB_SERVER || process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function getConnectionPool() {
  if (pool) {
    return pool;
  }

  pool = await sql.connect(dbConfig);
  return pool;
}

module.exports = {
  getConnectionPool
};
