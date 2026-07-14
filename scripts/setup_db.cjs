const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Read env
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const connectionString = dbUrlMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);
const pg = new Client({ connectionString });

const TEST_USERS = [
  {
    email: 'admin@ile.app',
    password: '123456',
    username: 'admin',
    nome: 'Admin Geral',
    scope: 'global',
    role: 'global_admin',
    terreiroId: '',
    userId: null,
  },
  {
    email: 'pedro@ile.app',
    password: '123456',
    username: 'pedro',
    nome: 'Pedro',
    scope: 'global',
    role: 'global_admin',
    terreiroId: '',
    userId: null,
  },
  {
    email: 'erick@t7ca.app',
    password: '123456',
    username: 'erick',
    nome: 'Erick',
    scope: 'terreiro',
    role: 'terreiro_admin',
    terreiroId: 'terreiro_t7ca',
    userId: 'user_erick',
  },
  {
    email: 'membro@t7ca.app',
    password: '123456',
    username: 'membro',
    nome: 'Membro Aleatório',
    scope: 'terreiro',
    role: 'terreiro_user',
    terreiroId: 'terreiro_t7ca',
    userId: 'user_membro',
  },
];

async function main() {
  try {
    console.log('Connecting to PostgreSQL...');
    await pg.connect();

    // 1. Recreate public tables
    console.log('\n--- Step 1: Recreating public tables ---');
    await pg.query(`
      DROP TABLE IF EXISTS public.pontos CASCADE;
      DROP TABLE IF EXISTS public.events CASCADE;
      DROP TABLE IF EXISTS public.users CASCADE;
      DROP TABLE IF EXISTS public.accounts CASCADE;
      DROP TABLE IF EXISTS public.terreiros CASCADE;

      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE public.terreiros (
        id text PRIMARY KEY,
        nome text NOT NULL,
        cidade text, estado text, dirigente text, contato text, observacoes text,
        ativo boolean DEFAULT true,
        access_account_id uuid,
        created_at timestamp with time zone DEFAULT now()
      );

      CREATE TABLE public.accounts (
        id uuid PRIMARY KEY,
        nome text, email text,
        username text UNIQUE,
        scope text DEFAULT 'terreiro',
        role text DEFAULT 'terreiro_user',
        terreiro_id text, user_id text,
        created_at timestamp with time zone DEFAULT now()
      );

      CREATE TABLE public.users (
        id text PRIMARY KEY,
        nome text NOT NULL, email text, telefone text,
        role text DEFAULT 'membro', status text DEFAULT 'ativo',
        terreiro_id text,
        access_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
        created_at timestamp with time zone DEFAULT now()
      );

      CREATE TABLE public.events (
        id text PRIMARY KEY,
        date date NOT NULL, title text NOT NULL, time text, location text,
        type text DEFAULT 'normal', category text,
        terreiro_id text NOT NULL, description text,
        created_at timestamp with time zone DEFAULT now()
      );

      CREATE TABLE public.pontos (
        id text PRIMARY KEY,
        titulo text NOT NULL, categoria text, youtube_url text, descricao text,
        thumbnail text, terreiro_id text NOT NULL, letra text,
        created_at timestamp with time zone DEFAULT now()
      );

      -- Recreate trigger
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      DROP FUNCTION IF EXISTS public.handle_new_user();

      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.accounts (id, nome, email, username, scope, role, terreiro_id, user_id)
        VALUES (
          new.id,
          COALESCE(new.raw_user_meta_data->>'nome', ''),
          new.email,
          COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
          COALESCE(new.raw_user_meta_data->>'scope', 'terreiro'),
          COALESCE(new.raw_user_meta_data->>'role', 'terreiro_user'),
          COALESCE(new.raw_user_meta_data->>'terreiroId', ''),
          COALESCE(new.raw_user_meta_data->>'userId', null)
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `);
    console.log('Public tables and trigger recreated.');

    // 2. Seed Terreiro
    console.log('\n--- Step 2: Seeding Terreiro T7CA ---');
    await pg.query(`
      INSERT INTO public.terreiros (id, nome, cidade, estado, dirigente, contato, observacoes, ativo)
      VALUES ('terreiro_t7ca', 'T7CA - Terreiro de Umbanda 7 Caminhos de Aruanda', 'Salvador', 'BA', 'Pai Rodrigo', '(71) 99999-0001', 'Casa principal do sistema Ilê.', true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Terreiro seeded.');

    // 3. Clean up ALL old auth users for these emails
    console.log('\n--- Step 3: Cleaning old auth users ---');
    for (const user of TEST_USERS) {
      // Get user IDs first
      const { rows } = await pg.query(`SELECT id FROM auth.users WHERE email = $1`, [user.email]);
      for (const row of rows) {
        await pg.query(`DELETE FROM auth.identities WHERE user_id = $1`, [row.id]);
        await pg.query(`DELETE FROM auth.sessions WHERE user_id = $1`, [row.id]);
        await pg.query(`DELETE FROM auth.refresh_tokens WHERE user_id::uuid = $1`, [row.id]);
        await pg.query(`DELETE FROM auth.mfa_factors WHERE user_id = $1`, [row.id]);
      }
      await pg.query(`DELETE FROM auth.users WHERE email = $1`, [user.email]);
    }
    console.log('Old auth users fully cleaned.');

    // 4. Insert users via SQL with proper structure
    console.log('\n--- Step 4: Creating users via SQL ---');
    for (const user of TEST_USERS) {
      const userId = crypto.randomUUID();
      const meta = JSON.stringify({
        nome: user.nome,
        username: user.username,
        scope: user.scope,
        role: user.role,
        terreiroId: user.terreiroId,
        userId: user.userId,
      });

      // Insert into auth.users with bcrypt password via pgcrypto
      await pg.query(`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password,
          email_confirmed_at, confirmation_token, recovery_token, email_change_token_new,
          email_change, raw_app_meta_data, raw_user_meta_data,
          is_super_admin, created_at, updated_at,
          phone, phone_confirmed_at, confirmation_sent_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          $1, 'authenticated', 'authenticated', $2,
          crypt($3, gen_salt('bf')),
          now(), '', '', '', '',
          '{"provider":"email","providers":["email"]}',
          $4::jsonb,
          false, now(), now(),
          null, null, now()
        )
      `, [userId, user.email, user.password, meta]);

      // Insert matching identity (using string interpolation to avoid pooler param issues)
      const escapedEmail = user.email.replace(/'/g, "''");
      await pg.query(`
        INSERT INTO auth.identities (
          id, user_id, identity_data, provider, provider_id,
          last_sign_in_at, created_at, updated_at
        ) VALUES (
          '${userId}'::uuid, '${userId}'::uuid,
          '{"sub":"${userId}","email":"${escapedEmail}","email_verified":true}'::jsonb,
          'email', '${escapedEmail}',
          now(), now(), now()
        )
      `);

      console.log(`  ✅ Created ${user.email} (username: ${user.username}, ID: ${userId})`);

      // The trigger should have created the accounts record; update user_id if needed
      if (user.userId) {
        await pg.query(`UPDATE public.accounts SET user_id = $1 WHERE id = $2`, [user.userId, userId]);
      }
    }

    // 5. Seed member records in public.users
    console.log('\n--- Step 5: Seeding public.users records ---');
    const erickResult = await pg.query(`SELECT id FROM public.accounts WHERE username = 'erick'`);
    if (erickResult.rows.length > 0) {
      await pg.query(`
        INSERT INTO public.users (id, nome, email, role, status, terreiro_id, access_account_id)
        VALUES ('user_erick', 'Erick', 'erick@t7ca.app', 'administrador', 'ativo', 'terreiro_t7ca', $1)
        ON CONFLICT (id) DO NOTHING
      `, [erickResult.rows[0].id]);
      console.log('  Erick user record created.');
    }

    const membroResult = await pg.query(`SELECT id FROM public.accounts WHERE username = 'membro'`);
    if (membroResult.rows.length > 0) {
      await pg.query(`
        INSERT INTO public.users (id, nome, email, role, status, terreiro_id, access_account_id)
        VALUES ('user_membro', 'Membro Aleatório', 'membro@t7ca.app', 'membro', 'ativo', 'terreiro_t7ca', $1)
        ON CONFLICT (id) DO NOTHING
      `, [membroResult.rows[0].id]);
      console.log('  Membro user record created.');
    }

    // 6. Seed test event and ponto
    console.log('\n--- Step 6: Seeding test data ---');
    await pg.query(`
      INSERT INTO public.events (id, date, title, time, location, type, category, terreiro_id, description)
      VALUES ('event_1', CURRENT_DATE + INTERVAL '2 days', 'Gira de Caboclo', '19:00', 'Terreiro T7CA', 'importante', 'Religioso', 'terreiro_t7ca', 'Sessão aberta com atendimento espiritual.')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO public.pontos (id, titulo, categoria, youtube_url, descricao, thumbnail, terreiro_id, letra)
      VALUES ('ponto_1', 'Ponto Zé Pilintra', 'CABOCLOS', 'https://youtu.be/jqoLv8hUajk', 'Ponto de saudação a Zé Pilintra.', 'https://img.youtube.com/vi/jqoLv8hUajk/hqdefault.jpg', 'terreiro_t7ca', 'Ele vem na gira,\\nPra salvar quem tem fé!')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Test data seeded.');

    // 7. Verify logins via Supabase Auth
    console.log('\n--- Step 7: Verifying logins ---');
    await supabase.auth.signOut();

    for (const user of TEST_USERS) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });
      if (error) {
        console.log(`  ❌ ${user.email} (${user.username}): ${error.message}`);
      } else {
        console.log(`  ✅ ${user.email} (${user.username}): Login OK`);
        await supabase.auth.signOut();
      }
    }

    console.log('\n🎉 Setup complete!');
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await pg.end();
  }
}

main();
