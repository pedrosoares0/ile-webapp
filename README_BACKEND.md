# Guia do Desenvolvedor Backend - App Ilê

Bem-vindo! Este documento foi preparado para explicar de forma simples e direta o funcionamento da arquitetura de banco de dados, regras de negócio, níveis de acesso e fluxos de autenticação do aplicativo **Ilê**. 

---

## 1. Visão Geral do Sistema
O **Ilê** funciona como um Hub de Terreiros (Umbada/Candomblé). O aplicativo opera no modelo multitenancy (múltiplas organizações):
* Cada terreiro (ex: **T7CA - Terreiro de Umbanda 7 Caminhos de Aruanda**) tem seus próprios membros, eventos, financeiro e pontos de cantiga.
* Existem contas administrativas para os terreiros e uma conta administrativa geral (Hub) que visualiza a união das informações de todos os terreiros.

---

## 2. Níveis de Acesso e Permissões (Roles)

O controle de acessos do sistema é baseado em três perfis principais na tabela `accounts`:

1. **Administrador Geral (Hub/Global Admin)** (`global_admin`):
   * E-mail padrão: `admin@ile.app`
   * Visualiza todos os terreiros cadastrados, servindo como um hub de monitoramento geral. Não está vinculado a nenhum terreiro específico (`terreiro_id` é nulo).
2. **Administrador de Terreiro (Terreiro Admin)** (`terreiro_admin`):
   * Exemplo: Conta do **Erick** no terreiro **T7CA**.
   * Tem permissão total sobre o seu terreiro específico: pode criar, editar e excluir membros, eventos e pontos de cantiga.
3. **Membro do Terreiro (Terreiro User)** (`terreiro_user`):
   * Usuário comum vinculado ao seu terreiro.
   * Acesso apenas de leitura: visualiza o calendário de eventos, pontos de cantiga e dados informativos (divindades), sem poder alterar nada.

---

## 3. Fluxo de Autenticação Híbrida (E-mail ou Username)

Para melhorar a experiência do usuário, o login pode ser feito digitando o **e-mail** OU o **username** (nome de usuário único).

### Como o fluxo funciona no Frontend:
1. O usuário digita as credenciais (e-mail ou username) e a senha.
2. O sistema faz uma consulta rápida na tabela pública `public.accounts` para verificar se o texto inserido corresponde a um `username`.
3. Se encontrar, o sistema substitui o username pelo e-mail real associado a essa conta.
4. Em seguida, realiza a autenticação padrão do Supabase Auth:
   ```javascript
   supabase.auth.signInWithPassword({ email: emailEncontrado, password: senha })
   ```
5. Isso evita a necessidade de decorar e-mails fictícios ou longos no celular.

---

## 4. Vinculação por Código de Convite (Cadastro de Membros)

A lógica de entrada de novos membros no terreiro correto baseia-se em um **Código de Convite**:
* Cada terreiro possui um ID único (ex: `terreiro_t7ca` ou um UUID gerado pelo banco).
* O Administrador do terreiro visualiza seu próprio código de convite diretamente no topo da sua página inicial (Home) e pode compartilhá-lo com seus filhos de santo.
* No formulário de cadastro, o novo membro insere seus dados (nome, e-mail, username, senha) e o **Código Convite** do terreiro.
* O sistema valida o código: se o terreiro existir, a nova conta é criada e vinculada diretamente a esse `terreiro_id`. O novo membro entra automaticamente como `terreiro_user`.

---

## 5. Estrutura do Banco de Dados (Supabase / Postgres)

Abaixo está o modelo atual das tabelas públicas utilizadas pela aplicação:

### A. Tabela: `terreiros`
Representa cada terreiro registrado no ecossistema.
* `id` (text, Primary Key): ID amigável ou UUID (ex: `terreiro_t7ca`).
* `nome` (text): Nome do terreiro (ex: *"T7CA - Terreiro de Umbanda 7 Caminhos de Aruanda"*).
* `dirigente` (text): Nome do sacerdote responsável.
* `cidade` / `estado` (text): Localização do terreiro.
* `contato` (text): Telefone ou e-mail de contato.
* `ativo` (boolean): Define se o terreiro está habilitado no sistema.

### B. Tabela: `accounts`
Armazena as informações complementares das contas do Supabase Auth.
* `id` (uuid, Primary Key): ID da conta (deve ser idêntico ao `id` gerado em `auth.users`).
* `nome` (text): Nome completo do usuário.
* `email` (text, único): E-mail de cadastro.
* `username` (text, único): Nome de usuário único para login rápido.
* `role` (text): Nível de acesso (`global_admin`, `terreiro_admin`, `terreiro_user`).
* `terreiro_id` (text, Foreign Key): Referencia `terreiros.id`. Indica a qual terreiro a conta pertence. É nulo para o administrador geral.

### C. Tabela: `events`
Guarda a programação e os rituais agendados pelos administradores.
* `id` (text, Primary Key): ID único do evento.
* `title` (text): Título do evento (ex: *"Preto Velho"*, *"Gira de Caboclo"*, ou título personalizado).
* `description` (text): Descrição resumida da gira/estudo.
* `date` (date): Data do evento (formato `YYYY-MM-DD`).
* `time` (text): Horário de início do evento (ex: *"16:00"*).
* `location` (text): Onde ocorrerá (ex: *"Terreiro T7CA"*).
* `category` (text): Categoria exibida no card (`Gira de Atendimento`, `Gira Festiva`, `Estudo`, `Manutenção do Terreiro`).
* `type` (text): **Coluna Chave de Estilização**. Armazena o ID do preset visual para que o frontend carregue as cores, temas (claro/escuro) e ilustrações correspondentes. Exemplos salvos:
  * `preto_velho_claro` / `preto_velho_escuro`
  * `exu_pomba_gira_claro` / `exu_pomba_gira_escuro`
  * `orixas_claro` / `orixas_escuro`
  * `caboclos_claro` / `caboclos_escuro`
  * `personalizado_claro` / `personalizado_escuro`
* `terreiro_id` (text, Foreign Key): Referencia `terreiros.id`. Vincula o evento ao calendário de um terreiro específico.

### D. Tabela: `pontos`
Tabela de cantigas e orações do terreiro.
* `id` (text, Primary Key): ID único do ponto.
* `titulo` (text): Nome da cantiga.
* `categoria` (text): Orixá ou linha de trabalho (`ORIXÁS`, `CABOCLOS`, `EXUS`, `PRETOS VELHOS`, etc.).
* `letra` (text): Letra completa da cantiga.
* `youtube_url` (text): Link de áudio/vídeo.
* `terreiro_id` (text, Foreign Key): Referencia `terreiros.id`.

---

## 6. Semente de Desenvolvimento (Seeding)
Para facilitar testes locais, o projeto conta com um script de setup em `scripts/setup_db.cjs`. Esse script faz inserções diretas no banco de dados utilizando a biblioteca `pg` do Node (acessando a conexão direta Postgres) para criar contas mockadas de teste sem esbarrar no validador de e-mails ou limites de requisições de autenticação do Supabase. 

As seguintes credenciais de teste já estão disponíveis após o seed:
* **Admin Ilê (Hub)**:
  * Username: `admin` | Senha: `123` (E-mail real: `admin@ile.app`)
* **Admin Terreiro T7CA (Erick)**:
  * Username: `erick` | Senha: `123` (E-mail real: `erick@t7ca.org`)
* **Membro Terreiro T7CA (Visitante/Membro)**:
  * Username: `membro` | Senha: `123` (E-mail real: `membro@t7ca.org`)
* **Admin Geral Pedro**:
  * Username: `pedro` | Senha: `12345` (E-mail real: `pedro@ile.app`)
