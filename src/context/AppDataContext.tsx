import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { AccessAccount, AppUser, Ponto, Terreiro, TerreiroEvent, Notice, PrayerRequest } from '../types';
import { supabase } from '../lib/supabase';
import { parseLocalDate, formatDateYYYYMMDD } from '../lib/date';


interface AppDataContextValue {
  terreiros: Terreiro[];
  accounts: AccessAccount[];
  users: AppUser[];
  events: TerreiroEvent[];
  pontos: Ponto[];
  notices: Notice[];
  currentAccount: AccessAccount | null;
  isGlobalAdmin: boolean;
  isTerreiroAdmin: boolean;
  canAccessCadastros: boolean;
  isLoading: boolean;
  saveTerreiro: (terreiro: Terreiro) => Promise<void>;
  deleteTerreiro: (terreiroId: string) => Promise<void>;
  saveAccount: (account: AccessAccount) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  saveUser: (user: AppUser) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  saveEvent: (event: TerreiroEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  savePonto: (ponto: Ponto) => Promise<void>;
  deletePonto: (pontoId: string) => Promise<void>;
  saveNotice: (notice: Notice) => Promise<void>;
  deleteNotice: (noticeId: string) => Promise<void>;
  prayers: PrayerRequest[];
  savePrayer: (prayer: PrayerRequest) => Promise<void>;
  answerPrayer: (prayerId: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

function upsertById<T extends { id: string }>(items: T[], nextItem: T) {
  const itemExists = items.some((item) => item.id === nextItem.id);

  if (itemExists) {
    return items.map((item) => (item.id === nextItem.id ? nextItem : item));
  }

  return [nextItem, ...items];
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  const [terreiros, setTerreiros] = useState<Terreiro[]>([]);
  const [accounts, setAccounts] = useState<AccessAccount[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [events, setEvents] = useState<TerreiroEvent[]>([]);
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [currentAccount, setCurrentAccount] = useState<AccessAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isGlobalAdmin = useMemo(() => currentAccount?.role === 'global_admin', [currentAccount]);
  const isTerreiroAdmin = useMemo(() => isGlobalAdmin || currentAccount?.role === 'terreiro_admin', [isGlobalAdmin, currentAccount]);
  const canAccessCadastros = isTerreiroAdmin;

  useEffect(() => {
    if (!session?.accountId) {
      setCurrentAccount(null);
      setTerreiros([]);
      setAccounts([]);
      setUsers([]);
      setEvents([]);
      setPontos([]);
      setNotices([]);
      setPrayers([]);
      setIsLoading(false);
      return;
    }

    // Set loading immediately (synchronously) to prevent the safety-check
    // in App.tsx from seeing isLoading=false + currentAccount=null and
    // triggering a premature logout.
    setIsLoading(true);

    const loadData = async () => {
      try {
        // 1. Fetch current user account profile
        const { data: profile, error: profileError } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', session.accountId)
          .single();

        if (profileError || !profile) {
          console.error('Error fetching profile:', profileError);
          setIsLoading(false);
          return;
        }

        const mappedAccount: AccessAccount = {
          id: profile.id,
          nome: profile.nome || '',
          email: profile.email || '',
          password: '', // We don't expose password values from database
          scope: profile.scope,
          role: profile.role,
          terreiroId: profile.terreiro_id || '',
          userId: profile.user_id,
          createdAt: profile.created_at,
        };

        setCurrentAccount(mappedAccount);

        const isGlobalAdminUser = mappedAccount.role === 'global_admin';
        const isHubUser = mappedAccount.role === 'terreiro_user' && !mappedAccount.terreiroId;
        const scopedTerreiroId = mappedAccount.terreiroId;

        // 2. Fetch Terreiros
        let terreirosData: any[] = [];
        if (isGlobalAdminUser || isHubUser) {
          const { data } = await supabase.from('terreiros').select('*').order('nome');
          terreirosData = data || [];
        } else if (scopedTerreiroId) {
          const { data } = await supabase.from('terreiros').select('*').eq('id', scopedTerreiroId);
          terreirosData = data || [];
        }
        setTerreiros(
          terreirosData.map((t) => ({
            id: t.id,
            nome: t.nome,
            cidade: t.cidade || '',
            estado: t.estado || '',
            dirigente: t.dirigente || '',
            contato: t.contato || '',
            observacoes: t.observacoes || '',
            ativo: t.ativo,
            accessAccountId: t.access_account_id || '',
            createdAt: t.created_at,
          }))
        );

        // 3. Fetch Accounts Profiles
        let accountsData: any[] = [];
        if (isGlobalAdminUser) {
          const { data } = await supabase.from('accounts').select('*').order('nome');
          accountsData = data || [];
        } else if (mappedAccount.role === 'terreiro_admin' && scopedTerreiroId) {
          const { data } = await supabase
            .from('accounts')
            .select('*')
            .or(`id.eq.${session.accountId},terreiro_id.eq.${scopedTerreiroId}`);
          accountsData = data || [];
        } else {
          accountsData = [profile];
        }
        setAccounts(
          accountsData.map((acc) => ({
            id: acc.id,
            nome: acc.nome || '',
            email: acc.email || '',
            password: '',
            scope: acc.scope,
            role: acc.role,
            terreiroId: acc.terreiro_id || '',
            userId: acc.user_id,
            createdAt: acc.created_at,
          }))
        );

        // 4. Fetch Users
        let usersData: any[] = [];
        if (isGlobalAdminUser) {
          const { data } = await supabase.from('users').select('*').order('nome');
          usersData = data || [];
        } else if (scopedTerreiroId) {
          const { data } = await supabase.from('users').select('*').eq('terreiro_id', scopedTerreiroId);
          usersData = data || [];
        }
        setUsers(
          usersData.map((u) => ({
            id: u.id,
            nome: u.nome,
            email: u.email || '',
            telefone: u.telefone || '',
            role: u.role,
            status: u.status,
            terreiroId: u.terreiro_id || '',
            accessAccountId: u.access_account_id,
            createdAt: u.created_at,
          }))
        );

        // 5. Fetch Events
        let eventsData: any[] = [];
        if (isGlobalAdminUser || isHubUser) {
          const { data } = await supabase.from('events').select('*');
          eventsData = data || [];
        } else if (scopedTerreiroId) {
          const { data } = await supabase.from('events').select('*').eq('terreiro_id', scopedTerreiroId);
          eventsData = data || [];
        }
        setEvents(
          eventsData.map((e) => ({
            id: e.id,
            date: parseLocalDate(e.date + 'T12:00:00'), // prevent local timezone shift
            title: e.title,
            time: e.time || '',
            location: e.location || '',
            type: e.type,
            category: e.category,
            terreiroId: e.terreiro_id,
            description: e.description || '',
            createdAt: e.created_at,
          })).sort((a, b) => a.date.getTime() - b.date.getTime())
        );

        // 6. Fetch Pontos
        let pontosData: any[] = [];
        if (isGlobalAdminUser || isHubUser) {
          const { data } = await supabase.from('pontos').select('*').order('titulo');
          pontosData = data || [];
        } else if (scopedTerreiroId) {
          const { data } = await supabase
            .from('pontos')
            .select('*')
            .eq('terreiro_id', scopedTerreiroId)
            .order('titulo');
          pontosData = data || [];
        }
        setPontos(
          pontosData.map((p) => ({
            id: p.id,
            titulo: p.titulo,
            categoria: p.categoria,
            youtubeUrl: p.youtube_url || '',
            descricao: p.descricao || '',
            thumbnail: p.thumbnail || '',
            terreiroId: p.terreiro_id,
            letra: p.letra || '',
            createdAt: p.created_at,
          }))
        );

        // 7. Fetch Notices
        let noticesData: any[] = [];
        if (isGlobalAdminUser || isHubUser) {
          const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
          noticesData = data || [];
        } else if (scopedTerreiroId) {
          const { data } = await supabase
            .from('notices')
            .select('*')
            .eq('terreiro_id', scopedTerreiroId)
            .order('created_at', { ascending: false });
          noticesData = data || [];
        }
        setNotices(
          noticesData.map((n) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            category: n.category,
            date: n.date || '',
            createdAt: n.created_at,
            terreiroId: n.terreiro_id,
          }))
        );

        // 8. Fetch Prayer Requests
        let prayersData: any[] = [];
        if (isGlobalAdminUser || isHubUser) {
          const { data } = await supabase.from('prayer_requests').select('*').order('created_at', { ascending: false });
          prayersData = data || [];
        } else if (scopedTerreiroId) {
          if (mappedAccount.role === 'terreiro_admin') {
            // Pai (Admin/Dirigente): sees all prayer requests from the terreiro
            const { data } = await supabase
              .from('prayer_requests')
              .select('*')
              .eq('terreiro_id', scopedTerreiroId)
              .order('created_at', { ascending: false });
            prayersData = data || [];
          } else {
            // Filho (Membro): sees only their own prayer requests
            const { data } = await supabase
              .from('prayer_requests')
              .select('*')
              .eq('terreiro_id', scopedTerreiroId)
              .eq('account_id', mappedAccount.id)
              .order('created_at', { ascending: false });
            prayersData = data || [];
          }
        }
        setPrayers(
          prayersData.map((p) => ({
            id: p.id,
            name: p.name,
            type: p.type,
            content: p.content,
            answered: p.answered,
            answeredAt: p.answered_at,
            accountId: p.account_id,
            terreiroId: p.terreiro_id,
            createdAt: p.created_at,
          }))
        );
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [session?.accountId]);

  const value = useMemo<AppDataContextValue>(() => {
    return {
      terreiros,
      accounts,
      users,
      events,
      pontos,
      notices,
      prayers,
      currentAccount,
      isGlobalAdmin,
      isTerreiroAdmin,
      canAccessCadastros,
      isLoading,

      saveTerreiro: async (terreiro) => {
        if (!isGlobalAdmin) return;
        const { error } = await supabase.from('terreiros').upsert({
          id: terreiro.id,
          nome: terreiro.nome,
          cidade: terreiro.cidade,
          estado: terreiro.estado,
          dirigente: terreiro.dirigente,
          contato: terreiro.contato,
          observacoes: terreiro.observacoes,
          ativo: terreiro.ativo,
          access_account_id: terreiro.accessAccountId || null,
        });
        if (!error) {
          setTerreiros((prev) => upsertById(prev, terreiro).sort((a, b) => a.nome.localeCompare(b.nome)));
        }
      },

      deleteTerreiro: async (terreiroId) => {
        if (!isGlobalAdmin) return;
        const { error } = await supabase.from('terreiros').delete().eq('id', terreiroId);
        if (!error) {
          setTerreiros((prev) => prev.filter((t) => t.id !== terreiroId));
        }
      },

      saveAccount: async (account) => {
        const { error } = await supabase.from('accounts').upsert({
          id: account.id,
          nome: account.nome,
          email: account.email,
          scope: account.scope,
          role: account.role,
          terreiro_id: account.terreiroId || null,
          user_id: account.userId || null,
        });
        if (!error) {
          setAccounts((prev) => upsertById(prev, account).sort((a, b) => a.nome.localeCompare(b.nome)));
        }
      },

      deleteAccount: async (accountId) => {
        if (accountId === currentAccount?.id) return;
        const { error } = await supabase.from('accounts').delete().eq('id', accountId);
        if (!error) {
          setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
        }
      },

      saveUser: async (user) => {
        const { error } = await supabase.from('users').upsert({
          id: user.id,
          nome: user.nome,
          email: user.email,
          telefone: user.telefone,
          role: user.role,
          status: user.status,
          terreiro_id: user.terreiroId || null,
          access_account_id: user.accessAccountId || null,
        });
        if (!error) {
          setUsers((prev) => upsertById(prev, user).sort((a, b) => a.nome.localeCompare(b.nome)));
        }
      },

      deleteUser: async (userId) => {
        const { error } = await supabase.from('users').delete().eq('id', userId);
        if (!error) {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
        }
      },

      saveEvent: async (event) => {
        const { error } = await supabase.from('events').upsert({
          id: event.id,
          date: formatDateYYYYMMDD(event.date),
          title: event.title,
          time: event.time,
          location: event.location,
          type: event.type,
          category: event.category,
          terreiro_id: event.terreiroId,
          description: event.description,
        });
        if (!error) {
          setEvents((prev) => upsertById(prev, event).sort((a, b) => a.date.getTime() - b.date.getTime()));
        }
      },

      deleteEvent: async (eventId) => {
        const { error } = await supabase.from('events').delete().eq('id', eventId);
        if (!error) {
          setEvents((prev) => prev.filter((e) => e.id !== eventId));
        }
      },

      savePonto: async (ponto) => {
        const { error } = await supabase.from('pontos').upsert({
          id: ponto.id,
          titulo: ponto.titulo,
          categoria: ponto.categoria,
          youtube_url: ponto.youtubeUrl,
          descricao: ponto.descricao,
          thumbnail: ponto.thumbnail,
          terreiro_id: ponto.terreiroId,
          letra: ponto.letra,
        });
        if (!error) {
          setPontos((prev) => upsertById(prev, ponto).sort((a, b) => a.titulo.localeCompare(b.titulo)));
        }
      },

      deletePonto: async (pontoId) => {
        const { error } = await supabase.from('pontos').delete().eq('id', pontoId);
        if (!error) {
          setPontos((prev) => prev.filter((p) => p.id !== pontoId));
        }
      },

      saveNotice: async (notice) => {
        const { error } = await supabase.from('notices').upsert({
          id: notice.id,
          title: notice.title,
          content: notice.content,
          category: notice.category,
          date: notice.date || null,
          terreiro_id: notice.terreiroId,
        });
        if (!error) {
          setNotices((prev) => upsertById(prev, notice).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      },

      deleteNotice: async (noticeId) => {
        const { error } = await supabase.from('notices').delete().eq('id', noticeId);
        if (!error) {
          setNotices((prev) => prev.filter((n) => n.id !== noticeId));
        }
      },
 
      savePrayer: async (prayer) => {
        const { error } = await supabase.from('prayer_requests').upsert({
          id: prayer.id,
          name: prayer.name,
          type: prayer.type,
          content: prayer.content,
          answered: prayer.answered,
          answered_at: prayer.answeredAt,
          account_id: prayer.accountId,
          terreiro_id: prayer.terreiroId,
          created_at: prayer.createdAt,
        });
        if (!error) {
          setPrayers((prev) => upsertById(prev, prayer).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      },

      answerPrayer: async (prayerId) => {
        const answeredAt = new Date().toISOString();
        const { error } = await supabase
          .from('prayer_requests')
          .update({
            answered: true,
            answered_at: answeredAt,
          })
          .eq('id', prayerId);
        
        if (!error) {
          setPrayers((prev) => 
            prev.map(p => p.id === prayerId ? { ...p, answered: true, answeredAt } : p)
          );
        }
      },
    };
  }, [terreiros, accounts, users, events, pontos, notices, prayers, currentAccount, isGlobalAdmin, isTerreiroAdmin, canAccessCadastros, isLoading]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }

  return context;
}
