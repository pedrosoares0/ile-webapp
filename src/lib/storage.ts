import { seedAppData } from '../data/seed';
import { AccessAccount, AppData, AppUser, StoredAppData, Terreiro, TerreiroEvent } from '../types';
import { sortEvents } from './date';

const STORAGE_KEY = 'ile.app-data.v2';

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toEventDate(event: StoredAppData['data']['events'][number]): TerreiroEvent {
  return {
    ...event,
    date: new Date(event.date),
  };
}

function buildFallbackAccount(terreiro: Terreiro, users: AppData['users']): AccessAccount {
  const linkedUser =
    users.find((user) => user.terreiroId === terreiro.id && user.role === 'administrador') ??
    users.find((user) => user.terreiroId === terreiro.id && user.role === 'dirigente') ??
    null;

  return {
    id: `account_${terreiro.id}`,
    nome: linkedUser?.nome ?? terreiro.dirigente,
    email: linkedUser?.email ?? `${slugify(terreiro.nome)}@ile.app`,
    password: '123456',
    scope: 'terreiro',
    role: 'terreiro_admin',
    terreiroId: terreiro.id,
    userId: null,
    createdAt: terreiro.createdAt,
  };
}

function getDefaultAccountForTerreiro(terreiro: Terreiro, users: AppData['users']): AccessAccount {
  const seededAccount = seedAppData.accounts.find(
    (account) => account.scope === 'terreiro' && account.terreiroId === terreiro.id,
  );

  if (seededAccount) {
    return {
      ...seededAccount,
      nome: terreiro.dirigente || seededAccount.nome,
      createdAt: terreiro.createdAt,
    };
  }

  return buildFallbackAccount(terreiro, users);
}

function hydrateUser(candidate: AppUser): AppUser {
  return {
    ...candidate,
    accessAccountId: typeof candidate.accessAccountId === 'string' ? candidate.accessAccountId : null,
  };
}

function hydrateAccount(candidate: AccessAccount, fallback: AccessAccount): AccessAccount {
  return {
    ...fallback,
    ...candidate,
    role:
      candidate.role === 'global_admin' || candidate.role === 'terreiro_user'
        ? candidate.role
        : candidate.scope === 'global'
          ? 'global_admin'
          : 'terreiro_admin',
    userId: typeof candidate.userId === 'string' ? candidate.userId : null,
  };
}

function upsertById<T extends { id: string }>(items: T[], nextItem: T) {
  const itemExists = items.some((item) => item.id === nextItem.id);

  if (itemExists) {
    return items.map((item) => (item.id === nextItem.id ? nextItem : item));
  }

  return [...items, nextItem];
}

function normalizeVersionOne(candidate: {
  data?: {
    terreiros?: Terreiro[];
    users?: AppData['users'];
    events?: Array<Omit<TerreiroEvent, 'date'> & { date: string }>;
    pontos?: AppData['pontos'];
  };
}) {
  const users = Array.isArray(candidate.data?.users) ? candidate.data.users.map(hydrateUser) : seedAppData.users;
  const baseTerreiros = Array.isArray(candidate.data?.terreiros) ? candidate.data.terreiros : seedAppData.terreiros;
  const accounts = baseTerreiros.map((terreiro) => getDefaultAccountForTerreiro(terreiro, users));

  return {
    terreiros: baseTerreiros.map((terreiro) => ({
      ...terreiro,
      accessAccountId: accounts.find((account) => account.terreiroId === terreiro.id)?.id ?? '',
    })),
    accounts: [seedAppData.accounts[0], ...accounts],
    users,
    events: Array.isArray(candidate.data?.events)
      ? sortEvents(candidate.data.events.map(toEventDate))
      : seedAppData.events,
    pontos: Array.isArray(candidate.data?.pontos) ? candidate.data.pontos : seedAppData.pontos,
  };
}

function normalizeVersionTwo(candidate: StoredAppData): AppData {
  const users = Array.isArray(candidate.data.users) ? candidate.data.users.map(hydrateUser) : seedAppData.users;
  const scopedAccounts = Array.isArray(candidate.data.accounts) ? candidate.data.accounts : [];
  const normalizedAccounts = scopedAccounts.map((account) => {
    const fallback =
      account.scope === 'global'
        ? seedAppData.accounts[0]
        : getDefaultAccountForTerreiro(
            seedAppData.terreiros.find((terreiro) => terreiro.id === account.terreiroId) ??
              candidate.data.terreiros.find((terreiro) => terreiro.id === account.terreiroId) ??
              seedAppData.terreiros[0],
            users,
          );

    return hydrateAccount(account, fallback);
  });
  const globalAccount =
    normalizedAccounts.find((account) => account.role === 'global_admin') ?? seedAppData.accounts[0];
  const userAccounts = normalizedAccounts.filter((account) => account.userId);
  const terreiros = (Array.isArray(candidate.data.terreiros) ? candidate.data.terreiros : seedAppData.terreiros).map(
    (terreiro) => {
      const linkedAccount =
        normalizedAccounts.find((account) => account.id === terreiro.accessAccountId && !account.userId) ??
        normalizedAccounts.find((account) => account.terreiroId === terreiro.id && !account.userId);

      return {
        ...terreiro,
        accessAccountId: linkedAccount?.id ?? getDefaultAccountForTerreiro(terreiro, users).id,
      };
    },
  );

  const hydratedHouseAccounts = terreiros.map((terreiro) => {
    const linkedAccount =
      normalizedAccounts.find((account) => account.id === terreiro.accessAccountId && !account.userId) ??
      normalizedAccounts.find((account) => account.terreiroId === terreiro.id && !account.userId);

    return linkedAccount ?? getDefaultAccountForTerreiro(terreiro, users);
  });

  const hydratedUsers = users.map((user) => {
    const linkedAccount =
      normalizedAccounts.find((account) => account.id === user.accessAccountId) ??
      normalizedAccounts.find((account) => account.userId === user.id) ??
      null;

    return {
      ...user,
      accessAccountId: linkedAccount?.id ?? null,
    };
  });

  const accounts = [globalAccount, ...hydratedHouseAccounts, ...userAccounts].reduce<AccessAccount[]>(
    (items, account) => upsertById(items, account),
    [],
  );

  return {
    terreiros,
    accounts,
    users: hydratedUsers,
    events: Array.isArray(candidate.data.events)
      ? sortEvents(candidate.data.events.map(toEventDate))
      : seedAppData.events,
    pontos: Array.isArray(candidate.data.pontos) ? candidate.data.pontos : seedAppData.pontos,
  };
}

function normalizeData(candidate: unknown): AppData {
  if (!candidate || typeof candidate !== 'object') {
    return seedAppData;
  }

  const parsed = candidate as { version?: number };

  if (parsed.version === 2) {
    return normalizeVersionTwo(parsed as StoredAppData);
  }

  if (parsed.version === 1) {
    return normalizeVersionOne(parsed as Parameters<typeof normalizeVersionOne>[0]);
  }

  return seedAppData;
}

export function loadAppData() {
  if (typeof window === 'undefined') {
    return seedAppData;
  }

  const versionTwoRaw = window.localStorage.getItem(STORAGE_KEY);
  const legacyRaw = window.localStorage.getItem('ile.app-data.v1');
  const raw = versionTwoRaw ?? legacyRaw;

  if (!raw) {
    return seedAppData;
  }

  try {
    return normalizeData(JSON.parse(raw));
  } catch {
    return seedAppData;
  }
}

export function saveAppData(data: AppData) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: StoredAppData = {
    version: 2,
    data: {
      terreiros: data.terreiros,
      accounts: data.accounts,
      users: data.users,
      events: data.events.map((event) => ({
        ...event,
        date: event.date.toISOString(),
      })),
      pontos: data.pontos,
    },
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
