export interface Ponto {
  id: string;
  titulo: string;
  categoria: string;
  youtubeUrl: string;
  descricao: string;
  thumbnail: string;
}

export interface Event {
  id: string;
  date: Date;
  title: string;
  time: string;
  location: string;
  type: 'importante' | 'normal';
  category: string;
}

export type ViewType = 'home' | 'pontos' | 'eventos' | 'divindades' | 'financeiro' | 'avisos' | 'consultas' | 'oracao' | 'ajuda' | 'ajustes' | 'sair';
