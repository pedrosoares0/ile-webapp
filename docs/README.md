# Documentação do Ilê

Este diretório descreve o estado real do sistema após a migração dos fluxos principais para Supabase.

## Documentos

- [ARQUITETURA.md](ARQUITETURA.md): componentes, perfis, navegação e fluxo dos dados.
- [BANCO_E_SEGURANCA.md](BANCO_E_SEGURANCA.md): tabelas, funções, migrations, RLS e Storage.
- [FLUXOS_FUNCIONAIS.md](FLUXOS_FUNCIONAIS.md): login, cadastro, participação, aprovação, Hub e publicações.
- [OPERACAO.md](OPERACAO.md): ambiente, migrations, backups, testes e diagnóstico.
- [PLANO_PRODUCAO.md](PLANO_PRODUCAO.md): concluído, pendências e próximas etapas.

## Fonte da verdade

O schema versionado está em `supabase/migrations`. Se houver divergência entre uma descrição e o SQL, prevalece a migration aplicada. A tabela `public.schema_migrations` registra nome, checksum e data de execução.

## Estado resumido

- autenticação real pelo Supabase Auth;
- isolamento por perfil e terreiro com RLS;
- CRUD real de terreiros, usuários, eventos, pontos, avisos e orações;
- feed, stories, reações, favoritos e itens salvos persistidos;
- solicitação de participação com aprovação obrigatória;
- uploads de posts, stories e imagem do terreiro pelo Supabase Storage;
- sem fallback para seed ou `localStorage`.
