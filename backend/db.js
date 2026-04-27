const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
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
