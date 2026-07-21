import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  CalendarDays,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  ArrowLeft,
  Check,
  X,
  Clock3,
  ImagePlus,
  Upload,
  UserPlus,
} from 'lucide-react';
import EmptyStateCard from '../components/EmptyStateCard';
import SheetModal from '../components/SheetModal';
import { useAppData } from '../context/AppDataContext';
import { formatDateInputValue, sortEvents, parseLocalDate } from '../lib/date';
import { createId } from '../lib/id';
import { supabase } from '../lib/supabase';
import {
  AppUser,
  EVENT_CATEGORIES,
  EVENT_TYPES,
  EventCategory,
  EventType,
  TERREIRO_ACCESS_ROLES,
  Terreiro,
  TerreiroEvent,
  TerreiroAccessRole,
  USER_ROLES,
  USER_STATUSES,
  UserRole,
  UserStatus,
} from '../types';

type AdminTab = 'terreiros' | 'usuarios' | 'eventos' | 'solicitacoes' | 'publicacoes';

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



const inputClass =
  'w-full rounded-[25px] border border-white bg-white px-6 py-4 font-bold text-[#414141] focus:outline-none focus:ring-2 focus:ring-[#1565c0]/10';
const selectClass =
  'w-full appearance-none rounded-[25px] border border-white bg-white px-6 py-4 font-bold text-[#414141] focus:outline-none focus:ring-2 focus:ring-[#1565c0]/10';
const textareaClass =
  'w-full resize-none rounded-[25px] border border-white bg-white px-6 py-4 font-bold text-[#414141] focus:outline-none focus:ring-2 focus:ring-[#1565c0]/10';
const labelClass =
  'mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#1565c0]/40';
const iconButtonClass = 'flex h-10 w-10 items-center justify-center rounded-full bg-[#e3f2fd] text-[#1565c0]';

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



export default function CadastrosView({ onBack }: { onBack: () => void }) {
  const {
    terreiros,
    accounts,
    users,
    events,
    currentAccount,
    isGlobalAdmin,
    deleteTerreiro,
    deleteAccount,
    saveEvent,
    deleteEvent,
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
  const [membershipRequests, setMembershipRequests] = useState<any[]>([]);
  const [postCaption, setPostCaption] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDescription, setStoryDescription] = useState('');
  const [uploading, setUploading] = useState(false);



  const firstTerreiroId = terreiros[0]?.id ?? '';
  const orderedEvents = sortEvents(events);

  async function loadMembershipRequests() {
    const { data } = await supabase.from('membership_requests')
      .select('*, requester:accounts!membership_requests_account_id_fkey(nome,email,username), terreiros(nome)')
      .order('created_at', { ascending:false });
    setMembershipRequests(data || []);
  }

  useEffect(() => { void loadMembershipRequests(); }, []);

  async function reviewMembership(id: string, approve: boolean) {
    const { error } = await supabase.rpc('review_membership_request', { target_request:id, approve_request:approve });
    if (error) { setPageMessage(error.message); return; }
    setPageMessage(approve ? 'Solicitação aprovada. A conta existente foi vinculada ao terreiro.' : 'Solicitação recusada.');
    await loadMembershipRequests();
  }

  async function uploadImage(bucket: 'posts'|'stories'|'terreiros', file: File, terreiroId: string) {
    if (!file.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem.');
    if (file.size > 5*1024*1024) throw new Error('A imagem deve ter no máximo 5 MB.');
    const ext=file.name.split('.').pop()?.toLowerCase()||'webp';
    const path=`${terreiroId}/${crypto.randomUUID()}.${ext}`;
    const { error }=await supabase.storage.from(bucket).upload(path,file,{contentType:file.type,upsert:false});
    if(error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async function publishPost(file: File) {
    const terreiroId=currentAccount?.terreiroId || firstTerreiroId;
    if(!terreiroId||!currentAccount) return;
    setUploading(true);
    try { const imageUrl=await uploadImage('posts',file,terreiroId); const {error}=await supabase.from('posts').insert({
      id:createId('post'),terreiro_id:terreiroId,author_account_id:currentAccount.id,caption:postCaption.trim(),
      location:postLocation.trim(),image_url:imageUrl,visibility:'public'
    }); if(error)throw error; setPostCaption('');setPostLocation('');setPageMessage('Publicação enviada para o Feed Ilê.'); }
    catch(error:any){setPageMessage(error.message)} finally{setUploading(false)}
  }

  async function publishStory(file: File) {
    const terreiroId=currentAccount?.terreiroId || firstTerreiroId;
    if(!terreiroId||!currentAccount) return;
    setUploading(true);
    try { const mediaUrl=await uploadImage('stories',file,terreiroId); const {error}=await supabase.from('stories').insert({
      id:createId('story'),terreiro_id:terreiroId,author_account_id:currentAccount.id,title:storyTitle.trim(),
      activity_description:storyDescription.trim(),media_url:mediaUrl,expires_at:new Date(Date.now()+24*60*60*1000).toISOString()
    }); if(error)throw error;setStoryTitle('');setStoryDescription('');setPageMessage('Story publicado por 24 horas.'); }
    catch(error:any){setPageMessage(error.message)} finally{setUploading(false)}
  }

  async function uploadTerreiroLogo(file: File) {
    const terreiroId=currentAccount?.terreiroId || firstTerreiroId;if(!terreiroId)return;
    setUploading(true);try{const logoUrl=await uploadImage('terreiros',file,terreiroId);const{error}=await supabase.from('terreiros').update({logo_url:logoUrl}).eq('id',terreiroId);if(error)throw error;setPageMessage('Imagem do terreiro atualizada.');}
    catch(error:any){setPageMessage(error.message)}finally{setUploading(false)}
  }

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



  function handleDeleteTerreiro(terreiroId: string) {
    clearMessages();
    const links = getTerreiroLinks(terreiroId);
    const terreiro = terreiros.find((currentTerreiro) => currentTerreiro.id === terreiroId) ?? null;

    if (terreiros.length <= 1) {
      setPageMessage('Mantenha ao menos um terreiro cadastrado.');
      return;
    }

    if (links.users || links.events) {
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

    handleDelete(async () => {
      const { error } = await supabase.rpc('admin_delete_member', { member_id: user.id });
      if (error) { setPageMessage(error.message); return; }
      window.location.reload();
    }, 'Deseja excluir este usuário?');
  }

  async function handleSaveTerreiro(event: React.FormEvent<HTMLFormElement>) {
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

    const currentTerreiro = terreiros.find((t) => t.id === editingTerreiroId);
    const { error: saveError } = await supabase.rpc('global_save_terreiro', {
      target_id: editingTerreiroId, terreiro_nome: terreiroForm.nome.trim(), terreiro_sigla: currentTerreiro?.sigla || '',
      terreiro_cidade: terreiroForm.cidade.trim(), terreiro_estado: terreiroForm.estado.trim(),
      terreiro_dirigente: terreiroForm.dirigente.trim(), terreiro_contato: terreiroForm.contato.trim(),
      terreiro_observacoes: terreiroForm.observacoes.trim(), terreiro_ativo: terreiroForm.ativo,
      terreiro_cor: currentTerreiro?.corTema || '#BF2429', access_email: normalizedEmail,
      access_password: terreiroForm.accessPassword.trim(),
    });
    if (saveError) { setFormError(saveError.message); return; }

    setFormError(null);
    setShowTerreiroModal(false);
    window.location.reload();
  }

  async function handleSaveUser(event: React.FormEvent<HTMLFormElement>) {
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

    const { error: saveError } = await supabase.rpc('admin_save_member', {
      member_id: editingUserId, account_uuid: existingAccount?.id || null, member_name: userForm.nome.trim(),
      member_email: normalizedEmail, member_phone: userForm.telefone.trim(), member_role: userForm.role,
      member_status: userForm.status, target_terreiro: userForm.terreiroId, access_role: userForm.accessRole,
      access_password: userForm.accessPassword.trim(),
    });
    if (saveError) { setFormError(saveError.message); return; }

    setFormError(null);
    setShowUserModal(false);
    window.location.reload();
  }

  function handleSaveEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    saveEvent({
      id: editingEventId ?? createId('event'),
      date: parseLocalDate(eventForm.date),
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



  const stats = [
    { id: 'terreiros', title: 'Terreiros', value: terreiros.length },
    { id: 'usuarios', title: 'Usuários', value: users.length },
    { id: 'eventos', title: 'Eventos', value: events.length },
  ];

  const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: 'terreiros', label: 'Terreiros' },
    { id: 'usuarios', label: 'Usuários' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'solicitacoes', label: 'Solicitações' },
    { id: 'publicacoes', label: 'Publicações' },
  ];

  return (
    <motion.div
      key="cadastros"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="px-6 pb-32 pt-12"
    >
      {/* Back button row */}
      <div className="mb-6 flex items-center">
        <button 
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,0.08),_0_2px_6px_rgba(0,0,0,0.04)] border border-zinc-100 text-zinc-800 active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </div>

      <div className="rounded-[45px] border border-white/40 bg-white/60 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-behind uppercase tracking-[0.2em] text-[#414141]/50">ADMINISTRAÇÃO</p>
            <h1 className="mt-1 text-[44px] font-behind leading-tight" style={{ color: 'var(--theme-color, #BF2429)' }}>Cadastros</h1>
            <p className="mt-3 max-w-[240px] text-[13px] font-medium leading-relaxed text-[#414141]/50">
              Estruture usuários, terreiros e agenda em uma base pronta para backend.
            </p>
            <div className="mt-4 inline-flex rounded-full bg-black/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#414141]/60">
              {isGlobalAdmin ? 'Admin geral' : 'Admin do terreiro'} · {currentAccount?.email}
            </div>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] text-white shadow-lg" style={{ backgroundColor: 'var(--theme-color, #BF2429)' }}>
            <ShieldCheck className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.id}
            type="button"
            onClick={() => setTab(stat.id as AdminTab)}
            className="rounded-[28px] bg-white px-5 py-5 text-left shadow-[0_6px_15px_rgba(0,0,0,0.02)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--theme-color, #BF2429)', opacity: 0.6 }}>{stat.title}</p>
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
            className="whitespace-nowrap rounded-[20px] px-7 py-4 text-[11px] font-black shadow-sm transition-all duration-300"
            style={
              tab === currentTab.id
                ? { backgroundColor: 'var(--theme-color, #BF2429)', color: '#ffffff' }
                : { backgroundColor: '#ffffff', color: 'var(--theme-color, #BF2429)', border: '1px solid rgba(var(--theme-color-rgb, 191, 36, 41), 0.15)' }
            }
          >
            {currentTab.label}
          </button>
        ))}
      </div>

      {pageMessage ? (
        <div className="mt-6 flex items-start gap-3 rounded-[28px] border border-[#1565c0]/10 bg-white px-5 py-4 text-[#1565c0]">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p className="text-[13px] font-semibold leading-relaxed">{pageMessage}</p>
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        <div className="flex items-end justify-between px-2">
          <div>
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1565c0] opacity-30">
              {tab === 'terreiros'
                ? 'Gestão de Casas'
                : tab === 'usuarios'
                  ? 'Gestão de Acesso'
                  : tab === 'eventos' ? 'Agenda Operacional' : tab === 'solicitacoes' ? 'Entrada de Membros' : 'Conteúdo do Hub'}
            </h3>
            <p className="text-2xl font-bold tracking-tight text-[#414141]">
              {tab === 'terreiros'
                ? 'Terreiros Cadastrados'
                : tab === 'usuarios'
                  ? 'Usuários do Sistema'
                  : tab === 'eventos' ? 'Eventos do Sistema' : tab === 'solicitacoes' ? 'Solicitações de Participação' : 'Publicar no Feed'}
            </p>
            {tab === 'terreiros' && !isGlobalAdmin ? (
              <p className="mt-2 text-[12px] font-semibold text-[#1565c0]/45">
                A criação e edição de terreiros é exclusiva do admin geral.
              </p>
            ) : null}
          </div>
          {tab !== 'solicitacoes' && tab !== 'publicacoes' && <button
            type="button"
            onClick={() =>
              tab === 'terreiros'
                ? openTerreiroModal()
                : tab === 'usuarios'
                  ? openUserModal()
                  : openEventModal()
            }
            disabled={tab === 'terreiros' && !isGlobalAdmin}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1565c0] text-white shadow-xl shadow-[#1565c0]/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-6 w-6" />
          </button>}
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
                      <p className="mt-2 text-[12px] font-semibold text-[#1565c0]/40">
                        {links.users} usuários, {links.events} eventos
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
                    <p className="mt-2 text-[12px] font-semibold text-[#1565c0]/45">
                      Acesso: {accounts.find((account) => account.id === terreiro.accessAccountId)?.email ?? 'Não definido'}
                    </p>
                  ) : null}
                </div>
              );
            })
          ) : (
            <EmptyStateCard
              icon={<Building2 className="h-8 w-8 text-[#1565c0]/20" />}
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
                      <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1565c0]/40">
                        {user.role} | {user.status}
                      </p>
                      <p className="mt-2 text-[13px] font-medium text-[#414141]/60">{user.email}</p>
                      <p className="mt-1 text-[13px] font-medium text-[#414141]/60">
                        {getTerreiroName(user.terreiroId)}
                      </p>
                      <p className="mt-2 text-[12px] font-semibold text-[#1565c0]/45">
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
              icon={<Users className="h-8 w-8 text-[#1565c0]/20" />}
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
              icon={<CalendarDays className="h-8 w-8 text-[#1565c0]/20" />}
              title="Nenhum evento cadastrado"
              description="Monte a agenda com datas, horários, locais e vínculos com os terreiros."
            />
          ))}

        {tab === 'solicitacoes' && (
          membershipRequests.length ? membershipRequests.map((request) => (
            <div key={request.id} className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-[#414141]">{request.requester?.nome || request.requester?.username}</p>
                  <p className="mt-1 text-sm text-[#414141]/55">{request.requester?.email}</p>
                  <p className="mt-3 text-[11px] font-black uppercase tracking-wider text-[#1565c0]/60">{request.request_type === 'invite_code' ? 'Usou código de convite' : 'Encontrou pelo Hub'} · {request.terreiros?.nome}</p>
                  {request.message && <p className="mt-3 text-sm text-[#414141]/70">{request.message}</p>}
                  <div className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase ${request.status==='pending'?'bg-amber-100 text-amber-700':request.status==='approved'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>
                    <Clock3 className="h-3 w-3" /> {request.status==='pending'?'Aguardando aprovação':request.status==='approved'?'Aprovado':'Recusado'}
                  </div>
                </div>
                {request.status==='pending' && <div className="flex gap-2">
                  <button onClick={() => void reviewMembership(request.id,true)} className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-5 w-5" /></button>
                  <button onClick={() => void reviewMembership(request.id,false)} className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-700"><X className="h-5 w-5" /></button>
                </div>}
              </div>
            </div>
          )) : <EmptyStateCard icon={<UserPlus className="h-8 w-8 text-[#1565c0]/20" />} title="Nenhuma solicitação" description="Novos pedidos feitos pelo Hub ou por código aparecerão aqui." />
        )}

        {tab === 'publicacoes' && (
          <div className="space-y-5">
            <div className="rounded-[32px] bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3"><ImagePlus className="h-6 w-6 text-[#1565c0]"/><div><h4 className="font-black text-[#414141]">Nova publicação</h4><p className="text-xs text-[#414141]/50">A imagem será salva no bucket posts.</p></div></div>
              <textarea value={postCaption} onChange={(e)=>setPostCaption(e.target.value)} placeholder="Legenda da publicação" rows={4} className={textareaClass}/>
              <input value={postLocation} onChange={(e)=>setPostLocation(e.target.value)} placeholder="Localização" className={inputClass}/>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#1565c0] py-4 text-xs font-black uppercase text-white"><Upload className="h-4 w-4"/>{uploading?'Enviando...':'Selecionar imagem e publicar'}<input disabled={uploading||!postCaption.trim()} type="file" accept="image/*" className="hidden" onChange={(e)=>{const f=e.target.files?.[0];if(f)void publishPost(f);e.target.value=''}}/></label>
            </div>
            <div className="rounded-[32px] bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3"><Clock3 className="h-6 w-6 text-[#1565c0]"/><div><h4 className="font-black text-[#414141]">Novo story</h4><p className="text-xs text-[#414141]/50">Ficará disponível por 24 horas.</p></div></div>
              <input value={storyTitle} onChange={(e)=>setStoryTitle(e.target.value)} placeholder="Título" className={inputClass}/>
              <textarea value={storyDescription} onChange={(e)=>setStoryDescription(e.target.value)} placeholder="Descrição" rows={3} className={textareaClass}/>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#1565c0] py-4 text-xs font-black uppercase text-white"><Upload className="h-4 w-4"/>{uploading?'Enviando...':'Selecionar imagem e publicar'}<input disabled={uploading||!storyTitle.trim()} type="file" accept="image/*" className="hidden" onChange={(e)=>{const f=e.target.files?.[0];if(f)void publishStory(f);e.target.value=''}}/></label>
            </div>
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <h4 className="font-black text-[#414141]">Imagem do terreiro</h4><p className="mb-4 mt-1 text-xs text-[#414141]/50">Atualiza a imagem exibida no Feed e nos stories.</p>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#1565c0]/20 py-4 text-xs font-black uppercase text-[#1565c0]"><Upload className="h-4 w-4"/>Enviar imagem<input disabled={uploading} type="file" accept="image/*" className="hidden" onChange={(e)=>{const f=e.target.files?.[0];if(f)void uploadTerreiroLogo(f);e.target.value=''}}/></label>
            </div>
          </div>
        )}


      </div>

      <SheetModal
        isOpen={showTerreiroModal}
        title={editingTerreiroId ? 'Editar Terreiro' : 'Novo Terreiro'}
        subtitle="Cadastro estrutural da casa"
        onClose={() => setShowTerreiroModal(false)}
      >
        <form onSubmit={handleSaveTerreiro} className="space-y-6">
          {formError ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-[#1565c0]/10 bg-white px-5 py-4 text-[#1565c0]">
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
          <div className="rounded-[28px] border border-[#1565c0]/10 bg-[#e3f2fd] px-5 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1565c0]/40">Acesso do terreiro</p>
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
            className="w-full rounded-[28px] py-6 text-sm font-black uppercase tracking-[0.2em] text-white active:scale-[0.97] transition-transform duration-150 ease-out"
            style={{
              background: 'linear-gradient(180deg, #7DD3FC 0%, #38BDF8 40%, #0EA5E9 100%)',
              border: '1.5px solid rgba(255,255,255,0.5)',
              boxShadow: '0 4px 15px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.08)',
            }}
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
            <div className="flex items-start gap-3 rounded-[24px] border border-[#1565c0]/10 bg-white px-5 py-4 text-[#1565c0]">
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
          <div className="rounded-[28px] border border-[#1565c0]/10 bg-[#e3f2fd] px-5 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1565c0]/40">Acesso ao sistema</p>
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
            className="w-full rounded-[28px] py-6 text-sm font-black uppercase tracking-[0.2em] text-white active:scale-[0.97] transition-transform duration-150 ease-out"
            style={{
              background: 'linear-gradient(180deg, #7DD3FC 0%, #38BDF8 40%, #0EA5E9 100%)',
              border: '1.5px solid rgba(255,255,255,0.5)',
              boxShadow: '0 4px 15px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.08)',
            }}
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
                {EVENT_TYPES.map((type: string) => (
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
                {EVENT_CATEGORIES.map((category: string) => (
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
            className="w-full rounded-[28px] py-6 text-sm font-black uppercase tracking-[0.2em] text-white active:scale-[0.97] transition-transform duration-150 ease-out"
            style={{
              background: 'linear-gradient(180deg, #7DD3FC 0%, #38BDF8 40%, #0EA5E9 100%)',
              border: '1.5px solid rgba(255,255,255,0.5)',
              boxShadow: '0 4px 15px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.08)',
            }}
          >
            {editingEventId ? 'SALVAR EVENTO' : 'CRIAR EVENTO'}
          </button>
        </form>
      </SheetModal>

    </motion.div>
  );
}
