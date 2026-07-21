# Plano de produção do Ilê

## Concluído em 21/07/2026

- backup completo antes da primeira alteração;
- conexão PostgreSQL validada;
- migrations versionadas, transacionais e com checksum;
- scripts destrutivos e fallback de seed/localStorage removidos;
- RLS e policies por perfil/terreiro;
- cadastro público sem confiar em role enviada pelo navegador;
- criação administrativa de credenciais reais no Supabase Auth;
- quatro contas demo reais e testadas;
- CRUD real das funcionalidades existentes;
- feed, stories, reações, favoritos e posts salvos persistidos;
- modo visitante consumindo dados públicos reais;
- menu e logout do usuário do Hub;
- solicitação de participação por interesse;
- solicitação por código com aprovação obrigatória;
- aprovação/recusa administrativa sem duplicar conta;
- buckets `posts`, `stories` e `terreiros` protegidos por policies;
- upload direto pela interface com limite de 5 MB;
- publicação de post/story e atualização da imagem do terreiro;
- testes descartáveis dos fluxos e limpeza posterior;
- build de produção validado.

## Estado atual

As operações principais usam Supabase real. Não existem arrays mockados para feed/stories nem fallback para dados locais. Posts e stories novos armazenam a imagem no Storage e a URL no PostgreSQL.

O post e story iniciais migrados continuam apontando para imagens externas. Eles devem ser importados para os buckets para eliminar essa última dependência de mídia externa.

## Próximas prioridades

### Conta e comunicação

- configurar SMTP;
- ativar confirmação de e-mail com fluxo compatível;
- recuperar e alterar senha;
- permitir exclusão/exportação da conta;
- atualizar automaticamente o contexto do usuário quando uma solicitação for aprovada.

### Conteúdo

- importar as duas imagens externas iniciais para Storage;
- permitir editar e excluir posts/stories pela interface;
- permitir banner separado do logo;
- adicionar moderação e denúncia;
- substituir imagens decorativas externas dos cards por dados do terreiro;
- implementar mapa real com latitude/longitude.

### Produto

- definir e implementar financeiro;
- definir consultas, ajuda e ajustes;
- notificações para novas solicitações e aprovações;
- cancelamento de solicitação pelo usuário.

### Qualidade e operação

- configurar ESLint;
- adicionar testes automatizados e CI;
- separar desenvolvimento, homologação e produção;
- logs, alertas e backups recorrentes;
- otimizar bundle com carregamento por rota;
- gerar tipos TypeScript pelo Supabase;
- revisar LGPD, termos e privacidade;
- resolver manualmente três vínculos históricos órfãos;
- remover/proteger credenciais demo antes da abertura pública.

## Critério para produção pública

Não considerar o sistema pronto para abertura pública enquanto SMTP/recuperação de senha, testes de RLS automatizados, backup recorrente, separação de ambientes e requisitos de LGPD não estiverem concluídos.
