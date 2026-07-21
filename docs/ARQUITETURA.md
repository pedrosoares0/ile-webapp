# Arquitetura

## Visão geral

```text
React + Vite + TypeScript
        |
        +-- Supabase Auth: sessão e credenciais
        +-- PostgreSQL: dados e regras transacionais
        +-- Row Level Security: autorização por perfil e terreiro
        +-- Supabase Storage: imagens de posts, stories e terreiros
```

O navegador usa somente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. A `DATABASE_URL` é usada exclusivamente por scripts locais de migration e backup.

## Estado global

- `AuthContext`: recupera a sessão, autentica por e-mail ou username e encerra a sessão.
- `AppDataContext`: carrega perfil, terreiro e conteúdo conforme a conta autenticada.
- `App.tsx`: decide entre login, Hub, Home e telas secundárias.

## Perfis

### `global_admin`

- visualiza e administra todos os terreiros;
- cria terreiros e contas administrativas;
- passa pelas mesmas policies e funções privilegiadas versionadas.

### `terreiro_admin`

- administra somente o `terreiro_id` de sua conta;
- gerencia membros, eventos, pontos, avisos, orações e solicitações;
- publica posts, stories e imagem do terreiro;
- não grava arquivos em pastas de outros terreiros.

### `terreiro_user` vinculado

- possui `terreiro_id`;
- acessa Home, agenda, pontos, avisos e seus pedidos;
- não executa operações administrativas.

### `terreiro_user` do Hub

- não possui `terreiro_id`;
- acessa o feed e perfis públicos;
- pode reagir, favoritar, salvar e enviar pedidos;
- pode solicitar participação por interesse ou código.

### Visitante

- não possui sessão;
- consulta somente terreiros, eventos, pontos, posts, stories e reações públicas;
- precisa entrar para interagir ou solicitar participação.

## Navegação

- conta sem terreiro abre o Hub;
- conta vinculada abre a Home do terreiro;
- o Hub possui botão de menu para navegação e logout;
- a navbar inferior não é exibida no Hub;
- administradores veem `Cadastros` no menu.

## Arquivos centrais

- `src/App.tsx`
- `src/context/AuthContext.tsx`
- `src/context/AppDataContext.tsx`
- `src/views/LoginView.tsx`
- `src/views/HubView.tsx`
- `src/views/CadastrosView.tsx`
- `src/lib/supabase.ts`
