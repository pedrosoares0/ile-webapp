# Design System: Ilê WebApp

Este documento define os princípios visuais, tokens e diretrizes de design do aplicativo **Ilê**. Ele funciona como a **fonte única de verdade** para desenvolvedores e assistentes de IA (como Claude Code e Antigravity) para garantir consistência visual em futuras manutenções e novas telas.

---

## 1. Atmosfera e Filosofia Visual
A interface do **Ilê** funde a sofisticação editorial do design impresso (estética de baralho de tarô e cartas colecionáveis) com a modernidade e limpeza dos layouts **Bento Grid** (estilo Apple/Airbnb) e movimentos fluidos baseados em física de mola (iOS).
*   **Densidade:** Equilibrada (`Density 5`) — focado na leitura imersiva e visualização limpa de imagens.
*   **Variância de Layout:** Asimétrica e Orgânica (`Variance 7`) — cartas dispostas em grids de duas colunas, espaçamentos curados e elementos descentralizados no detalhe.
*   **Intensidade de Movimento:** Fluida e Dinâmica (`Motion 8`) — uso de partículas ativas, efeitos de luz Aurora e gestos de arrasto para alternância de conteúdo.

---

## 2. Paleta de Cores e Hierarquia
A paleta é baseada em tons neutros quentes e orgânicos (creme e argila) combinados com o **Azul Sagrado** como destaque administrativo/funcional e cores dinâmicas adaptativas para cada divindade.

### Neutros e Estruturais
*   **Creme de Fundo (Canvas)**: `#F4E8D9` (88% do degradê vertical) — superfície macia e acolhedora.
*   **Argila de Rodapé**: `#DBC6AB` (12% do degradê vertical) — cor que fecha a base do aplicativo e absorve imperfeições de scroll.
*   **Marfim de Cartas (Cards)**: `#FEF9ED` — superfície interna das cartas e caixas detalhadas.
*   **Grafite Primário (Ink)**: `#414141` — textos principais, títulos e botões de controle de alta legibilidade.
*   **Azul Sagrado (Accent)**: `#1565c0` — destaque para botões, inputs, foco do calendário e ações de formulário em substituição ao antigo tom vinho.

### Paletas Dinâmicas por Divindade (Orixás)
Cada detalhe de divindade adapta-se dinamicamente ao seu axé através de duas cores: a **Cor de Fundo (Suave)** para preenchimentos e a **Cor de Destaque (Forte)** para texto, bordas e ícones (garantindo acessibilidade):

| Orixá | Cor Suave (Fundo) | Cor Destaque (Texto/Ícone) | Significado Visual |
| :--- | :--- | :--- | :--- |
| **Oxalá** | `#e0d8c3` | `#7c6a46` | Paz primordial e pureza |
| **Ogum** | `#3182CE` | `#1a5276` | Força dos caminhos e ferro |
| **Oxóssi** | `#319795` | `#1a5f5d` | Fartura das matas e caça |
| **Xangô** | `#E53E3E` | `#9b1c1c` | Fogo e justiça real |
| **Iemanjá** | `#BEE3F8` | `#2b6cb0` | Equilíbrio e águas salgadas |
| **Oxum** | `#D69E2E` | `#976a10` | Doçura do ouro e rios |
| **Iansã** | `#DD6B20` | `#9c420e` | Ventos de transformação |
| **Nanã Buruquê** | `#805AD5` | `#553c9a` | Ancestralidade da lama primordial |
| **Obaluaê** | `#4A5568` | `#2d3748` | Mistério da cura e da terra |
| **Exu** | `#1a1a1a` | `#c53030` | Movimento, vermelho e preto |
| **Oxumarê** | `#D53F8C` | `#97266d` | Renovação do arco-íris |
| **Ibeji** | `#4FD1C5` | `#234e52` | Alegria pura das crianças |

---

## 3. Tipografia
A tipografia estabelece personalidade editorial ao aplicativo:
*   **Títulos e Headlines (Display)**: `Behind The Nineties` (serifa cursiva com peso itálico característico) — usado para nomes de Orixás, títulos de abas e seções artísticas.
*   **Textos e Controles (Sans)**: Sans-serif moderna e geométrica do sistema (inter, system-ui) com espaçamento de letras ajustado (`tracking-wide` ou `tracking-tight` de acordo com a escala).
*   **Banned**: Fontes serifadas genéricas (`Times New Roman`, `Georgia`) são proibidas.

---

## 4. Componentes e Estilos Padrão

### Cartas de Divindades (Tarot Cards)
*   **Estrutura**: Cantos externos de `22px` (`rounded-[22px]`), borda branca fina de `1px` contrastando com o fundo, preenchimento interno reduzido de `p-1.5`.
*   **Moldura da Foto**: Borda interna de `15px` (`rounded-[15px]`) com transição suave `overflow-hidden` e leve gradiente sutil na base.

### Cards Bento (Detalhes)
*   **Preenchimento**: Fundo translúcido dinâmico a `12%` (`opacity`) com base na cor suave da divindade.
*   **Bordas**: Linhas estruturais dinâmicas com base na `corDestaque` com opacidade de `28%`.
*   **Ícones**: Moldura quadrada pequena com cantos arredondados, fundo translúcido na `corDestaque` a `18%` de opacidade e ícones Lucide centralizados.

### Elementos de Mídia e Efeitos Especiais
*   **Sparks Particle Effect**: Animação de faíscas dinâmicas (`SparksEffect`) na base da imagem de capa do Orixá no modal de detalhes. Roda 14 partículas animadas que sobem verticalmente por 110px e desaparecem suavemente. As partículas herdam a `corDestaque` da divindade ativa.
*   **Player de Vídeo (YouTube)**: Caixa de proporção cinematográfica (`aspect-video`), cantos arredondados de `18px` (`rounded-[18px]`) e sombra sutil, carregando o documentário exclusivo de cada divindade.

---

## 5. Princípios de Layout e Telas

### Cabeçalhos Centrados
*   Os cabeçalhos de visualização (ex: Divindades) são empilhados no centro: Título com `text-4xl font-bold tracking-wide` e Subtítulo explicativo com `text-xs font-semibold text-[#414141]/55 leading-relaxed max-w-[290px] mx-auto mt-3.5`.
*   Botões de navegação lateral (ex: Voltar e Menu) são posicionados de forma absoluta (`absolute left-6` / `absolute right-6`) para não empurrarem ou desalinharem o título centralizado.

### Efeito Aurora
*   O topo de páginas especiais possui um efeito de iluminação "Aurora" dinâmico com dois círculos desfocados em azul marinho (`#0d47a1`) e azul celeste (`#00b0ff`) que pulsam suavemente por trás do conteúdo.

---

## 6. Animações e Movimento (Framer Motion)
*   **Física de Mola (Spring)**: Padrão para interações de cards e botões: `transition={{ type: "spring", stiffness: 220, damping: 25 }}`.
*   **Slide Vertical do Modal (BottomSheet)**: Para evitar o bug do contêiner de projeção do Framer Motion (`layoutId` contendo transições transformadas que estragam posicionamento `fixed` e deslocam o scroll), o fundo do modal de detalhamento deve sempre abrir via slide vertical puro (`initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}`). A transição da foto interna continua livre para usar `layoutId` para o efeito de zoom.
*   **Trava de Rolagem Traseira**: Sempre que um modal detalhado estiver aberto, a tela de fundo deve receber a classe `h-[100dvh] overflow-hidden` dinamicamente para isolar o scroll do modal e impedir que o usuário role a lista traseira acidentalmente.

---

## 7. Anti-Patterns (Banned)
*   **Sem Emojis**: Emojis em títulos, botões ou descrições são proibidos para manter o tom sério e premium da plataforma.
*   **Sem Tons Neon Artificiais**: Proibidos gradientes neon violeta/magenta ou botões brilhantes artificiais.
*   **Sem Navbar Inferior**: O aplicativo é focado na navegação limpa por botões dinâmicos e menu lateral. A navbar inferior foi descontinuada.
*   **Sem Scroll do Plano de Fundo**: Rolagem do feed de Orixás enquanto o detalhe está aberto é estritamente proibida.
