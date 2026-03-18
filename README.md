# Terreiro T7CA - App Mobile (Frontend)

Este é o repositório do frontend do aplicativo para o Terreiro de Umbanda T7CA. O projeto foi desenvolvido com foco em uma experiência de usuário "Premium/Apple", utilizando React, Tailwind CSS e Framer Motion.

## 🚀 Tecnologias Utilizadas

- **React** (Vite)
- **TypeScript**
- **Tailwind CSS** (Estilização)
- **Framer Motion** (Animações e Transições)
- **Lucide React** (Ícones)
- **React Calendar** (Componente de Calendário)

## 📁 Estrutura do Projeto

O projeto está organizado da seguinte forma:

- `src/views/`: Contém as telas principais do aplicativo.
  - `HomeView.tsx`: Tela inicial com hero carousel e acesso rápido.
  - `EventsView.tsx`: Módulo de eventos com calendário e destaques.
  - `PontosView.tsx`: Biblioteca de pontos cantados.
- `src/styles/`: Arquivos CSS globais e customizações de componentes (ex: `Calendar.css`).
- `src/types/`: Definições de interfaces TypeScript para o backend.
- `public/img/`: Assets de imagem utilizados no projeto.

## 🛠️ Como Executar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 📝 Notas para o Backend

- **Modelos de Dados**: As interfaces de dados estão definidas em `src/types/index.ts`.
- **Eventos**: O componente `EventsView` utiliza um `mockEvents` que deve ser substituído pela chamada à API.
- **Pontos**: O componente `PontosView` utiliza um `MOCK_PONTOS` que deve ser integrado ao banco de dados.
- **Upload de Imagens**: O sistema atualmente usa caminhos estáticos em `/public/img/`. No backend, considere uma solução para armazenamento e entrega dessas imagens.

## ✨ Funcionalidades Implementadas

- [x] Navegação entre Home, Eventos e Pontos.
- [x] Calendário interativo com marcação de datas importantes.
- [x] Scroll horizontal funcional nos destaques do mês.
- [x] Modal de visualização e adição de pontos.
- [x] Design responsivo (Mobile-first, focado em 430px de largura).
