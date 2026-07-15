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

const connectionString = dbUrlMatch[1].trim();
const pg = new Client({ connectionString });

async function main() {
  try {
    console.log('Connecting to PostgreSQL database...');
    await pg.connect();

    console.log('Creating notices table in public schema...');
    await pg.query(`
      CREATE TABLE IF NOT EXISTS public.notices (
        id text PRIMARY KEY,
        title text NOT NULL,
        content text NOT NULL,
        category text NOT NULL,
        date timestamp with time zone,
        terreiro_id text NOT NULL,
        created_at timestamp with time zone DEFAULT now()
      );
    `);
    console.log('Notices table created/checked successfully.');

    // Seed some initial data if table is empty
    const { rows } = await pg.query('SELECT count(*) FROM public.notices');
    const count = parseInt(rows[0].count, 10);
    
    if (count === 0) {
      console.log('Seeding initial notices...');
      const seedNotices = [
        {
          id: 'not_1',
          title: 'Gira Extraordinária de Pretos Velhos',
          content: 'Informamos a todos os membros e consulentes que teremos uma gira festiva extraordinária de Pretos Velhos no próximo sábado. Tragam flores e velas brancas se desejarem firmar intenções.',
          category: 'Programação',
          date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          terreiro_id: 'terreiro_t7ca'
        },
        {
          id: 'not_2',
          title: 'Uso obrigatório de roupas brancas',
          content: 'Relembramos a importância do respeito às vestimentas rituais. O uso de trajes completamente brancos e adequados é obrigatório para adentrar a corrente de trabalhos.',
          category: 'Importante',
          date: new Date().toISOString(),
          terreiro_id: 'terreiro_t7ca'
        },
        {
          id: 'not_3',
          title: 'Manutenção do Terreiro no Domingo',
          content: 'Contamos com a colaboração de todos os filhos da casa no mutirão de limpeza e pintura das salas de atendimento que ocorrerá neste domingo a partir das 9h.',
          category: 'Geral',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          terreiro_id: 'terreiro_t7ca'
        }
      ];

      for (const notice of seedNotices) {
        await pg.query(`
          INSERT INTO public.notices (id, title, content, category, date, terreiro_id, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, now())
        `, [notice.id, notice.title, notice.content, notice.category, notice.date, notice.terreiro_id]);
      }
      console.log('Seed notices inserted successfully!');
    } else {
      console.log('Table already contains data, skipping seed.');
    }

  } catch (error) {
    console.error('Error executing database query:', error);
  } finally {
    await pg.end();
    console.log('Database connection closed.');
  }
}

main();
