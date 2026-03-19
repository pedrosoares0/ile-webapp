import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer } from 'react';
import { loadAppData, saveAppData } from '../lib/storage';
import { useAuth } from './AuthContext';
import { AccessAccount, AppData, AppUser, Ponto, Terreiro, TerreiroEvent } from '../types';
import { sortEvents } from '../lib/date';

type AppAction =
  | { type: 'save-terreiro'; payload: Terreiro }
  | { type: 'delete-terreiro'; payload: string }
  | { type: 'save-account'; payload: AccessAccount }
  | { type: 'delete-account'; payload: string }
  | { type: 'save-user'; payload: AppUser }
  | { type: 'delete-user'; payload: string }
  | { type: 'save-event'; payload: TerreiroEvent }
  | { type: 'delete-event'; payload: string }
  | { type: 'save-ponto'; payload: Ponto }
  | { type: 'delete-ponto'; payload: string };

interface AppDataContextValue extends AppData {
  currentAccount: AccessAccount | null;
  isGlobalAdmin: boolean;
  isTerreiroAdmin: boolean;
  canAccessCadastros: boolean;
  saveTerreiro: (terreiro: Terreiro) => void;
  deleteTerreiro: (terreiroId: string) => void;
  saveAccount: (account: AccessAccount) => void;
  deleteAccount: (accountId: string) => void;
  saveUser: (user: AppUser) => void;
  deleteUser: (userId: string) => void;
  saveEvent: (event: TerreiroEvent) => void;
  deleteEvent: (eventId: string) => void;
  savePonto: (ponto: Ponto) => void;
  deletePonto: (pontoId: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

function upsertById<T extends { id: string }>(items: T[], nextItem: T) {
  const itemExists = items.some((item) => item.id === nextItem.id);

  if (itemExists) {
    return items.map((item) => (item.id === nextItem.id ? nextItem : item));
  }

  return [nextItem, ...items];
}

function reducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'save-terreiro':
      return {
        ...state,
        terreiros: upsertById(state.terreiros, action.payload).sort((left, right) =>
          left.nome.localeCompare(right.nome),
        ),
      };
    case 'delete-terreiro':
      return {
        ...state,
        terreiros: state.terreiros.filter((terreiro) => terreiro.id !== action.payload),
      };
    case 'save-account':
      return {
        ...state,
        accounts: upsertById(state.accounts, action.payload).sort((left, right) =>
          left.nome.localeCompare(right.nome),
        ),
      };
    case 'delete-account':
      return {
        ...state,
        accounts: state.accounts.filter((account) => account.id !== action.payload),
      };
    case 'save-user':
      return {
        ...state,
        users: upsertById(state.users, action.payload).sort((left, right) =>
          left.nome.localeCompare(right.nome),
        ),
      };
    case 'delete-user':
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
      };
    case 'save-event':
      return {
        ...state,
        events: sortEvents(upsertById(state.events, action.payload)),
      };
    case 'delete-event':
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      };
    case 'save-ponto':
      return {
        ...state,
        pontos: upsertById(state.pontos, action.payload).sort((left, right) =>
          left.titulo.localeCompare(right.titulo),
        ),
      };
    case 'delete-ponto':
      return {
        ...state,
        pontos: state.pontos.filter((ponto) => ponto.id !== action.payload),
      };
    default:
      return state;
  }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadAppData);
  const { session } = useAuth();

  useEffect(() => {
    saveAppData(state);
  }, [state]);

  const value = useMemo<AppDataContextValue>(() => {
    const currentAccount =
      state.accounts.find((account) => account.id === session?.accountId) ?? null;
    const isGlobalAdmin = currentAccount?.role === 'global_admin';
    const isTerreiroAdmin = isGlobalAdmin || currentAccount?.role === 'terreiro_admin';
    const canAccessCadastros = isTerreiroAdmin;
    const scopedTerreiroId = currentAccount?.scope === 'terreiro' ? currentAccount.terreiroId : null;
    const isAllowedTerreiro = (terreiroId: string) => isGlobalAdmin || scopedTerreiroId === terreiroId;
    const canManageScopedData = Boolean(isTerreiroAdmin);
    const getScopedUser = (userId: string) => state.users.find((user) => user.id === userId);
    const getScopedEvent = (eventId: string) => state.events.find((event) => event.id === eventId);
    const getScopedPonto = (pontoId: string) => state.pontos.find((ponto) => ponto.id === pontoId);
    const getScopedAccount = (accountId: string) => state.accounts.find((account) => account.id === accountId);
    const canManageAccount = (account: AccessAccount) => {
      if (!currentAccount) {
        return false;
      }

      if (isGlobalAdmin) {
        return true;
      }

      return (
        currentAccount.role === 'terreiro_admin' &&
        account.scope === 'terreiro' &&
        account.terreiroId === scopedTerreiroId &&
        Boolean(account.userId)
      );
    };

    const terreiros = isGlobalAdmin
      ? state.terreiros
      : state.terreiros.filter((terreiro) => scopedTerreiroId === terreiro.id);
    const accounts = isGlobalAdmin
      ? state.accounts
      : currentAccount?.role === 'terreiro_admin'
        ? state.accounts.filter(
            (account) => account.id === currentAccount?.id || account.terreiroId === scopedTerreiroId,
          )
        : state.accounts.filter((account) => account.id === currentAccount?.id);
    const users = isGlobalAdmin
      ? state.users
      : state.users.filter((user) => scopedTerreiroId === user.terreiroId);
    const events = isGlobalAdmin
      ? state.events
      : state.events.filter((event) => scopedTerreiroId === event.terreiroId);
    const pontos = isGlobalAdmin
      ? state.pontos
      : state.pontos.filter((ponto) => scopedTerreiroId === ponto.terreiroId);

    return {
      terreiros,
      accounts,
      users,
      events,
      pontos,
      currentAccount,
      isGlobalAdmin,
      isTerreiroAdmin,
      canAccessCadastros,
      saveTerreiro: (terreiro) => {
        if (!isGlobalAdmin) {
          return;
        }

        dispatch({ type: 'save-terreiro', payload: terreiro });
      },
      deleteTerreiro: (terreiroId) => {
        if (!isGlobalAdmin) {
          return;
        }

        dispatch({ type: 'delete-terreiro', payload: terreiroId });
      },
      saveAccount: (account) => {
        const existingAccount = getScopedAccount(account.id);
        const targetAccount = existingAccount ? { ...existingAccount, ...account } : account;

        if (!canManageAccount(targetAccount)) {
          return;
        }

        dispatch({ type: 'save-account', payload: targetAccount });
      },
      deleteAccount: (accountId) => {
        const account = getScopedAccount(accountId);

        if (!account || accountId === currentAccount?.id || !canManageAccount(account)) {
          return;
        }

        dispatch({ type: 'delete-account', payload: accountId });
      },
      saveUser: (user) => {
        if (!currentAccount || !canManageScopedData || !isAllowedTerreiro(user.terreiroId)) {
          return;
        }

        dispatch({ type: 'save-user', payload: user });
      },
      deleteUser: (userId) => {
        const user = getScopedUser(userId);

        if (!currentAccount || !canManageScopedData || !user || !isAllowedTerreiro(user.terreiroId)) {
          return;
        }

        dispatch({ type: 'delete-user', payload: userId });
      },
      saveEvent: (event) => {
        if (!currentAccount || !canManageScopedData || !isAllowedTerreiro(event.terreiroId)) {
          return;
        }

        dispatch({ type: 'save-event', payload: event });
      },
      deleteEvent: (eventId) => {
        const event = getScopedEvent(eventId);

        if (!currentAccount || !canManageScopedData || !event || !isAllowedTerreiro(event.terreiroId)) {
          return;
        }

        dispatch({ type: 'delete-event', payload: eventId });
      },
      savePonto: (ponto) => {
        if (!currentAccount || !canManageScopedData || !isAllowedTerreiro(ponto.terreiroId)) {
          return;
        }

        dispatch({ type: 'save-ponto', payload: ponto });
      },
      deletePonto: (pontoId) => {
        const ponto = getScopedPonto(pontoId);

        if (!currentAccount || !canManageScopedData || !ponto || !isAllowedTerreiro(ponto.terreiroId)) {
          return;
        }

        dispatch({ type: 'delete-ponto', payload: pontoId });
      },
    };
  }, [session?.accountId, state]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }

  return context;
}
