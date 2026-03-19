export const USER_ROLES = ['administrador', 'dirigente', 'membro', 'visitante'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['ativo', 'inativo'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const AUTH_SCOPES = ['global', 'terreiro'] as const;
export type AuthScope = (typeof AUTH_SCOPES)[number];

export const ACCESS_ROLES = ['global_admin', 'terreiro_admin', 'terreiro_user'] as const;
export type AccessRole = (typeof ACCESS_ROLES)[number];

export const TERREIRO_ACCESS_ROLES = ['terreiro_admin', 'terreiro_user'] as const;
export type TerreiroAccessRole = (typeof TERREIRO_ACCESS_ROLES)[number];

export const EVENT_TYPES = ['normal', 'importante'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_CATEGORIES = [
  'Religioso',
  'Festa',
  'Manutenção',
  'Fundamento',
  'Estudo',
  'Administrativo',
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const PONTO_CATEGORIES = [
  'ORIXÁS',
  'CABOCLOS',
  'PRETOS VELHOS',
  'EXUS',
  'ERÊS',
  'BOIADEIROS',
  'OUTROS',
] as const;
export type PontoCategory = (typeof PONTO_CATEGORIES)[number];

export type AppView = 'home' | 'pontos' | 'eventos' | 'cadastros';

export interface Terreiro {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  dirigente: string;
  contato: string;
  observacoes: string;
  ativo: boolean;
  accessAccountId: string;
  createdAt: string;
}

export interface AccessAccount {
  id: string;
  nome: string;
  email: string;
  password: string;
  scope: AuthScope;
  role: AccessRole;
  terreiroId: string;
  userId: string | null;
  createdAt: string;
}

export interface AppUser {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  role: UserRole;
  status: UserStatus;
  terreiroId: string;
  accessAccountId: string | null;
  createdAt: string;
}

export interface TerreiroEvent {
  id: string;
  date: Date;
  title: string;
  time: string;
  location: string;
  type: EventType;
  category: EventCategory;
  terreiroId: string;
  description: string;
  createdAt: string;
}

export interface Ponto {
  id: string;
  titulo: string;
  categoria: PontoCategory;
  youtubeUrl: string;
  descricao: string;
  thumbnail: string;
  terreiroId: string;
  letra: string;
  createdAt: string;
}

export interface AppData {
  terreiros: Terreiro[];
  accounts: AccessAccount[];
  users: AppUser[];
  events: TerreiroEvent[];
  pontos: Ponto[];
}

export interface StoredAppData {
  version: 2;
  data: {
    terreiros: Terreiro[];
    accounts: AccessAccount[];
    users: AppUser[];
    events: Array<Omit<TerreiroEvent, 'date'> & { date: string }>;
    pontos: Ponto[];
  };
}

export interface AuthSession {
  accountId: string;
}
