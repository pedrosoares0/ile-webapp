import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Menu, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Download, 
  QrCode, 
  Copy, 
  Check, 
  BellRing, 
  Users, 
  FileText,
  X,
  BarChart3,
  Zap
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  descricao: string;
  categoria: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  data: string;
  status: 'pago' | 'pendente';
  responsavel?: string;
}

interface Inadimplente {
  id: string;
  nome: string;
  cargo: string;
  foto?: string;
  mesesAtraso: number;
  valorTotal: number;
  ultimoPagamento: string;
  telefone?: string;
  email?: string;
}

interface FinanceiroViewProps {
  onBack: () => void;
  onToggleMenu: () => void;
}

export default function FinanceiroView({ onBack, onToggleMenu }: FinanceiroViewProps) {
  const { currentAccount, terreiros } = useAppData();
  const currentTerreiro = terreiros.find(t => t.id === currentAccount?.terreiroId)
    || (currentAccount?.role === 'global_admin' ? terreiros[0] : undefined);
  const themeColor = currentTerreiro?.corTema || '#BF2429';

  // Navigation tabs: 'dashboard' | 'entradas_saidas' | 'inadimplencia' | 'cobranca' | 'relatorios'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entradas_saidas' | 'inadimplencia' | 'cobranca' | 'relatorios'>('dashboard');

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inadimplentes, setInadimplentes] = useState<Inadimplente[]>([]);
  const [metaMensal, setMetaMensal] = useState(0);
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('Pix');
  const [chargeDay, setChargeDay] = useState(5);
  const [loadingFinance, setLoadingFinance] = useState(true);
  const [filterType, setFilterType] = useState<'todos' | 'entrada' | 'saida'>('todos');

  // Modal New Transaction
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newTipo, setNewTipo] = useState<'entrada' | 'saida'>('entrada');
  const [newValor, setNewValor] = useState('');
  const [newCategoria, setNewCategoria] = useState('Mensalidades');

  // Automatic Charge Modal / Toast state
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [selectedInadimplente, setSelectedInadimplente] = useState<Inadimplente | null>(null);
  const [chargeSuccessMessage, setChargeSuccessMessage] = useState<string | null>(null);
  const [autoChargeEnabled, setAutoChargeEnabled] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  // Month selector for reports
  const [selectedReportMonth, setSelectedReportMonth] = useState('Julho / 2026');

  // Financial Calculations
  const totalEntradas = useMemo(() => {
    return transactions
      .filter(t => t.tipo === 'entrada' && t.status === 'pago')
      .reduce((sum, t) => sum + t.valor, 0);
  }, [transactions]);

  const totalSaidas = useMemo(() => {
    return transactions
      .filter(t => t.tipo === 'saida')
      .reduce((sum, t) => sum + t.valor, 0);
  }, [transactions]);

  const saldoEmCaixa = totalEntradas - totalSaidas;

  const totalEmAtraso = useMemo(() => inadimplentes.reduce((sum, i) => sum + i.valorTotal, 0), [inadimplentes]);
  const percentualMeta = metaMensal > 0 ? Math.min(Math.round((totalEntradas / metaMensal) * 100), 100) : 0;

  const receitasPorCategoria = useMemo(() => Object.entries(transactions
    .filter(t => t.tipo === 'entrada' && t.status === 'pago')
    .reduce<Record<string, number>>((acc, t) => ({ ...acc, [t.categoria]: (acc[t.categoria] || 0) + t.valor }), {}))
    .sort((a, b) => b[1] - a[1]), [transactions]);

  const loadFinance = useCallback(async () => {
    if (!currentTerreiro?.id) return;
    setLoadingFinance(true);
    const [settingsResult, transactionsResult, membersResult] = await Promise.all([
      supabase.from('financial_settings').select('*').eq('terreiro_id', currentTerreiro.id).maybeSingle(),
      supabase.from('financial_transactions').select('*').eq('terreiro_id', currentTerreiro.id).order('occurred_on', { ascending: false }),
      supabase.from('financial_members').select('*, financial_dues(*)').eq('terreiro_id', currentTerreiro.id).eq('active', true),
    ]);
    const error = settingsResult.error || transactionsResult.error || membersResult.error;
    if (error) {
      setChargeSuccessMessage(`Não foi possível carregar o financeiro: ${error.message}`);
      setLoadingFinance(false);
      return;
    }
    if (settingsResult.data) {
      setMetaMensal(Number(settingsResult.data.monthly_goal));
      setPixKey(settingsResult.data.pix_key || '');
      setPixKeyType(settingsResult.data.pix_key_type || 'Pix');
      setAutoChargeEnabled(settingsResult.data.auto_charge_enabled);
      setChargeDay(settingsResult.data.charge_day);
    }
    setTransactions((transactionsResult.data || []).map(row => ({
      id: row.id, descricao: row.description, categoria: row.category,
      tipo: row.transaction_type === 'income' ? 'entrada' : 'saida', valor: Number(row.amount),
      data: row.occurred_on, status: row.status === 'pending' ? 'pendente' : 'pago', responsavel: row.responsible || undefined,
    })));
    setInadimplentes((membersResult.data || []).map(member => {
      const pending = (member.financial_dues || []).filter((due: any) => due.status === 'pending');
      return {
        id: member.id, nome: member.name, cargo: member.role_label || 'Membro',
        mesesAtraso: pending.length, valorTotal: pending.reduce((sum: number, due: any) => sum + Number(due.amount), 0),
        ultimoPagamento: member.last_payment_on ? new Date(`${member.last_payment_on}T12:00:00`).toLocaleDateString('pt-BR') : 'Não informado',
        telefone: member.phone || undefined, email: member.email || undefined,
      };
    }).filter(member => member.mesesAtraso > 0));
    setLoadingFinance(false);
  }, [currentTerreiro?.id]);

  useEffect(() => { void loadFinance(); }, [loadFinance]);

  const filteredTransactions = useMemo(() => {
    if (filterType === 'todos') return transactions;
    return transactions.filter(t => t.tipo === filterType);
  }, [transactions, filterType]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newValor) return;

    const val = parseFloat(newValor.replace(',', '.'));
    if (isNaN(val)) return;

    if (!currentTerreiro?.id) return;
    const { error } = await supabase.from('financial_transactions').insert({
      terreiro_id: currentTerreiro.id, description: newDesc, category: newCategoria,
      transaction_type: newTipo === 'entrada' ? 'income' : 'expense', amount: val,
      occurred_on: new Date().toISOString().split('T')[0], status: 'paid',
      responsible: currentAccount?.nome || 'Administração', created_by: currentAccount?.id,
    });
    if (error) { setChargeSuccessMessage(`Erro ao salvar: ${error.message}`); return; }
    setShowAddModal(false);
    setNewDesc('');
    setNewValor('');
    await loadFinance();
  };

  const handleSendChargeNotification = async (inadimplente?: Inadimplente) => {
    if (!currentTerreiro?.id) return;
    const targets = inadimplente ? [inadimplente] : inadimplentes;
    const attempts = targets.map(item => ({
      terreiro_id: currentTerreiro.id, financial_member_id: item.id, channel: 'whatsapp',
      status: item.telefone ? 'opened' : 'registered', attempted_by: currentAccount?.id,
      message: `Olá, ${item.nome}. Consta uma pendência de R$ ${item.valorTotal.toFixed(2)}. Chave Pix: ${pixKey || 'não cadastrada'}.`,
    }));
    const { error } = await supabase.from('collection_attempts').insert(attempts);
    if (error) { setChargeSuccessMessage(`Erro ao registrar cobrança: ${error.message}`); return; }
    if (inadimplente?.telefone) {
      const phone = inadimplente.telefone.replace(/\D/g, '');
      window.open(`https://wa.me/${phone.startsWith('55') ? phone : `55${phone}`}?text=${encodeURIComponent(attempts[0].message)}`, '_blank', 'noopener,noreferrer');
    }
    const opened = targets.filter(item => item.telefone).length;
    setChargeSuccessMessage(`${targets.length} tentativa(s) registrada(s). ${opened ? 'WhatsApp aberto para o contato selecionado.' : 'Cadastre telefone(s) para abrir o WhatsApp.'}`);
    setShowChargeModal(false);
    setTimeout(() => {
      setChargeSuccessMessage(null);
    }, 4000);
  };

  const copyPixKey = () => {
    if (!pixKey) return;
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const toggleAutoCharge = async () => {
    if (!currentTerreiro?.id) return;
    const next = !autoChargeEnabled;
    const { error } = await supabase.from('financial_settings').update({ auto_charge_enabled: next, updated_at: new Date().toISOString() }).eq('terreiro_id', currentTerreiro.id);
    if (error) { setChargeSuccessMessage(`Erro ao atualizar: ${error.message}`); return; }
    setAutoChargeEnabled(next);
  };

  const exportCsv = () => {
    const rows = [['Data','Descrição','Categoria','Tipo','Status','Valor','Responsável'], ...transactions.map(t => [t.data,t.descricao,t.categoria,t.tipo,t.status,t.valor.toFixed(2),t.responsavel || ''])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `financeiro-${currentTerreiro?.id || 'terreiro'}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[100dvh] bg-[#ECECEE] px-4 sm:px-6 safe-pt-view pb-36 relative overflow-x-hidden z-10 font-sans text-zinc-900 selection:bg-zinc-200">
      
      {/* Soft Ambient Depth Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 select-none opacity-40">
        <div 
          className="absolute w-[90vw] h-[90vw] rounded-full blur-[100px] -top-[30%] -left-[20%]" 
          style={{ background: `radial-gradient(circle, ${themeColor}33 0%, transparent 70%)` }}
        />
      </div>

      {/* Header with Standard Italic Font (font-behind-it) */}
      <div className="relative flex items-center justify-between h-14 w-full z-10 mb-5">
        <button 
          onClick={onBack}
          className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/[0.04] text-zinc-800 active:scale-95 transition-all"
        >
          <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.2} />
        </button>
        
        <div className="w-full text-center px-12">
          <h1 className="text-2xl font-black leading-none font-behind-it tracking-tight" style={{ color: themeColor }}>
            Financeiro
          </h1>
          <p className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-[0.25em] mt-2 leading-none">
            Gestão do Terreiro
          </p>
        </div>

        <button 
          onClick={onToggleMenu}
          className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/[0.04] text-zinc-800 active:scale-95 transition-all"
        >
          <Menu className="h-4.5 w-4.5" strokeWidth={2.2} />
        </button>
      </div>

      {/* Charge Success Alert Banner */}
      <AnimatePresence>
        {chargeSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-20 mb-4 p-4 rounded-[22px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 flex items-center gap-3 shadow-xs"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-xs font-semibold leading-relaxed">{chargeSuccessMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {loadingFinance && <p className="relative z-10 mb-4 text-center text-xs font-bold text-zinc-500">Carregando dados financeiros...</p>}

      {/* Navigation Segmented Pill Bar */}
      <div className="relative z-10 flex gap-1.5 overflow-x-auto touch-pan-x cursor-grab active:cursor-grabbing select-none no-scrollbar p-1.5 mb-5 rounded-full bg-white/80 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] backdrop-blur-xl snap-x">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'entradas_saidas', label: 'Extrato', icon: DollarSign },
          { id: 'inadimplencia', label: 'Inadimplência', badge: inadimplentes.length, icon: Users },
          { id: 'cobranca', label: 'Cobrança', icon: BellRing },
          { id: 'relatorios', label: 'Relatórios', icon: FileText },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 snap-start ${
                isActive 
                  ? 'text-zinc-900 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-600'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4 relative z-10">

          {/* CARD 1: RECEITAS DE JULHO & TOOLBAR COM LABELS */}
          <div className="rounded-[28px] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-black/[0.04] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-400 tracking-tight">Receitas de Julho</span>
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight mt-0.5 font-mono">
                  R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </h2>
              </div>

              {/* Dashed Circular Gauge Ring */}
              <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 40 40">
                  <circle
                    cx="20" cy="20" r="15.5"
                    className="text-zinc-100"
                    strokeWidth="3"
                    stroke="currentColor"
                    strokeDasharray="2, 2"
                    fill="none"
                  />
                  <circle
                    cx="20" cy="20" r="15.5"
                    stroke={themeColor}
                    strokeWidth="3.2"
                    strokeDasharray={`${percentualMeta * 0.97}, 100`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-black text-zinc-900 font-mono leading-none">{percentualMeta}%</span>
                  <span className="text-[7.5px] font-extrabold text-zinc-400 uppercase mt-0.5">meta</span>
                </div>
              </div>
            </div>

            {/* Simplified & Clean 3 Category Revenue Breakdown Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {receitasPorCategoria.slice(0, 3).map(([categoria, valor]) => (
                <div key={categoria} className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 block truncate">{categoria}</span>
                  <p className="text-sm font-black text-indigo-600 font-mono">R$ {valor.toLocaleString('pt-BR')}</p>
                  <span className="text-[9px] font-bold text-zinc-400">{totalEntradas ? Math.round(valor / totalEntradas * 100) : 0}% do total</span>
                </div>
              ))}
              {!receitasPorCategoria.length && <p className="col-span-3 p-3 text-center text-xs text-zinc-400">Nenhuma receita registrada.</p>}
            </div>

            {/* Toolbar with Clear Text Labels below icons */}
            <div className="grid grid-cols-5 gap-1 pt-3 border-t border-zinc-100 text-zinc-500">
              <button onClick={() => setShowAddModal(true)} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-100 hover:text-zinc-900 transition-colors group">
                <Plus className="h-4.5 w-4.5 mb-1 text-zinc-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9.5px] font-bold">Lançar</span>
              </button>
              <button onClick={exportCsv} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-100 hover:text-zinc-900 transition-colors group">
                <Download className="h-4.5 w-4.5 mb-1 text-zinc-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9.5px] font-bold">Exportar</span>
              </button>
              <button onClick={copyPixKey} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-100 hover:text-zinc-900 transition-colors group">
                <QrCode className="h-4.5 w-4.5 mb-1 text-zinc-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9.5px] font-bold">Pix</span>
              </button>
              <button onClick={() => setActiveTab('cobranca')} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-100 hover:text-zinc-900 transition-colors group">
                <Send className="h-4.5 w-4.5 mb-1 text-zinc-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9.5px] font-bold">Cobrar</span>
              </button>
              <button onClick={() => setActiveTab('entradas_saidas')} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-100 hover:text-zinc-900 transition-colors group">
                <DollarSign className="h-4.5 w-4.5 mb-1 text-zinc-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9.5px] font-bold">Extrato</span>
              </button>
            </div>
          </div>

          {/* CARD 2: SALDO LÍQUIDO EM CAIXA (Clean & Clear Format) */}
          <div className="rounded-[28px] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-black/[0.04] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-400">Saldo Líquido em Caixa</span>
                <h2 className={`text-3xl font-black tracking-tight mt-0.5 font-mono ${
                  saldoEmCaixa < 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  R$ {saldoEmCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h2>
              </div>

              <div className={`px-3 py-1.5 rounded-full text-xs font-extrabold font-mono flex items-center gap-1 ${
                saldoEmCaixa >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}>
                {saldoEmCaixa >= 0 ? '▲ Em Dia' : '▼ Saldo Negativo'}
              </div>
            </div>

            {/* Clean Progress Bar of Entradas vs Saídas */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs font-bold font-mono">
                <span className="text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> Entradas: +R$ {totalEntradas.toFixed(2)}
                </span>
                <span className="text-rose-600 flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5" /> Saídas: -R$ {totalSaidas.toFixed(2)}
                </span>
              </div>
              <div className="h-2.5 w-full bg-rose-100 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all" 
                  style={{ width: `${Math.min((totalEntradas / (totalEntradas + totalSaidas || 1)) * 100, 100)}%` }} 
                />
              </div>
            </div>
          </div>

          {/* 2 CLEAN CARDS: ADIMPLÊNCIA DOS FILHOS & META DE CAIXA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Card 1: Situação de Adimplência dos Filhos */}
            <div className="rounded-[28px] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-black/[0.04] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-zinc-900">Situação dos Filhos</h3>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {inadimplentes.length ? `${inadimplentes.length} pendência(s)` : 'Em dia'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3">
                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-700 block uppercase">Pagamentos em Dia</span>
                    <p className="text-base font-black text-emerald-950 font-mono mt-0.5">Dados por mensalidade</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-100">
                    <span className="text-[10px] font-bold text-rose-700 block uppercase">Em Atraso</span>
                    <p className="text-base font-black text-rose-950 font-mono mt-0.5">{inadimplentes.length} Filhos</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-2">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Total Pendente</span>
                  <p className="text-sm font-black text-rose-700 font-mono">
                    R$ {totalEmAtraso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('inadimplencia')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-white text-xs font-bold active:scale-95 transition-transform shadow-xs"
                  style={{ backgroundColor: themeColor }}
                >
                  <Send className="h-3 w-3" />
                  <span>Cobrar WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Card 2: Meta de Caixa Mensal Simplificada */}
            <div className="rounded-[28px] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-black/[0.04] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <h3 className="text-sm font-extrabold text-zinc-900">Meta de Caixa Mensal</h3>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                    {percentualMeta}% Meta
                  </span>
                </div>

                <div className="space-y-2 pt-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-500">Arrecadado este Mês</span>
                    <span className="text-zinc-900 font-mono">R$ {totalEntradas.toFixed(2)}</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percentualMeta}%`, backgroundColor: themeColor }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-zinc-400 pt-1">
                    <span>Meta: R$ {metaMensal.toFixed(2)}</span>
                    <span>Faltam: R$ {Math.max(metaMensal - totalEntradas, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-600 mt-2">
                <span>Movimentações registradas:</span>
                <span className="text-emerald-600 font-mono font-black">{transactions.length}</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: EXTRATO (ENTRADAS E SAÍDAS) */}
      {activeTab === 'entradas_saidas' && (
        <div className="space-y-4 relative z-10">
          {/* Filter Pills */}
          <div className="flex items-center justify-between bg-white p-2 rounded-[22px] border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex gap-1">
              {[
                { id: 'todos', label: 'Todas' },
                { id: 'entrada', label: 'Entradas' },
                { id: 'saida', label: 'Saídas' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterType === f.id ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 rounded-xl text-white active:scale-95 transition-transform"
              style={{ backgroundColor: themeColor }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Transactions List */}
          <div className="space-y-2">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-4 rounded-[22px] bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${tx.tipo === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {tx.tipo === 'entrada' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">{tx.descricao}</h4>
                    <p className="text-[10px] font-medium text-zinc-400 mt-0.5">
                      {tx.categoria} {tx.responsavel ? `• ${tx.responsavel}` : ''} • {tx.data}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-extrabold font-mono ${tx.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.tipo === 'entrada' ? '+' : '-'} R$ {tx.valor.toFixed(2)}
                  </span>
                  <div>
                    <span className={`inline-block text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${
                      tx.status === 'pago' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONTROLE DE INADIMPLÊNCIA */}
      {activeTab === 'inadimplencia' && (
        <div className="space-y-4 relative z-10">
          <div className="p-5 rounded-[28px] bg-amber-500/10 border border-amber-500/20 text-amber-900">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-5 w-5 text-amber-700" />
              <h3 className="text-sm font-bold tracking-tight">Filhos com Mensalidade em Atraso</h3>
            </div>
            <p className="text-xs font-medium text-amber-800/80 leading-relaxed">
              Dispare lembretes de cobrança via WhatsApp com Chave Pix em apenas um clique.
            </p>
          </div>

          <div className="space-y-2.5">
            {inadimplentes.map((item) => (
              <div key={item.id} className="p-4 rounded-[28px] bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 border border-amber-200 text-amber-800 font-bold flex items-center justify-center text-sm">
                      {item.nome.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">{item.nome}</h4>
                      <p className="text-[10px] font-medium text-zinc-400">{item.cargo} • Último pagto: {item.ultimoPagamento}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[9.5px] font-extrabold uppercase tracking-wider">
                    {item.mesesAtraso} {item.mesesAtraso === 1 ? 'Mês' : 'Meses'} em atraso
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-zinc-400">Total Devido</span>
                    <p className="text-base font-black text-rose-700 font-mono">
                      R$ {item.valorTotal.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedInadimplente(item);
                      setShowChargeModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Cobrar WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COBRANÇA AUTOMÁTICA */}
      {activeTab === 'cobranca' && (
        <div className="space-y-4 relative z-10">
          <div className="p-5 rounded-[28px] bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-black/5 text-zinc-800" style={{ color: themeColor }}>
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Lembrete de Cobrança Automático</h3>
                  <p className="text-[11px] font-medium text-zinc-400">Programado para o dia {String(chargeDay).padStart(2, '0')}</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={toggleAutoCharge}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${autoChargeEnabled ? 'bg-emerald-500' : 'bg-zinc-300'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${autoChargeEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs font-medium text-zinc-600 leading-relaxed">
              Esta opção salva a preferência no banco. O envio automático depende da configuração de um worker agendado e de um provedor oficial de mensagens.
            </div>

            <button
              onClick={() => handleSendChargeNotification()}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-transform"
              style={{ backgroundColor: themeColor }}
            >
              <Send className="h-4 w-4" />
              <span>Disparar Cobrança para Todos os Inadimplentes Agora</span>
            </button>
          </div>

          {/* Chave Pix Config Card */}
          <div className="p-5 rounded-[28px] bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                <QrCode className="h-4 w-4 text-zinc-400" />
                Chave Pix do Terreiro para Recebimento
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{pixKey ? 'Ativo' : 'Não cadastrado'}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-150 font-mono text-xs font-bold text-zinc-800">
              <span>{pixKeyType.toUpperCase()}: {pixKey || 'Não cadastrada'}</span>
              <button onClick={copyPixKey} className="text-zinc-500 hover:text-zinc-800 transition-colors">
                {copiedPix ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BALANÇO E RELATÓRIO MENSAL */}
      {activeTab === 'relatorios' && (
        <div className="space-y-4 relative z-10">
          {/* Month Filter */}
          <div className="p-4 rounded-[28px] bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-700 text-xs font-bold">
              <Calendar className="h-4 w-4 text-zinc-400" />
              <span>Período Selecionado:</span>
            </div>
            <select
              value={selectedReportMonth}
              onChange={(e) => setSelectedReportMonth(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none text-zinc-800"
            >
              <option value="Julho / 2026">Julho / 2026</option>
              <option value="Junho / 2026">Junho / 2026</option>
              <option value="Maio / 2026">Maio / 2026</option>
            </select>
          </div>

          {/* Financial Breakdown Progress Bars */}
          <div className="p-5 rounded-[28px] bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Origem das Receitas ({selectedReportMonth})</h3>
            
            <div className="space-y-3">
              {receitasPorCategoria.map(([categoria, valor]) => {
                const percentual = totalEntradas ? Math.round(valor / totalEntradas * 100) : 0;
                return <div key={categoria}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-zinc-700">{categoria}</span>
                    <span className="text-zinc-900 font-mono">{percentual}% (R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${percentual}%`, backgroundColor: themeColor }} />
                  </div>
                </div>;
              })}
              {!receitasPorCategoria.length && <p className="text-xs text-zinc-400">Nenhuma receita no período.</p>}
            </div>

            <button
              onClick={exportCsv}
              className="w-full mt-3 py-3 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Exportar Balanço em CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal 1: Nova Transação */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-[380px] rounded-[32px] bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h3 className="text-lg font-extrabold text-zinc-800">Nova Transação</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-full bg-zinc-100 text-zinc-500"><X className="h-4 w-4" /></button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500">Tipo de Movimentação</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button type="button" onClick={() => setNewTipo('entrada')} className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${newTipo === 'entrada' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-zinc-50 border-zinc-200 text-zinc-500'}`}>Entrada (+)</button>
                    <button type="button" onClick={() => setNewTipo('saida')} className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${newTipo === 'saida' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-zinc-50 border-zinc-200 text-zinc-500'}`}>Saída (-)</button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-500">Descrição</label>
                  <input required type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Ex: Doação de Velas, Conta de Luz..." className="w-full p-3 text-xs font-semibold rounded-xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-400 mt-1" />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-500">Valor (R$)</label>
                  <input required type="text" value={newValor} onChange={(e) => setNewValor(e.target.value)} placeholder="120,00" className="w-full p-3 text-xs font-mono font-bold rounded-xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-400 mt-1" />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-500">Categoria</label>
                  <select value={newCategoria} onChange={(e) => setNewCategoria(e.target.value)} className="w-full p-3 text-xs font-semibold rounded-xl bg-zinc-50 border border-zinc-200 outline-none mt-1">
                    <option value="Mensalidades">Mensalidades</option>
                    <option value="Doações">Doações</option>
                    <option value="Materiais">Materiais & Velas</option>
                    <option value="Manutenção">Manutenção / Luz</option>
                  </select>
                </div>

                <button type="submit" className="w-full py-3.5 rounded-2xl text-white font-bold text-xs shadow-md mt-2" style={{ backgroundColor: themeColor }}>
                  Salvar Transação
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Notificar Inadimplente via WhatsApp */}
      <AnimatePresence>
        {showChargeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowChargeModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-[380px] rounded-[32px] bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h3 className="text-base font-extrabold text-zinc-800 flex items-center gap-2">
                  <Send className="h-4 w-4 text-emerald-600" />
                  Cobrar via WhatsApp
                </h3>
                <button onClick={() => setShowChargeModal(false)} className="p-1.5 rounded-full bg-zinc-100 text-zinc-500"><X className="h-4 w-4" /></button>
              </div>

              {selectedInadimplente && (
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-150 space-y-1 text-xs">
                  <p className="font-extrabold text-zinc-800">{selectedInadimplente.nome}</p>
                  <p className="font-medium text-zinc-500">{selectedInadimplente.mesesAtraso} meses pendentes • Total: <strong className="text-rose-600 font-mono">R$ {selectedInadimplente.valorTotal.toFixed(2)}</strong></p>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-xs font-medium text-emerald-900 leading-relaxed">
                Mensagem pré-formatada com a Chave Pix e o valor exato pendente pronta para envio direto no WhatsApp!
              </div>

              <button
                onClick={() => handleSendChargeNotification(selectedInadimplente || undefined)}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Confirmar Envio da Cobrança</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
