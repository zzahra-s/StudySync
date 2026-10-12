const { Pool, types, defaults } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Return the same JS types the app got from SQL Server:
// NUMERIC/DECIMAL and COUNT/SUM (bigint) as numbers, DATE/TIMESTAMP as UTC Dates.
types.setTypeParser(types.builtins.NUMERIC, (v) => parseFloat(v));
types.setTypeParser(types.builtins.INT8, (v) => parseInt(v, 10));
types.setTypeParser(types.builtins.DATE, (v) => new Date(`${v}T00:00:00Z`));
types.setTypeParser(types.builtins.TIMESTAMP, (v) => new Date(`${v.replace(' ', 'T')}Z`));
defaults.parseInputDatesAsUTC = true;

const connectionString = process.env.DATABASE_URL;
const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString || '');

const pgPool = new Pool({
  connectionString,
  ssl: isLocal || process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  max: parseInt(process.env.DB_POOL_MAX, 10) || 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pgPool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err.message);
});

// Minimal stand-in for the mssql types used in models, e.g. sql.Int or sql.VarChar(100).
// Each one maps to the Postgres cast applied to the parameter.
const pgType = (name) => Object.assign(() => ({ pgType: name }), { pgType: name });
const sql = {
  Int: pgType('int'),
  BigInt: pgType('bigint'),
  VarChar: pgType('varchar'),
  NVarChar: pgType('varchar'),
  Text: pgType('text'),
  Decimal: pgType('numeric'),
  Float: pgType('float8'),
  Date: pgType('date'),
  DateTime: pgType('timestamp'),
  Bit: pgType('boolean')
};

// Rewrites @name parameters to $1, $2 ... while leaving string literals and :: casts alone.
function toPositional(text, params) {
  const values = [];
  const indexes = new Map();
  let out = '';
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (ch === "'") {
      const end = text.indexOf("'", i + 1);
      const stop = end === -1 ? text.length : end + 1;
      out += text.slice(i, stop);
      i = stop;
      continue;
    }

    if (ch === '@' && /[A-Za-z_]/.test(text[i + 1] || '')) {
      const match = /^@([A-Za-z_][A-Za-z0-9_]*)/.exec(text.slice(i));
      const name = match[1];
      if (!params.has(name)) {
        throw new Error(`Must declare the scalar variable "@${name}".`);
      }
      if (!indexes.has(name)) {
        values.push(params.get(name).value);
        indexes.set(name, values.length);
      }
      const { type } = params.get(name);
      out += `$${indexes.get(name)}${type ? `::${type}` : ''}`;
      i += match[0].length;
      continue;
    }

    out += ch;
    i += 1;
  }

  return { text: out, values };
}

class Request {
  constructor(pool) {
    this.pool = pool;
    this.params = new Map();
  }

  input(name, type, value) {
    if (arguments.length === 2) {
      value = type;
      type = undefined;
    }
    const pg = type && type.pgType;
    if (value === undefined) {
      value = null;
    } else if (pg === 'int' && value !== null && value !== '' && Number.isFinite(Number(value))) {
      // mssql truncated fractional values bound to sql.Int (e.g. 106.5 credits -> 106)
      value = Math.trunc(Number(value));
    }
    this.params.set(name, { type: pg, value });
    return this;
  }

  async query(text) {
    const { text: pgText, values } = toPositional(text, this.params);
    const result = await this.pool.query(pgText, values);
    return {
      recordset: result.rows,
      recordsets: [result.rows],
      rowsAffected: [result.rowCount || 0]
    };
  }
}

const pool = {
  request: () => new Request(pgPool),
  query: (text, values) => pgPool.query(text, values),
  end: () => pgPool.end()
};

const poolPromise = Promise.resolve(pool);

async function getConnectionPool() {
  return pool;
}

module.exports = {
  sql,
  pool,
  poolPromise,
  getConnectionPool
};
