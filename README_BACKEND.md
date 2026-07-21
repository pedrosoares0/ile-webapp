# Ilê - Backend e Supabase

O backend atual utiliza Supabase Auth, PostgreSQL, Row Level Security e Storage. O frontend acessa dados com a anon/publishable key; a autorização efetiva fica nas policies e funções SQL versionadas.

## Documentação

- [Visão geral](docs/README.md)
- [Arquitetura](docs/ARQUITETURA.md)
- [Banco e segurança](docs/BANCO_E_SEGURANCA.md)
- [Fluxos funcionais](docs/FLUXOS_FUNCIONAIS.md)
- [Operação, migrations e backups](docs/OPERACAO.md)
- [Plano de produção](docs/PLANO_PRODUCAO.md)

## Aplicar migrations

Configure `.env` a partir de `.env.example` e execute:

```bash
npm run db:migrate
```

O runner aplica `supabase/migrations/*.sql` em transações e registra o checksum em `public.schema_migrations`.

## Regras importantes

- não edite migration já aplicada; crie uma nova;
- não coloque `DATABASE_URL` ou service role no frontend;
- não versione `.env` ou `backups/`;
- mantenha o caminho do Storage como `<terreiro_id>/<arquivo>`;
- toda nova tabela exposta pela API deve receber RLS e testes por perfil;
- credenciais de demonstração são temporárias e devem sair antes da abertura pública.

## Credenciais reais de desenvolvimento

- `admin / 123456`: admin global;
- `erick / 123456`: admin do T7CA;
- `membro / 123456`: membro do T7CA;
- `membro.hub / 123456`: conta sem terreiro.

## Situação

O build passa e os fluxos principais foram testados com contas/arquivos descartáveis. O sistema ainda não deve ser considerado pronto para abertura pública; consulte as pendências em `docs/PLANO_PRODUCAO.md`.
