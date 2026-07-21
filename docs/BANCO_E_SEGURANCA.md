# Banco, migrations e segurança

## Tabelas de identidade e operação

- `auth.users`: credencial mantida pelo Supabase Auth.
- `public.accounts`: perfil de acesso, role, scope e terreiro.
- `public.users`: cadastro do membro dentro de um terreiro.
- `public.terreiros`: casa, identidade visual, contato e publicação.
- `public.events`: agenda.
- `public.pontos`: pontos cantados e vídeo.
- `public.notices`: comunicados.
- `public.prayer_requests`: pedidos de oração.

## Hub

- `posts`: publicações e URL da imagem.
- `stories`: stories, URL da mídia e expiração.
- `post_reactions`: uma reação por conta e post.
- `favorite_terreiros`: terreiros favoritos por conta.
- `saved_posts`: posts salvos por conta.
- `membership_requests`: solicitações de participação e revisão administrativa.

## Status de participação

- `pending`: aguardando aprovação;
- `approved`: aprovado e vinculado;
- `rejected`: recusado;
- `cancelled`: reservado para cancelamento pelo usuário.

Existe no máximo uma solicitação pendente por conta. A aprovação atualiza `accounts`, cria ou atualiza `users` e finaliza a solicitação na mesma transação.

## Funções principais

- `resolve_login_email`: resolve username sem expor `accounts` anonimamente.
- `resolve_login_context`: contexto visual seguro do login.
- `account_identifier_available`: verifica disponibilidade de username/e-mail.
- `handle_new_user`: cria perfil básico sem confiar em role enviada pelo navegador.
- `complete_member_registration`: conclui perfil de membro/Hub.
- `create_my_terreiro`: cria terreiro e eleva apenas o criador daquela nova casa.
- `admin_save_member`: cria/edita membro com credencial real no Auth.
- `admin_delete_member`: remove membro e acesso com autorização.
- `global_save_terreiro`: cria/edita terreiro pelo admin global.
- `create_membership_request`: cria solicitação por interesse ou código.
- `review_membership_request`: aprova ou recusa de forma transacional.

Funções privilegiadas usam `SECURITY DEFINER`, `search_path` restrito e permissão de execução explícita.

## RLS

RLS está habilitado nas tabelas operacionais e do Hub. Regras essenciais:

- anônimo recebe somente conteúdo público;
- conta comum consulta o próprio perfil;
- administrador de terreiro opera apenas seu `terreiro_id`;
- admin global possui escopo global;
- reações, favoritos e salvos pertencem a `auth.uid()`;
- solicitações são vistas pelo solicitante ou administrador de destino;
- aprovação não pode ser feita por update direto do navegador.

## Storage

Buckets:

- `posts`
- `stories`
- `terreiros`

Configuração:

- leitura pública;
- limite de 5 MB;
- MIME types: JPEG, PNG, WebP e GIF;
- caminho obrigatório: `<terreiro_id>/<uuid>.<extensao>`;
- insert, update e delete somente quando o usuário administra o primeiro segmento do caminho.

As imagens novas são enviadas pela interface. O post e story iniciais migrados ainda usam URLs externas; podem ser importados para Storage posteriormente.

## Migrations

1. `202607210001_foundation.sql`: campos, índices, FKs, cadastro seguro e RLS inicial.
2. `202607210002_hub.sql`: tabelas e policies do Hub.
3. `202607210003_demo_hub_account.sql`: conta real `membro.hub`.
4. `202607210004_frontend_rpcs.sql`: RPC de contexto e ajuste de oração.
5. `202607210005_admin_users.sql`: operações administrativas reais no Auth.
6. `202607210006_crypto_path.sql`: acesso controlado a `pgcrypto` no schema `extensions`.
7. `202607210007_membership_and_storage.sql`: participação, aprovação e Storage.

As migrations são imutáveis após aplicadas; o runner recusa checksum divergente.

## Débito de dados conhecido

Existem três contas históricas apontando para IDs de terreiros sem registro correspondente. As FKs foram adicionadas como `NOT VALID` para preservar esses dados e impedir novos vínculos inválidos. A correção exige decisão manual: reconstruir os terreiros ou desvincular as contas.
