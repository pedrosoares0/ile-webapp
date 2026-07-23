# Operação

## Variáveis locais

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-or-anon-key>
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/postgres
```

Regras:

- `.env` não entra no Git;
- a anon/publishable key pode estar no frontend porque a proteção está no RLS;
- `DATABASE_URL`, senha do banco e service role nunca entram no bundle;
- rotacione qualquer senha exposta em conversa, log ou captura.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run db:migrate
```

O lint ainda depende da adição de uma configuração ESLint ao projeto.

## Aplicar migrations

`scripts/run_migrations.cjs`:

1. lê `DATABASE_URL` do `.env`;
2. ordena arquivos `supabase/migrations/*.sql`;
3. calcula SHA-256;
4. ignora migrations já aplicadas com checksum igual;
5. interrompe se uma migration aplicada foi alterada;
6. executa cada nova migration em transação;
7. registra em `public.schema_migrations`.

Nunca edite uma migration aplicada. Crie a próxima migration incremental.

## Backups

Backups locais ficam em `backups/` e são ignorados pelo Git, pois contêm dados pessoais e hashes de autenticação.

Backups gerados nesta implantação:

- `ile_before_production_20260721_074146.sql`: antes de qualquer alteração;
- `ile_after_migrations_20260721_075040.sql`: após foundation/Hub/RLS;
- `ile_membership_storage_20260721_080343.sql`: inclui `public`, `auth` e `storage` após participação e uploads.
- `ile_before_finance_20260722_204532.sql`: imediatamente antes da migration financeira.

Para novos backups, use `pg_dump` da mesma versão principal do servidor. O servidor auditado usa PostgreSQL 17.

Exemplo:

```bash
pg_dump "$DATABASE_URL" \
  --schema=public --schema=auth --schema=storage \
  --no-owner --no-privileges --clean --if-exists \
  --format=plain --file="backups/ile_$(date +%Y%m%d_%H%M%S).sql"
```

Restaurações de `auth` e `storage` devem ser testadas primeiro em um projeto isolado. Não restaure diretamente em produção sem janela, backup atual e validação.

## Checklist de validação

- `npm run db:migrate` lista todas as migrations como `SKIP` na segunda execução;
- `npm run build` passa;
- visitante consulta conteúdo público e não consulta contas;
- membro consulta apenas seu perfil;
- admin do terreiro não acessa outro terreiro;
- admin global acessa todos;
- cadastro malicioso não consegue definir `global_admin`;
- os quatro logins demo autenticam;
- solicitações por interesse e código ficam pendentes;
- somente admin do destino aprova;
- upload fora da pasta autorizada é bloqueado;
- upload permitido gera URL pública e registro no banco.

## Pendências operacionais

- configurar SMTP e confirmação de e-mail;
- recuperação de senha;
- testes automatizados e CI;
- logs, alertas e backup recorrente;
- separação formal de desenvolvimento, homologação e produção;
- política de privacidade/LGPD;
- resolver três vínculos históricos órfãos.

## Produção na Hostinger

A implantação oficial planejada usa Ubuntu 24.04 LTS, Docker Compose e Nginx/Caddy. A VPS executa frontend, worker, scheduler e monitoramento; PostgreSQL, Auth e Storage permanecem no Supabase. O procedimento completo está em [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md).
