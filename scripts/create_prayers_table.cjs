const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read connection string from .env
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);

if (!dbUrlMatch) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

let connectionString = dbUrlMatch[1].trim();

// Try to use Session Mode Pooler (port 5432) which supports IPv4
if (connectionString.includes(':6543')) {
  console.log('Converting pooler port to 5432 (Session Mode)...');
  connectionString = connectionString.replace(':6543', ':5432');
}

const pg = new Client({ connectionString });

async function main() {
  try {
    console.log('Connecting to PostgreSQL database...');
    await pg.connect();

    console.log('Creating prayer_requests table in public schema...');
    await pg.query(`
      CREATE TABLE IF NOT EXISTS public.prayer_requests (
        id text PRIMARY KEY,
        name text NOT NULL,
        type text NOT NULL,
        content text NOT NULL,
        answered boolean DEFAULT false NOT NULL,
        answered_at timestamp with time zone,
        account_id text NOT NULL,
        terreiro_id text NOT NULL,
        created_at timestamp with time zone DEFAULT now()
      );
    `);
    console.log('prayer_requests table created/checked successfully.');

  } catch (error) {
    console.error('Error executing database query:', error);
  } finally {
    await pg.end();
    console.log('Database connection closed.');
  }
}

main();
