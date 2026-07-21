![Capa do Projeto](/public/img/capa-readme1.png)

# Ilê - Gestão Inteligente para Comunidades de Umbanda

**Ilê** é uma plataforma "Mobile-First" desenvolvida para modernizar a gestão e a comunicação em terreiros de Umbanda e Candomblé. Unindo tradição e tecnologia, o projeto oferece acesso a informações essenciais da comunidade.

---

## 🚀 Atualizações Recentes do Projeto (Notas de Release para Rodrigo)

### 🎨 1. Sistema de Temas e Cores dos Orixás (100% Dinâmico)
- **Cores Representativas dos Orixás**:
  - **Vermelho** → Exu & Iansã (`#BF2429`)
  - **Azul** → Ogum & Iemanjá (`#1565C0`)
  - **Verde** → Oxóssi (`#1A7A4A`)
  - **Roxo** → Nanã (`#6B21A8`)
  - **Amarelo** → Oxum (`#EAB308` — Amarelo Solar)
  - **Rosa** → Erês & Ewá (`#BE185D`)
  - **Bege** → Oxalá (`#B5A490` — Bege Quente)
  - **Laranja** → Xangô (`#C2410C`)
- **Propagação Global**: Todo o sistema (Navbar, Mural, Divindades, Pontos, Oração, Eventos, Modais, Ícones e Botões) acompanha simultaneamente a cor selecionada pelo perfil do terreiro.
- **Upload de Logo/Perfil**: Campo real para upload da logo/foto do terreiro, exibida com destaque no card de boas-vindas e nos menus.

---

### 🔎 2. Reconhecimento Dinâmico de Terreiro no Login & "Lembrar Login"
- **Identificação ao Digitar**: Ao digitar o usuário, e-mail ou código do terreiro, o sistema busca no Supabase em tempo real e carrega:
  - Logo oficial do terreiro ao lado de *"Bem-Vindo"*.
  - Tema de cores e gradiente personalizado do cartão de login.
  - Texto dinâmico no botão (`ENTRAR NO [SIGLA DO TERREIRO]`).
- **Lembrar Meu Login**: Opção de salvar o login no dispositivo com preenchimento e pré-carregamento automático da identidade visual do terreiro ao abrir o aplicativo.

---

### 💰 3. Nova Aba de Controle Financeiro & Dashboard (Estética Bevel)
- **Dashboard & Indicadores**:
  - Medidor circular tracejado de meta mensal (**89% atingido**).
  - Cards numéricos limpos por origem de receita (*Mensalidades*, *Doações*, *Velas & Artigos*).
  - Toolbar rápida com legendas explicativas abaixo de cada ícone (`Lançar`, `Exportar`, `Pix`, `Cobrar`, `Extrato`).
- **Saldo Líquido em Caixa**:
  - Exibição de saldo acumulado com badge de status (`▲ Em Dia` ou `▼ Saldo Negativo`).
  - Barra visual comparativa entre Entradas (+R$) e Saídas (-R$).
- **Situação dos Filhos (Adimplência & Inadimplência)**:
  - Balanço dos filhos em dia (22) vs em atraso (3) com valor pendente total.
  - Botão direto para **Cobrar via WhatsApp** com mensagem pré-formatada.
- **Cobrança Automática & Chave Pix**:
  - Toggle de automação mensal (dia 05), disparo em lote e botão de copiar Chave Pix CNPJ em 1 clique.
- **Relatórios Mensais**: Balanço por período e exportação simulada em PDF/Excel.

---

### 📱 4. Menu Lateral (Burger Menu) Refatorado
- **Navegação Simplificada**: Links organizados em ordem lógica (`Home`, `Perfil`, `Cadastros`, `Financeiro`, `Divindades`, `Eventos`, `Pontos`, `Oração`, `Mural`, `Sair`).
- **Header Limpo**: Avatar ampliado (80x80px) sem cards poluídos, com sigla em destaque e nome completo como subtítulo.

---

### 🏛️ 5. Praticidade no Cadastro de Terreiro (Cidade e UF)
- **Autocompletar de Cidades**: Busca rápida conforme digitação (ex: ao digitar *"sal"*, sugere *"Salvador"*).
- **ComboBox de UF**: Seleção rápida do Estado.
- **Prevenção de Zoom Indesejado**: Ajuste de meta viewport para experiência fluida em navegadores móbiles.

---

## 🎯 A Solução do Sistema

O **Ilê** centraliza e organiza a rotina da comunidade:
- **Calendário de Atividades**: Visualização de giras, festas e obrigações.
- **Biblioteca de Pontos**: Acervo digital de pontos cantados com busca rápida.
- **Mural Virtual**: Avisos em tempo real e comunicados da casa.
- **Controle Financeiro**: Gestão de mensalidades, doações e cobranças automáticas via WhatsApp.
- **Personalização de Terreiro**: Identidade visual própria para cada terreiro cadastrado.

---

## 🛠️ Stacks Utilizadas

- **React 18 + Vite**: Frontend moderno e ultra-rápido.
- **TypeScript**: Tipagem estática rigorosa (0 erros de compilação).
- **Tailwind CSS**: Design system utilitário e responsivo.
- **Framer Motion**: Micro-animações e transições fluidas.
- **Supabase**: Backend serverless (Auth, RPCs, Storage e Database).

---

*Desenvolvido com foco em resolver dores reais de comunidades, unindo fé, cultura e engenharia de software.*
