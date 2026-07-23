# Documentação do Ilê

Este diretório descreve o estado real do sistema após a migração dos fluxos principais para Supabase.

## Documentos

- [ARQUITETURA.md](ARQUITETURA.md): componentes, perfis, navegação e fluxo dos dados.
- [BANCO_E_SEGURANCA.md](BANCO_E_SEGURANCA.md): tabelas, funções, migrations, RLS e Storage.
- [FLUXOS_FUNCIONAIS.md](FLUXOS_FUNCIONAIS.md): login, cadastro, participação, aprovação, Hub e publicações.
- [OPERACAO.md](OPERACAO.md): ambiente, migrations, backups, testes e diagnóstico.
- [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md): preparação e implantação na VPS escolhida.
- [ESCALABILIDADE.md](ESCALABILIDADE.md): capacidade, filas, comunicação e critérios de evolução.
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
- financeiro persistido, protegido por RLS e exportado em CSV;
- sem fallback para seed ou `localStorage`.

## Decisão de infraestrutura

Os únicos fornecedores obrigatórios planejados são Hostinger e Supabase. Integrações adicionais somente serão adotadas quando forem indispensáveis, como a API oficial do WhatsApp. Recursos descritos como planejados, especialmente chat, worker e scheduler, ainda não devem ser tratados como implementados.
