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
    CREATE TABLE IF NOT EXISTS lists (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS commanders (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      color_identity TEXT[] NOT NULL DEFAULT '{}',
      partner_type TEXT NOT NULL DEFAULT 'none',
      partner_with_name TEXT,
      scryfall_id TEXT,
      list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Migrate any pre-lists commanders into a default list
  await pool.query(`
    DO $$
    DECLARE default_id INTEGER;
    BEGIN
      IF EXISTS (SELECT 1 FROM commanders WHERE list_id IS NULL LIMIT 1) THEN
        INSERT INTO lists (name) VALUES ('My Commanders') RETURNING id INTO default_id;
        UPDATE commanders SET list_id = default_id WHERE list_id IS NULL;
      END IF;
    END $$;
  `);

  // Add columns to existing installs that predate this schema
  await pool.query(`ALTER TABLE commanders ADD COLUMN IF NOT EXISTS scryfall_id TEXT;`);
  await pool.query(`ALTER TABLE commanders ADD COLUMN IF NOT EXISTS list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE;`);

  console.log('Database initialized');
}

export default pool;
