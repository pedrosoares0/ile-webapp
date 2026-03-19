import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  CalendarDays,
  Pencil,
  Play,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import EmptyStateCard from '../components/EmptyStateCard';
import SheetModal from '../components/SheetModal';
import { useAppData } from '../context/AppDataContext';
import { formatDateInputValue, sortEvents } from '../lib/date';
import { createId } from '../lib/id';
import { buildYoutubeThumbnail, getYoutubeId } from '../lib/youtube';
import {
  AppUser,
  EVENT_CATEGORIES,
  EVENT_TYPES,
  EventCategory,
  EventType,
  PONTO_CATEGORIES,
  Ponto,
  PontoCategory,
  TERREIRO_ACCESS_ROLES,
  Terreiro,
  TerreiroEvent,
  TerreiroAccessRole,
  USER_ROLES,
  USER_STATUSES,
  UserRole,
  UserStatus,
} from '../types';

type AdminTab = 'terreiros' | 'usuarios' | 'eventos' | 'pontos';

interface TerreiroFormState {
  nome: string;
  cidade: string;
  estado: string;
  dirigente: string;
  contato: string;
  observacoes: string;
  ativo: boolean;
  accessEmail: string;
  accessPassword: string;
}

interface UserFormState {
  nome: string;
  email: string;
  telefone: string;
  role: UserRole;
  status: UserStatus;
  terreiroId: string;
  accessRole: TerreiroAccessRole;
  accessPassword: string;
}

interface EventFormState {
  title: string;
  time: string;
  location: string;
  type: EventType;
  category: EventCategory;
  terreiroId: string;
  description: string;
  date: string;
}

interface PontoFormState {
  titulo: string;
  categoria: PontoCategory;
  youtubeUrl: string;
  descricao: string;
  terreiroId: string;
  letra: string;
}

const inputClass =
  'w-full rounded-[25px] border border-white bg-white px-6 py-4 font-bold text-[#414141] focus:outline-none focus:ring-2 focus:ring-[#941c1c]/10';
const selectClass =
  'w-full appearance-none rounded-[25px] border border-white bg-white px-6 py-4 font-bold text-[#414141] focus:outline-none focus:ring-2 focus:ring-[#941c1c]/10';
const textareaClass =
  'w-full resize-none rounded-[25px] border border-white bg-white px-6 py-4 font-bold text-[#414141] focus:outline-none focus:ring-2 focus:ring-[#941c1c]/10';
const labelClass =
  'mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40';
const iconButtonClass = 'flex h-10 w-10 items-center justify-center rounded-full bg-[#fef7e7] text-[#941c1c]';

function getDefaultTerreiroForm(): TerreiroFormState {
  return {
    nome: '',
    cidade: '',
    estado: '',
    dirigente: '',
    contato: '',
    observacoes: '',
    ativo: true,
    accessEmail: '',
    accessPassword: '',
  };
}

function getDefaultUserForm(terreiroId: string): UserFormState {
  return {
    nome: '',
    email: '',
    telefone: '',
    role: 'membro',
    status: 'ativo',
    terreiroId,
    accessRole: 'terreiro_user',
    accessPassword: '123456',
  };
}

function getDefaultEventForm(terreiroId: string): EventFormState {
  return {
    title: '',
    time: '',
    location: '',
    type: 'normal',
    category: 'Religioso',
    terreiroId,
    description: '',
    date: formatDateInputValue(new Date()),
  };
}

function getDefaultPontoForm(terreiroId: string): PontoFormState {
  return {
    titulo: '',
    categoria: 'ORIXÁS',
    youtubeUrl: '',
    descricao: '',
    terreiroId,
    letra: '',
  };
}

export default function CadastrosView() {
  const {
    terreiros,
    accounts,
    users,
    events,
    pontos,
    currentAccount,
    isGlobalAdmin,
    saveTerreiro,
    deleteTerreiro,
    saveAccount,
    deleteAccount,
    saveUser,
    deleteUser,
    saveEvent,
    deleteEvent,
    savePonto,
    deletePonto,
  } = useAppData();

  const [tab, setTab] = useState<AdminTab>('terreiros');
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingTerreiroId, setEditingTerreiroId] = useState<string | null>(null);
  const [showTerreiroModal, setShowTerreiroModal] = useState(false);
  const [terreiroForm, setTerreiroForm] = useState<TerreiroFormState>(getDefaultTerreiroForm());

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState<UserFormState>(getDefaultUserForm(terreiros[0]?.id ?? ''));

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState<EventFormState>(getDefaultEventForm(terreiros[0]?.id ?? ''));

  const [editingPontoId, setEditingPontoId] = useState<string | null>(null);
  const [showPontoModal, setShowPontoModal] = useState(false);
  const [pontoForm, setPontoForm] = useState<PontoFormState>(getDefaultPontoForm(terreiros[0]?.id ?? ''));

  const firstTerreiroId = terreiros[0]?.id ?? '';
  const orderedEvents = sortEvents(events);

  function clearMessages() {
    setPageMessage(null);
    setFormError(null);
  }

  function getTerreiroName(terreiroId: string) {
    return terreiros.find((terreiro) => terreiro.id === terreiroId)?.nome ?? 'Terreiro não encontrado';
  }

  function getAccessRoleLabel(accessRole: TerreiroAccessRole) {
    return accessRole === 'terreiro_admin' ? 'Admin do Terreiro' : 'Usuário do Terreiro';
  }

  function getTerreiroLinks(terreiroId: string) {
    return {
      users: users.filter((user) => user.terreiroId === terreiroId).length,
      events: events.filter((event) => event.terreiroId === terreiroId).length,
      pontos: pontos.filter((ponto) => ponto.terreiroId === terreiroId).length,
    };
  }

  function openTerreiroModal(terreiro?: Terreiro) {
    clearMessages();

    if (!isGlobalAdmin) {
      setPageMessage('Somente o admin geral pode cadastrar ou editar terreiros.');
      return;
    }

    setEditingTerreiroId(terreiro?.id ?? null);
    const linkedAccount = terreiro
      ? accounts.find((account) => account.id === terreiro.accessAccountId) ?? null
      : null;
    setTerreiroForm(
      terreiro
        ? {
            nome: terreiro.nome,
            cidade: terreiro.cidade,
            estado: terreiro.estado,
            dirigente: terreiro.dirigente,
            contato: terreiro.contato,
            observacoes: terreiro.observacoes,
            ativo: terreiro.ativo,
            accessEmail: linkedAccount?.email ?? '',
            accessPassword: linkedAccount?.password ?? '',
          }
        : getDefaultTerreiroForm(),
    );
    setShowTerreiroModal(true);
  }

  function openUserModal(user?: AppUser) {
    clearMessages();
    if (!firstTerreiroId && !user) {
      setPageMessage('Cadastre um terreiro antes de criar usuários.');
      return;
    }

    const linkedAccount = user
      ? accounts.find((account) => account.id === user.accessAccountId) ??
        accounts.find((account) => account.userId === user.id) ??
        null
      : null;

    setEditingUserId(user?.id ?? null);
    setUserForm(
      user
        ? {
            nome: user.nome,
            email: user.email,
            telefone: user.telefone,
            role: user.role,
            status: user.status,
            terreiroId: user.terreiroId,
            accessRole:
              linkedAccount?.role === 'terreiro_admin' ? 'terreiro_admin' : 'terreiro_user',
            accessPassword: linkedAccount?.password ?? '123456',
          }
        : getDefaultUserForm(firstTerreiroId),
    );
    setShowUserModal(true);
  }

  function openEventModal(event?: TerreiroEvent) {
    clearMessages();
    if (!firstTerreiroId && !event) {
      setPageMessage('Cadastre um terreiro antes de criar eventos.');
      return;
    }

    setEditingEventId(event?.id ?? null);
    setEventForm(
      event
        ? {
            title: event.title,
            time: event.time,
            location: event.location,
            type: event.type,
            category: event.category,
            terreiroId: event.terreiroId,
            description: event.description,
            date: formatDateInputValue(event.date),
          }
        : getDefaultEventForm(firstTerreiroId),
    );
    setShowEventModal(true);
  }

  function openPontoModal(ponto?: Ponto) {
    clearMessages();
    if (!firstTerreiroId && !ponto) {
      setPageMessage('Cadastre um terreiro antes de criar pontos.');
      return;
    }

    setEditingPontoId(ponto?.id ?? null);
    setPontoForm(
      ponto
        ? {
            titulo: ponto.titulo,
            categoria: ponto.categoria,
            youtubeUrl: ponto.youtubeUrl,
            descricao: ponto.descricao,
            terreiroId: ponto.terreiroId,
            letra: ponto.letra,
          }
        : getDefaultPontoForm(firstTerreiroId),
    );
    setShowPontoModal(true);
  }

  function handleDeleteTerreiro(terreiroId: string) {
    clearMessages();
    const links = getTerreiroLinks(terreiroId);
    const terreiro = terreiros.find((currentTerreiro) => currentTerreiro.id === terreiroId) ?? null;

    if (terreiros.length <= 1) {
      setPageMessage('Mantenha ao menos um terreiro cadastrado.');
      return;
    }

    if (links.users || links.events || links.pontos) {
      setPageMessage('Este terreiro possui vínculos e não pode ser removido agora.');
      return;
    }

    if (window.confirm('Deseja realmente excluir este terreiro?')) {
      if (terreiro?.accessAccountId) {
        deleteAccount(terreiro.accessAccountId);
      }
      deleteTerreiro(terreiroId);
    }
  }

  function handleDelete(callback: () => void, message: string) {
    clearMessages();
    if (window.confirm(message)) {
      callback();
    }
  }

  function handleDeleteUser(user: AppUser) {
    clearMessages();

    if (user.accessAccountId === currentAccount?.id) {
      setPageMessage('Você não pode excluir o próprio acesso enquanto está logado.');
      return;
    }

    handleDelete(() => {
      if (user.accessAccountId) {
        deleteAccount(user.accessAccountId);
      }
      deleteUser(user.id);
    }, 'Deseja excluir este usuário?');
  }

  function handleSaveTerreiro(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isGlobalAdmin) {
      return;
    }

    const normalizedEmail = terreiroForm.accessEmail.trim().toLowerCase();

    if (!normalizedEmail.includes('@')) {
      setFormError('Informe um e-mail válido para o acesso do terreiro.');
      return;
    }

    if (!terreiroForm.accessPassword.trim()) {
      setFormError('Informe uma senha para o acesso do terreiro.');
      return;
    }

    const linkedTerreiro = editingTerreiroId
      ? terreiros.find((terreiro) => terreiro.id === editingTerreiroId) ?? null
      : null;
    const existingAccount = linkedTerreiro
      ? accounts.find((account) => account.id === linkedTerreiro.accessAccountId) ?? null
      : null;

    const duplicatedEmail = accounts.some(
      (account) => account.email.trim().toLowerCase() === normalizedEmail && account.id !== existingAccount?.id,
    );

    if (duplicatedEmail) {
      setFormError('Já existe uma conta usando este e-mail.');
      return;
    }

    const accountId = existingAccount?.id ?? createId('account');
    const terreiroId = editingTerreiroId ?? createId('terreiro');

    saveAccount({
      id: accountId,
      nome: terreiroForm.dirigente.trim(),
      email: normalizedEmail,
      password: terreiroForm.accessPassword.trim(),
      scope: 'terreiro',
      role: 'terreiro_admin',
      terreiroId,
      userId: null,
      createdAt: existingAccount?.createdAt ?? new Date().toISOString(),
    });

    saveTerreiro({
      id: terreiroId,
      nome: terreiroForm.nome.trim(),
      cidade: terreiroForm.cidade.trim(),
      estado: terreiroForm.estado.trim(),
      dirigente: terreiroForm.dirigente.trim(),
      contato: terreiroForm.contato.trim(),
      observacoes: terreiroForm.observacoes.trim(),
      ativo: terreiroForm.ativo,
      accessAccountId: accountId,
      createdAt:
        terreiros.find((terreiro) => terreiro.id === editingTerreiroId)?.createdAt ??
        new Date().toISOString(),
    });

    setFormError(null);
    setShowTerreiroModal(false);
  }

  function handleSaveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = userForm.email.trim().toLowerCase();

    if (!normalizedEmail.includes('@')) {
      setFormError('Informe um e-mail válido.');
      return;
    }

    if (!userForm.accessPassword.trim()) {
      setFormError('Informe uma senha de acesso para este usuário.');
      return;
    }

    const existingUser = editingUserId ? users.find((user) => user.id === editingUserId) ?? null : null;
    const existingAccount =
      accounts.find((account) => account.id === existingUser?.accessAccountId) ??
      accounts.find((account) => account.userId === editingUserId) ??
      null;
    const duplicatedEmail = accounts.some(
      (account) => account.email.trim().toLowerCase() === normalizedEmail && account.id !== existingAccount?.id,
    );

    if (duplicatedEmail) {
      setFormError('Já existe uma conta usando este e-mail.');
      return;
    }

    const userId = editingUserId ?? createId('user');
    const accountId = existingAccount?.id ?? createId('account');

    saveAccount({
      id: accountId,
      nome: userForm.nome.trim(),
      email: normalizedEmail,
      password: userForm.accessPassword.trim(),
      scope: 'terreiro',
      role: userForm.accessRole,
      terreiroId: userForm.terreiroId,
      userId,
      createdAt: existingAccount?.createdAt ?? new Date().toISOString(),
    });

    saveUser({
      id: userId,
      nome: userForm.nome.trim(),
      email: normalizedEmail,
      telefone: userForm.telefone.trim(),
      role: userForm.role,
      status: userForm.status,
      terreiroId: userForm.terreiroId,
      accessAccountId: accountId,
      createdAt: users.find((user) => user.id === editingUserId)?.createdAt ?? new Date().toISOString(),
    });

    setFormError(null);
    setShowUserModal(false);
  }

  function handleSaveEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    saveEvent({
      id: editingEventId ?? createId('event'),
      date: new Date(`${eventForm.date}T00:00:00`),
      title: eventForm.title.trim(),
      time: eventForm.time,
      location: eventForm.location.trim(),
      type: eventForm.type,
      category: eventForm.category,
      terreiroId: eventForm.terreiroId,
      description: eventForm.description.trim(),
      createdAt:
        events.find((registeredEvent) => registeredEvent.id === editingEventId)?.createdAt ??
        new Date().toISOString(),
    });

    setShowEventModal(false);
  }

  function handleSavePonto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const videoId = getYoutubeId(pontoForm.youtubeUrl);

    if (!videoId) {
      setFormError('Informe uma URL válida do YouTube.');
      return;
    }

    savePonto({
      id: editingPontoId ?? createId('ponto'),
      titulo: pontoForm.titulo.trim(),
      categoria: pontoForm.categoria,
      youtubeUrl: pontoForm.youtubeUrl.trim(),
      descricao: pontoForm.descricao.trim(),
      thumbnail: buildYoutubeThumbnail(videoId),
      terreiroId: pontoForm.terreiroId,
      letra: pontoForm.letra.trim(),
      createdAt:
        pontos.find((registeredPonto) => registeredPonto.id === editingPontoId)?.createdAt ??
        new Date().toISOString(),
    });

    setShowPontoModal(false);
  }

  const stats = [
    { id: 'terreiros', title: 'Terreiros', value: terreiros.length },
    { id: 'usuarios', title: 'Usuários', value: users.length },
    { id: 'eventos', title: 'Eventos', value: events.length },
    { id: 'pontos', title: 'Pontos', value: pontos.length },
  ];

  const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: 'terreiros', label: 'Terreiros' },
    { id: 'usuarios', label: 'Usuários' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'pontos', label: 'Pontos' },
  ];

  return (
    <motion.div
      key="cadastros"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="px-6 pb-32 pt-16"
    >
      <div className="rounded-[45px] border border-white/40 bg-white/60 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-behind uppercase tracking-[0.2em] text-[#941c1c]/40">ADMINISTRAÇÃO</p>
            <h1 className="mt-1 text-[44px] font-behind leading-tight text-[#941c1c]">Cadastros</h1>
            <p className="mt-3 max-w-[240px] text-[13px] font-medium leading-relaxed text-[#941c1c]/40">
              Estruture usuários, terreiros, agenda e biblioteca em uma base pronta para backend.
            </p>
            <div className="mt-4 inline-flex rounded-full bg-[#941c1c]/6 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#941c1c]/50">
              {isGlobalAdmin ? 'Admin geral' : 'Admin do terreiro'} · {currentAccount?.email}
            </div>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#941c1c] text-white shadow-lg shadow-[#941c1c]/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.id}
            type="button"
            onClick={() => setTab(stat.id as AdminTab)}
            className="rounded-[28px] bg-white px-5 py-5 text-left shadow-[0_6px_15px_rgba(0,0,0,0.02)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#941c1c]/40">{stat.title}</p>
            <p className="mt-3 text-3xl font-black tracking-tight text-[#414141]">{stat.value}</p>
          </button>
        ))}
      </div>

      <div className="scrollbar-hide mt-8 flex gap-3 overflow-x-auto pb-2">
        {tabs.map((currentTab) => (
          <button
            key={currentTab.id}
            type="button"
            onClick={() => {
              clearMessages();
              setTab(currentTab.id);
            }}
            className={`whitespace-nowrap rounded-[20px] px-7 py-4 text-[11px] font-black shadow-sm transition-all duration-300 ${
              tab === currentTab.id
                ? 'bg-[#941c1c] text-white shadow-[#941c1c]/20'
                : 'border border-[#941c1c]/5 bg-white text-[#941c1c]'
            }`}
          >
            {currentTab.label}
          </button>
        ))}
      </div>

      {pageMessage ? (
        <div className="mt-6 flex items-start gap-3 rounded-[28px] border border-[#941c1c]/10 bg-white px-5 py-4 text-[#941c1c]">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p className="text-[13px] font-semibold leading-relaxed">{pageMessage}</p>
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        <div className="flex items-end justify-between px-2">
          <div>
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#941c1c] opacity-30">
              {tab === 'terreiros'
                ? 'Gestão de Casas'
                : tab === 'usuarios'
                  ? 'Gestão de Acesso'
                  : tab === 'eventos'
                    ? 'Agenda Operacional'
                    : 'Biblioteca Litúrgica'}
            </h3>
            <p className="text-2xl font-bold tracking-tight text-[#414141]">
              {tab === 'terreiros'
                ? 'Terreiros Cadastrados'
                : tab === 'usuarios'
                  ? 'Usuários do Sistema'
                  : tab === 'eventos'
                    ? 'Eventos do Sistema'
                    : 'Pontos Cadastrados'}
            </p>
            {tab === 'terreiros' && !isGlobalAdmin ? (
              <p className="mt-2 text-[12px] font-semibold text-[#941c1c]/45">
                A criação e edição de terreiros é exclusiva do admin geral.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() =>
              tab === 'terreiros'
                ? openTerreiroModal()
                : tab === 'usuarios'
                  ? openUserModal()
                  : tab === 'eventos'
                    ? openEventModal()
                    : openPontoModal()
            }
            disabled={tab === 'terreiros' && !isGlobalAdmin}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#941c1c] text-white shadow-xl shadow-[#941c1c]/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {tab === 'terreiros' &&
          (terreiros.length ? (
            terreiros.map((terreiro) => {
              const links = getTerreiroLinks(terreiro.id);

              return (
                <div
                  key={terreiro.id}
                  className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[18px] font-bold text-[#414141]">{terreiro.nome}</p>
                      <p className="mt-2 text-[12px] font-semibold text-[#414141]/60">
                        {terreiro.cidade} - {terreiro.estado} | {terreiro.dirigente}
                      </p>
                      <p className="mt-2 text-[12px] font-semibold text-[#941c1c]/40">
                        {links.users} usuários, {links.events} eventos, {links.pontos} pontos
                      </p>
                    </div>
                    {isGlobalAdmin ? (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => openTerreiroModal(terreiro)} className={iconButtonClass}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTerreiro(terreiro.id)}
                          className={iconButtonClass}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {terreiro.observacoes ? (
                    <p className="mt-4 text-[13px] font-medium leading-relaxed text-[#414141]/60">
                      {terreiro.observacoes}
                    </p>
                  ) : null}
                  {isGlobalAdmin ? (
                    <p className="mt-2 text-[12px] font-semibold text-[#941c1c]/45">
                      Acesso: {accounts.find((account) => account.id === terreiro.accessAccountId)?.email ?? 'Não definido'}
                    </p>
                  ) : null}
                </div>
              );
            })
          ) : (
            <EmptyStateCard
              icon={<Building2 className="h-8 w-8 text-[#941c1c]/20" />}
              title="Nenhum terreiro cadastrado"
              description="Crie as casas antes de vincular usuários, eventos e pontos."
            />
          ))}

        {tab === 'usuarios' &&
          (users.length ? (
            users.map((user) => {
              const linkedAccount =
                accounts.find((account) => account.id === user.accessAccountId) ??
                accounts.find((account) => account.userId === user.id) ??
                null;

              return (
                <div
                  key={user.id}
                  className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[18px] font-bold text-[#414141]">{user.nome}</p>
                      <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#941c1c]/40">
                        {user.role} | {user.status}
                      </p>
                      <p className="mt-2 text-[13px] font-medium text-[#414141]/60">{user.email}</p>
                      <p className="mt-1 text-[13px] font-medium text-[#414141]/60">
                        {getTerreiroName(user.terreiroId)}
                      </p>
                      <p className="mt-2 text-[12px] font-semibold text-[#941c1c]/45">
                        Acesso: {linkedAccount ? getAccessRoleLabel(linkedAccount.role as TerreiroAccessRole) : 'Sem acesso'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openUserModal(user)} className={iconButtonClass}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDeleteUser(user)} className={iconButtonClass}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyStateCard
              icon={<Users className="h-8 w-8 text-[#941c1c]/20" />}
              title="Nenhum usuário cadastrado"
              description="Cadastre administradores, dirigentes e membros para começar a operação."
            />
          ))}

        {tab === 'eventos' &&
          (orderedEvents.length ? (
            orderedEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[18px] font-bold text-[#414141]">{event.title}</p>
                    <p className="mt-2 text-[12px] font-semibold text-[#414141]/60">
                      {event.date.toLocaleDateString('pt-BR')} | {event.time} | {getTerreiroName(event.terreiroId)}
                    </p>
                    <p className="mt-2 text-[13px] font-medium leading-relaxed text-[#414141]/60">
                      {event.description || 'Sem descrição cadastrada.'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEventModal(event)} className={iconButtonClass}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(() => deleteEvent(event.id), 'Deseja excluir este evento?')}
                      className={iconButtonClass}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyStateCard
              icon={<CalendarDays className="h-8 w-8 text-[#941c1c]/20" />}
              title="Nenhum evento cadastrado"
              description="Monte a agenda com datas, horários, locais e vínculos com os terreiros."
            />
          ))}

        {tab === 'pontos' &&
          (pontos.length ? (
            pontos.map((ponto) => (
              <div
                key={ponto.id}
                className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[18px] font-bold text-[#414141]">{ponto.titulo}</p>
                    <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#941c1c]/40">
                      {ponto.categoria} | {getTerreiroName(ponto.terreiroId)}
                    </p>
                    <p className="mt-2 text-[13px] font-medium leading-relaxed text-[#414141]/60">
                      {ponto.descricao}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openPontoModal(ponto)} className={iconButtonClass}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(() => deletePonto(ponto.id), 'Deseja excluir este ponto?')}
                      className={iconButtonClass}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyStateCard
              icon={<Play className="h-8 w-8 text-[#941c1c]/20" />}
              title="Nenhum ponto cadastrado"
              description="Monte a biblioteca com links, letras e fundamentos por terreiro."
            />
          ))}
      </div>

      <SheetModal
        isOpen={showTerreiroModal}
        title={editingTerreiroId ? 'Editar Terreiro' : 'Novo Terreiro'}
        subtitle="Cadastro estrutural da casa"
        onClose={() => setShowTerreiroModal(false)}
      >
        <form onSubmit={handleSaveTerreiro} className="space-y-6">
          {formError ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-[#941c1c]/10 bg-white px-5 py-4 text-[#941c1c]">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-[13px] font-semibold leading-relaxed">{formError}</p>
            </div>
          ) : null}
          <div>
            <label className={labelClass}>Nome</label>
            <input
              required
              value={terreiroForm.nome}
              onChange={(event) => setTerreiroForm({ ...terreiroForm, nome: event.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cidade</label>
              <input
                required
                value={terreiroForm.cidade}
                onChange={(event) => setTerreiroForm({ ...terreiroForm, cidade: event.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <input
                required
                value={terreiroForm.estado}
                onChange={(event) => setTerreiroForm({ ...terreiroForm, estado: event.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Dirigente</label>
              <input
                required
                value={terreiroForm.dirigente}
                onChange={(event) => setTerreiroForm({ ...terreiroForm, dirigente: event.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Contato</label>
              <input
                required
                value={terreiroForm.contato}
                onChange={(event) => setTerreiroForm({ ...terreiroForm, contato: event.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="rounded-[28px] border border-[#941c1c]/10 bg-[#fef7e7] px-5 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#941c1c]/40">Acesso do terreiro</p>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-[#414141]/60">
              Essas credenciais serão usadas pelo administrador deste terreiro para acessar apenas os próprios dados.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4">
              <div>
                <label className={labelClass}>E-mail de acesso</label>
                <input
                  required
                  type="email"
                  value={terreiroForm.accessEmail}
                  onChange={(event) => setTerreiroForm({ ...terreiroForm, accessEmail: event.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Senha de acesso</label>
                <input
                  required
                  type="password"
                  value={terreiroForm.accessPassword}
                  onChange={(event) => setTerreiroForm({ ...terreiroForm, accessPassword: event.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Observações</label>
            <textarea
              value={terreiroForm.observacoes}
              onChange={(event) => setTerreiroForm({ ...terreiroForm, observacoes: event.target.value })}
              rows={4}
              className={textareaClass}
            />
          </div>
          <label className="flex items-center gap-3 rounded-[24px] bg-white px-5 py-4 text-[#414141]">
            <input
              type="checkbox"
              checked={terreiroForm.ativo}
              onChange={(event) => setTerreiroForm({ ...terreiroForm, ativo: event.target.checked })}
            />
            <span className="text-[13px] font-bold">Terreiro ativo no sistema</span>
          </label>
          <button
            type="submit"
            className="w-full rounded-[28px] bg-[#941c1c] py-6 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-[#941c1c]/20"
          >
            {editingTerreiroId ? 'SALVAR TERREIRO' : 'CRIAR TERREIRO'}
          </button>
        </form>
      </SheetModal>

      <SheetModal
        isOpen={showUserModal}
        title={editingUserId ? 'Editar Usuário' : 'Novo Usuário'}
        subtitle="Controle de acesso"
        onClose={() => setShowUserModal(false)}
      >
        <form onSubmit={handleSaveUser} className="space-y-6">
          {formError ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-[#941c1c]/10 bg-white px-5 py-4 text-[#941c1c]">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-[13px] font-semibold leading-relaxed">{formError}</p>
            </div>
          ) : null}
          <div>
            <label className={labelClass}>Nome completo</label>
            <input
              required
              value={userForm.nome}
              onChange={(event) => setUserForm({ ...userForm, nome: event.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>E-mail</label>
              <input
                required
                type="email"
                value={userForm.email}
                onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input
                required
                value={userForm.telefone}
                onChange={(event) => setUserForm({ ...userForm, telefone: event.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Perfil</label>
              <select
                value={userForm.role}
                onChange={(event) => setUserForm({ ...userForm, role: event.target.value as UserRole })}
                className={selectClass}
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={userForm.status}
                onChange={(event) => setUserForm({ ...userForm, status: event.target.value as UserStatus })}
                className={selectClass}
              >
                {USER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Terreiro</label>
            <select
              value={userForm.terreiroId}
              onChange={(event) => setUserForm({ ...userForm, terreiroId: event.target.value })}
              className={selectClass}
            >
              {terreiros.map((terreiro) => (
                <option key={terreiro.id} value={terreiro.id}>
                  {terreiro.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-[28px] border border-[#941c1c]/10 bg-[#fef7e7] px-5 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#941c1c]/40">Acesso ao sistema</p>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-[#414141]/60">
              Admin do terreiro gerencia usuários, eventos e pontos. Usuário comum acessa apenas os conteúdos do terreiro.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo de acesso</label>
                <select
                  value={userForm.accessRole}
                  onChange={(event) =>
                    setUserForm({ ...userForm, accessRole: event.target.value as TerreiroAccessRole })
                  }
                  className={selectClass}
                >
                  {TERREIRO_ACCESS_ROLES.map((accessRole) => (
                    <option key={accessRole} value={accessRole}>
                      {getAccessRoleLabel(accessRole)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Senha de acesso</label>
                <input
                  required
                  type="password"
                  value={userForm.accessPassword}
                  onChange={(event) => setUserForm({ ...userForm, accessPassword: event.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-[28px] bg-[#941c1c] py-6 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-[#941c1c]/20"
          >
            {editingUserId ? 'SALVAR USUÁRIO' : 'CRIAR USUÁRIO'}
          </button>
        </form>
      </SheetModal>

      <SheetModal
        isOpen={showEventModal}
        title={editingEventId ? 'Editar Evento' : 'Novo Evento'}
        subtitle="Agenda central"
        onClose={() => setShowEventModal(false)}
      >
        <form onSubmit={handleSaveEvent} className="space-y-6">
          <div>
            <label className={labelClass}>Título</label>
            <input
              required
              value={eventForm.title}
              onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Data</label>
              <input
                required
                type="date"
                value={eventForm.date}
                onChange={(event) => setEventForm({ ...eventForm, date: event.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Horário</label>
              <input
                required
                type="time"
                value={eventForm.time}
                onChange={(event) => setEventForm({ ...eventForm, time: event.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo</label>
              <select
                value={eventForm.type}
                onChange={(event) => setEventForm({ ...eventForm, type: event.target.value as EventType })}
                className={selectClass}
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Categoria</label>
              <select
                value={eventForm.category}
                onChange={(event) => setEventForm({ ...eventForm, category: event.target.value as EventCategory })}
                className={selectClass}
              >
                {EVENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Local</label>
            <input
              required
              value={eventForm.location}
              onChange={(event) => setEventForm({ ...eventForm, location: event.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Terreiro</label>
            <select
              value={eventForm.terreiroId}
              onChange={(event) => setEventForm({ ...eventForm, terreiroId: event.target.value })}
              className={selectClass}
            >
              {terreiros.map((terreiro) => (
                <option key={terreiro.id} value={terreiro.id}>
                  {terreiro.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Descrição</label>
            <textarea
              value={eventForm.description}
              onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })}
              rows={4}
              className={textareaClass}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-[28px] bg-[#941c1c] py-6 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-[#941c1c]/20"
          >
            {editingEventId ? 'SALVAR EVENTO' : 'CRIAR EVENTO'}
          </button>
        </form>
      </SheetModal>

      <SheetModal
        isOpen={showPontoModal}
        title={editingPontoId ? 'Editar Ponto' : 'Novo Ponto'}
        subtitle="Biblioteca de fundamentos"
        onClose={() => setShowPontoModal(false)}
      >
        <form onSubmit={handleSavePonto} className="space-y-6">
          {formError ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-[#941c1c]/10 bg-white px-5 py-4 text-[#941c1c]">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-[13px] font-semibold leading-relaxed">{formError}</p>
            </div>
          ) : null}
          <div>
            <label className={labelClass}>Título</label>
            <input
              required
              value={pontoForm.titulo}
              onChange={(event) => setPontoForm({ ...pontoForm, titulo: event.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Categoria</label>
              <select
                value={pontoForm.categoria}
                onChange={(event) => setPontoForm({ ...pontoForm, categoria: event.target.value as PontoCategory })}
                className={selectClass}
              >
                {PONTO_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Terreiro</label>
              <select
                value={pontoForm.terreiroId}
                onChange={(event) => setPontoForm({ ...pontoForm, terreiroId: event.target.value })}
                className={selectClass}
              >
                {terreiros.map((terreiro) => (
                  <option key={terreiro.id} value={terreiro.id}>
                    {terreiro.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Link do YouTube</label>
            <input
              required
              value={pontoForm.youtubeUrl}
              onChange={(event) => setPontoForm({ ...pontoForm, youtubeUrl: event.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Descrição</label>
            <textarea
              required
              value={pontoForm.descricao}
              onChange={(event) => setPontoForm({ ...pontoForm, descricao: event.target.value })}
              rows={3}
              className={textareaClass}
            />
          </div>
          <div>
            <label className={labelClass}>Letra</label>
            <textarea
              value={pontoForm.letra}
              onChange={(event) => setPontoForm({ ...pontoForm, letra: event.target.value })}
              rows={4}
              className={textareaClass}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-[28px] bg-[#941c1c] py-6 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-[#941c1c]/20"
          >
            {editingPontoId ? 'SALVAR PONTO' : 'CRIAR PONTO'}
          </button>
        </form>
      </SheetModal>
    </motion.div>
  );
}
