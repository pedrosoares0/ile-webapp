const { Client } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const env = fs.readFileSync(path.join(root, '.env'), 'utf8');
const connectionString = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();

if (!connectionString) {
  throw new Error('DATABASE_URL not found in .env');
}

const migrationsDir = path.join(root, 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort();
const db = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await db.connect();
  await db.query(`
    create table if not exists public.schema_migrations (
      name text primary key,
      checksum text not null,
      executed_at timestamptz not null default now()
    )
  `);

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const checksum = crypto.createHash('sha256').update(sql).digest('hex');
    const existing = await db.query('select checksum from public.schema_migrations where name = $1', [file]);

    if (existing.rowCount) {
      if (existing.rows[0].checksum !== checksum) {
        throw new Error(`Migration already applied with a different checksum: ${file}`);
      }
      console.log(`SKIP ${file}`);
      continue;
    }

    console.log(`APPLY ${file}`);
    await db.query('begin');
    try {
      await db.query(sql);
      await db.query('insert into public.schema_migrations (name, checksum) values ($1, $2)', [file, checksum]);
      await db.query('commit');
      console.log(`OK ${file}`);
    } catch (error) {
      await db.query('rollback');
      throw error;
    }
  }
}

main()
  .catch((error) => {
    console.error(`MIGRATION_FAILED code=${error.code || 'unknown'} message=${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => db.end().catch(() => {}));
