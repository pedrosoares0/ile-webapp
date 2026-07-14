import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthSession } from '../types';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    // Get the initial active session
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      if (activeSession) {
        setSession({ accountId: activeSession.user.id });
      }
    });

    // Listen for auth state changes (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, activeSession) => {
      if (activeSession) {
        setSession({ accountId: activeSession.user.id });
      } else {
        setSession(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accountId),
      login: async (emailOrUsername, password) => {
        let emailToAuth = emailOrUsername.trim();

        // If the identifier doesn't look like an email, treat it as a username
        if (!emailToAuth.includes('@')) {
          const { data: profile, error: lookupError } = await supabase
            .from('accounts')
            .select('email')
            .ilike('username', emailToAuth)
            .maybeSingle();

          if (lookupError || !profile) {
            return {
              success: false,
              error: 'Nome de usuário não encontrado.',
            };
          }
          emailToAuth = profile.email;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToAuth,
          password,
        });

        if (error) {
          let errorMsg = error.message;
          if (error.message === 'Invalid login credentials') {
            errorMsg = 'Usuário/E-mail ou senha inválidos.';
          }
          return {
            success: false,
            error: errorMsg,
          };
        }

        setSession({ accountId: data.user.id });
        return { success: true };
      },
      logout: async () => {
        await supabase.auth.signOut();
        setSession(null);
      },
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
