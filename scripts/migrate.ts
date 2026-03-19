/**
 * Run once to create tables: npx tsx scripts/migrate.ts
 */
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        TEXT NOT NULL,
      phone       TEXT NOT NULL UNIQUE,
      email       TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client','admin')),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      client_name  TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      client_email TEXT NOT NULL,
      services    JSONB NOT NULL DEFAULT '[]',
      date        DATE NOT NULL,
      time        TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','completed','cancelled')),
      notes       TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_date    ON appointments(date);
    CREATE INDEX IF NOT EXISTS idx_appointments_status  ON appointments(status);
  `)
  console.log('✅ Migration complete')
  await pool.end()
}

migrate().catch((err) => { console.error(err); process.exit(1) })
