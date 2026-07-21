# Fluxos funcionais

## Login

1. Usuário informa e-mail ou username.
2. Username é resolvido pela RPC `resolve_login_email`.
3. Supabase Auth valida a senha.
4. `AppDataContext` carrega `accounts` e o escopo.
5. Sem `terreiro_id`: Hub. Com `terreiro_id`: Home do terreiro.

## Cadastro de membro

O Auth sempre cria inicialmente `terreiro_user`, sem aceitar role privilegiada do cliente. O perfil é concluído por `complete_member_registration`.

- sem código: permanece no Hub;
- com código durante o cadastro legado: pode ser vinculado no fluxo de registro atual;
- depois do cadastro: deve usar solicitação com aprovação.

## Participação por interesse

1. Usuário do Hub abre o terreiro.
2. Clica em `Quero fazer parte`.
3. `create_membership_request` cria status `pending`.
4. Interface mostra `Aguardando aprovação`.
5. Admin abre `Cadastros > Solicitações`.
6. Aprova ou recusa.
7. Na aprovação, a conta existente é vinculada; não é criada uma conta duplicada.

## Participação por código

1. Usuário escolhe `Usar código` no Hub.
2. Informa o ID/código recebido do administrador.
3. O banco resolve o terreiro e cria uma solicitação `pending` com tipo `invite_code`.
4. O administrador ainda precisa aprovar.

O código não é exibido no perfil público do terreiro.

## Revisão administrativa

Em `Cadastros > Solicitações`, o administrador visualiza nome, e-mail, origem, mensagem, terreiro e status.

- Aprovar: vincula `accounts.terreiro_id`, garante `role=terreiro_user`, cria/atualiza `users` e marca `approved`.
- Recusar: preserva a conta no Hub e marca `rejected`.

Se o usuário estiver com o Hub aberto durante a aprovação, deve atualizar a página ou entrar novamente para o contexto recarregar o novo terreiro.

## Feed e stories

O Hub consulta dados de `posts` e `stories`; não existem arrays mockados. Reações, favoritos e salvos também são persistidos.

## Publicação com upload

Em `Cadastros > Publicações`:

### Post

1. Admin preenche legenda e localização.
2. Seleciona uma imagem.
3. Arquivo é validado no cliente e Storage.
4. Upload vai para `posts/<terreiro_id>/...` na organização lógica do bucket, efetivamente `<terreiro_id>/<uuid>.<ext>` dentro do bucket `posts`.
5. URL pública é gravada em `posts.image_url`.

### Story

1. Admin preenche título e descrição.
2. Seleciona uma imagem.
3. URL é gravada em `stories.media_url`.
4. `expires_at` recebe 24 horas após a publicação.

### Imagem do terreiro

1. Admin seleciona a imagem.
2. Upload vai para o bucket `terreiros`.
3. URL é gravada em `terreiros.logo_url`.
4. Feed e stories passam a usar a imagem.

## Credenciais de desenvolvimento

Os botões exibidos no login correspondem a contas reais:

- `admin / 123456`
- `erick / 123456`
- `membro / 123456`
- `membro.hub / 123456`

Devem ser removidos ou protegidos antes da abertura pública.
