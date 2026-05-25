import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS session (
      sid VARCHAR NOT NULL COLLATE "default",
      sess JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL,
      CONSTRAINT session_pkey PRIMARY KEY (sid)
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS commanders (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      color_identity TEXT[] NOT NULL DEFAULT '{}',
      partner_type TEXT NOT NULL DEFAULT 'none',
      partner_with_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('Database initialized');
}

export default pool;
