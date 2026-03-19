import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { seedAppData } from '../data/seed';
import { loadAppData } from '../lib/storage';
import { AuthSession } from '../types';

const SESSION_STORAGE_KEY = 'ile.auth-session.v1';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function findAccountByCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const data = loadAppData();

  const directMatch = data.accounts.find(
    (currentAccount) =>
      currentAccount.email.trim().toLowerCase() === normalizedEmail &&
      currentAccount.password === password,
  );

  if (directMatch) {
    return directMatch;
  }

  const seededAliases = seedAppData.accounts.filter(
    (account) =>
      account.scope === 'terreiro' &&
      !account.userId &&
      account.email.trim().toLowerCase() === normalizedEmail,
  );

  for (const alias of seededAliases) {
    const scopedAccount = data.accounts.find(
      (currentAccount) =>
        currentAccount.scope === 'terreiro' &&
        currentAccount.terreiroId === alias.terreiroId &&
        currentAccount.password === password,
    );

    if (scopedAccount) {
      return scopedAccount;
    }
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!session) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accountId),
      login: (email, password) => {
        const account = findAccountByCredentials(email, password);

        if (!account) {
          return {
            success: false,
            error: 'E-mail ou senha inválidos.',
          };
        }

        setSession({ accountId: account.id });
        return { success: true };
      },
      logout: () => setSession(null),
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
