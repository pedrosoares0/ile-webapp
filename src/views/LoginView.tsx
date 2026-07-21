import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Mail, Lock, User, Phone, Hash, MapPin, Compass, Check, X, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        trigger?: string;
        colors?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

const SLIDESHOW_IMAGES = [
  '/img/login/exu.webp',
  '/img/login/oxumlogin.webp',
  '/img/login/filho.webp',
  '/img/login/yemanjalogin.webp',
];

const formatCelular = (value: string) => {
  const digits = value.replace(/\D/g, '');
  const trimmed = digits.slice(0, 11);
  if (trimmed.length <= 2) return trimmed;
  if (trimmed.length <= 7) return `${trimmed.slice(0, 2)} ${trimmed.slice(2)}`;
  return `${trimmed.slice(0, 2)} ${trimmed.slice(2, 7)}-${trimmed.slice(7)}`;
};

interface LoginViewProps {
  onExploreHub?: () => void;
}

export default function LoginView({ onExploreHub }: LoginViewProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);
  const [prevBg, setPrevBg] = useState(0);

  // Feed Ilê rotating icon states (must be at component level, not inside IIFE)
  const FEED_ICONS = [
    { src: '/img/reactions/folha.webp', shadow: 'rgba(60,150,60,0.35)' },
    { src: '/img/reactions/concha.webp', shadow: 'rgba(200,170,110,0.35)' },
    { src: '/img/reactions/coracao.webp', shadow: 'rgba(220,50,50,0.35)' },
  ];
  const [feedIconIdx, setFeedIconIdx] = useState(0);
  const [feedIconVisible, setFeedIconVisible] = useState(true);

  // Registration flow states
  const [isRegister, setIsRegister] = useState(false);
  const [registerType, setRegisterType] = useState<'membro' | 'terreiro'>('membro');

  // Member Registration states
  const [regNome, setRegNome] = useState('');
  const [regSobrenome, setRegSobrenome] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNumero, setRegNumero] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [regConfirmaSenha, setRegConfirmaSenha] = useState('');
  const [regCodigoTerreiro, setRegCodigoTerreiro] = useState('');

  // Terreiro Registration states (Split into 3 Steps)
  const [regStep, setRegStep] = useState(1);
  const [membroStep, setMembroStep] = useState(1);
  const [regTerreiroDirigente, setRegTerreiroDirigente] = useState('');
  const [regTerreiroUsername, setRegTerreiroUsername] = useState('');
  const [regTerreiroNome, setRegTerreiroNome] = useState('');
  const [regTerreiroSigla, setRegTerreiroSigla] = useState('');
  const [regTerreiroEmail, setRegTerreiroEmail] = useState('');
  const [regTerreiroCelular, setRegTerreiroCelular] = useState('');
  const [regTerreiroCidade, setRegTerreiroCidade] = useState('');
  const [regTerreiroEstado, setRegTerreiroEstado] = useState('');
  const [regTerreiroSenha, setRegTerreiroSenha] = useState('');
  const [regTerreiroConfirmaSenha, setRegTerreiroConfirmaSenha] = useState('');
  const [regTerreiroCorTema, setRegTerreiroCorTema] = useState('#BF2429');

  // Feed icon cycling effect
  useEffect(() => {
    const interval = setInterval(() => {
      setFeedIconVisible(false);
      setTimeout(() => {
        setFeedIconIdx(prev => (prev + 1) % FEED_ICONS.length);
        setFeedIconVisible(true);
      }, 300);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevBg(currentBg);
      setCurrentBg((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentBg]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.lordicon.com/lordicon.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const originalBodyBg = document.body.style.backgroundColor;
    const rootEl = document.getElementById('root');
    const originalRootBg = rootEl ? rootEl.style.backgroundColor : '';

    document.body.style.backgroundColor = '#000000';
    if (rootEl) {
      rootEl.style.backgroundColor = 'transparent';
    }

    return () => {
      document.body.style.backgroundColor = originalBodyBg;
      if (rootEl) {
        rootEl.style.backgroundColor = originalRootBg;
      }
    };
  }, []);

  // Smart Terreiro Recognition — debounced lookup against Supabase
  const [detectedTerreiro, setDetectedTerreiro] = useState<{ id: string; nome: string } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Custom Success Alert Modal state
  const [successData, setSuccessData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    inviteCode?: string;
    onDone: () => void;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Real-time lookup for member's terreiro code
  const [detectedMemberTerreiro, setDetectedMemberTerreiro] = useState<{ id: string; nome: string } | null>(null);
  const [isDetectingMemberTerreiro, setIsDetectingMemberTerreiro] = useState(false);

  // Real-time lookup for username and email taken states
  const [usernameStatus, setUsernameStatus] = useState<{ checked: boolean; taken: boolean } | null>(null);
  const [emailStatus, setEmailStatus] = useState<{ checked: boolean; taken: boolean } | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const isT7CA = Boolean(detectedTerreiro);

  const isUsernameError = Boolean(
    error &&
    error.toLowerCase().includes('usuário') &&
    error.toLowerCase().includes('uso')
  );

  const isEmailError = Boolean(
    error &&
    (error.toLowerCase().includes('email') ||
      error.toLowerCase().includes('already registered') ||
      error.toLowerCase().includes('já cadastrado') ||
      error.toLowerCase().includes('já existe'))
  );

  const isPasswordError = Boolean(
    error &&
    error.toLowerCase().includes('senhas não coincidem')
  );

  const isTerreiroCodeError = Boolean(
    error &&
    (error.toLowerCase().includes('código do terreiro') ||
      error.toLowerCase().includes('código não encontrado'))
  );

  // Computed taken states
  const isUsernameTaken = Boolean(usernameStatus?.taken) || isUsernameError;
  const isEmailTaken = Boolean(emailStatus?.taken) || isEmailError;
  const isMemberTerreiroCodeInvalid = Boolean(
    (regCodigoTerreiro.trim().length >= 3 && !isDetectingMemberTerreiro && !detectedMemberTerreiro) ||
    isTerreiroCodeError
  );

  // Missing fields highlighting
  const isMemberStep1Missing = Boolean(
    error &&
    error.includes('dados obrigatórios')
  );
  const isMemberNomeError = isMemberStep1Missing && !regNome;
  const isMemberSobrenomeError = isMemberStep1Missing && !regSobrenome;
  const isMemberNumeroError = isMemberStep1Missing && !regNumero;

  const isTerreiroStep1Missing = Boolean(
    error &&
    error.includes('dados do terreiro')
  );
  const isTerreiroNomeError = isTerreiroStep1Missing && !regTerreiroNome;
  const isTerreiroCelularError = isTerreiroStep1Missing && !regTerreiroCelular;
  const isTerreiroCidadeError = isTerreiroStep1Missing && !regTerreiroCidade;
  const isTerreiroEstadoError = isTerreiroStep1Missing && !regTerreiroEstado;

  useEffect(() => {
    const val = email.trim().toLowerCase();
    if (!val || val.length < 2 || isRegister) {
      setDetectedTerreiro(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsDetecting(true);
      try {
        const { data: profile } = await supabase.rpc('resolve_login_context', { identifier: val });

        if (profile?.terreiro_id) {
          const { data: terreiro } = await supabase
            .from('terreiros')
            .select('id, nome')
            .eq('id', profile.terreiro_id)
            .single();
          setDetectedTerreiro(terreiro ?? null);
        } else {
          setDetectedTerreiro(null);
        }
      } catch {
        setDetectedTerreiro(null);
      } finally {
        setIsDetecting(false);
      }
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [email, isRegister]);

  // Asynchronous Member Terreiro Code validation
  useEffect(() => {
    const code = regCodigoTerreiro.trim().toLowerCase();
    if (!code || code.length < 3) {
      setDetectedMemberTerreiro(null);
      return;
    }

    setIsDetectingMemberTerreiro(true);
    const timer = setTimeout(async () => {
      try {
        const { data: matchedTerreiro } = await supabase
          .from('terreiros')
          .select('id, nome')
          .or(`id.ilike.${code},id.ilike.terreiro_${code}`)
          .limit(1);

        if (matchedTerreiro && matchedTerreiro.length > 0) {
          setDetectedMemberTerreiro({
            id: matchedTerreiro[0].id,
            nome: matchedTerreiro[0].nome
          });
        } else {
          setDetectedMemberTerreiro(null);
        }
      } catch {
        setDetectedMemberTerreiro(null);
      } finally {
        setIsDetectingMemberTerreiro(false);
      }
    }, 200); // 200ms debounce

    return () => clearTimeout(timer);
  }, [regCodigoTerreiro]);

  // Asynchronous Username checking
  useEffect(() => {
    const userVal = (registerType === 'membro' ? regUsername : regTerreiroUsername).trim().toLowerCase();
    if (!userVal || userVal.length < 3) {
      setUsernameStatus(null);
      return;
    }

    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const emailVal = (registerType === 'membro' ? regEmail : regTerreiroEmail).trim().toLowerCase();
        const { data: availability } = await supabase.rpc('account_identifier_available', {
          candidate_username: userVal,
          candidate_email: emailVal,
        });

        setUsernameStatus({
          checked: true,
          taken: availability?.username_available === false
        });
      } catch {
        setUsernameStatus(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [regUsername, regTerreiroUsername, registerType]);

  // Asynchronous Email checking
  useEffect(() => {
    const emailVal = (registerType === 'membro' ? regEmail : regTerreiroEmail).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      setEmailStatus(null);
      return;
    }

    setCheckingEmail(true);
    const timer = setTimeout(async () => {
      try {
        const userVal = (registerType === 'membro' ? regUsername : regTerreiroUsername).trim().toLowerCase();
        const { data: availability } = await supabase.rpc('account_identifier_available', {
          candidate_username: userVal,
          candidate_email: emailVal,
        });

        setEmailStatus({
          checked: true,
          taken: availability?.email_available === false
        });
      } catch {
        setEmailStatus(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [regEmail, regTerreiroEmail, registerType]);

  // Short display name for detected terreiro (e.g. "T7CA" from "T7CA - Terreiro de Umbanda...")
  const detectedShortName = useMemo(() => {
    if (!detectedTerreiro) return '';
    const name = detectedTerreiro.nome;
    // Try to get the short prefix before ' - '
    const dashIdx = name.indexOf(' - ');
    return dashIdx > 0 ? name.substring(0, dashIdx).trim() : name.substring(0, 12);
  }, [detectedTerreiro]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error ?? 'Não foi possível entrar.');
      return;
    }

    setError(null);
  }

  async function handleMemberRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (regSenha !== regConfirmaSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    if (regUsername.trim()) {
      const { data: availability, error: lookupError } = await supabase.rpc('account_identifier_available', {
        candidate_username: regUsername.trim(), candidate_email: regEmail.trim()
      });
      if (lookupError || availability?.username_available === false) {
        setError('Este nome de usuário já está em uso.');
        return;
      }
    }

    // Resolve Terreiro Code if provided
    let matchedTerreiroId = '';
    if (regCodigoTerreiro.trim()) {
      const code = regCodigoTerreiro.trim().toLowerCase();
      // Fetch matching terreiro from Supabase
      const { data: matchedTerreiro, error: findError } = await supabase
        .from('terreiros')
        .select('*')
        .or(`id.ilike.${code},id.ilike.terreiro_${code}`)
        .limit(1);

      if (findError || !matchedTerreiro || matchedTerreiro.length === 0) {
        setError('Código do Terreiro não encontrado. Deixe em branco se quiser se cadastrar no Hub Geral.');
        return;
      }
      matchedTerreiroId = matchedTerreiro[0].id;
    }

    // Register user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: regEmail.trim(),
      password: regSenha,
      options: {
        data: {
          nome: regNome,
          username: regUsername.trim().toLowerCase(),
        }
      }
    });

    if (signUpError) {
      const msg = signUpError.message;
      setError(msg === '{}' || !msg ? 'Ocorreu um erro ao criar a conta. É possível que este e-mail já esteja em uso.' : msg);
      return;
    }

    if (signUpData.user) {
      const { error: dbError } = await supabase.rpc('complete_member_registration', {
        member_name: `${regNome} ${regSobrenome}`,
        member_email: regEmail.trim(),
        member_phone: regNumero,
        invite_code: matchedTerreiroId || null,
      });

      if (dbError) {
        const msg = dbError.message;
        setError(msg === '{}' || !msg ? 'Ocorreu um erro ao salvar os dados do seu perfil.' : msg);
        return;
      }
    }

    const targetEmail = regEmail;
    const targetSenha = regSenha;
    setSuccessData({
      isOpen: true,
      title: 'Sucesso!',
      message: matchedTerreiroId
        ? 'Cadastro realizado com sucesso! Você foi vinculado ao seu Terreiro.'
        : 'Cadastro realizado com sucesso! Como você não usou código, terá acesso ao Hub Geral do Ilê.',
      onDone: () => {
        setIsRegister(false);
        setEmail(targetEmail);
        setPassword(targetSenha);
        setError(null);

        // Clear registration fields
        setRegNome('');
        setRegSobrenome('');
        setRegUsername('');
        setRegEmail('');
        setRegNumero('');
        setRegSenha('');
        setRegConfirmaSenha('');
        setRegCodigoTerreiro('');
        setMembroStep(1);
        setSuccessData(null);
      }
    });
  }

  async function handleTerreiroRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (regTerreiroSenha !== regTerreiroConfirmaSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    if (regTerreiroUsername.trim()) {
      const { data: availability, error: lookupError } = await supabase.rpc('account_identifier_available', {
        candidate_username: regTerreiroUsername.trim(), candidate_email: regTerreiroEmail.trim()
      });
      if (lookupError || availability?.username_available === false) {
        setError('Este nome de usuário do administrador já está em uso.');
        return;
      }
    }

    // Register admin user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: regTerreiroEmail.trim(),
      password: regTerreiroSenha,
      options: {
        data: {
          nome: regTerreiroDirigente,
          username: regTerreiroUsername.trim().toLowerCase(),
        }
      }
    });

    if (signUpError) {
      const msg = signUpError.message;
      setError(msg === '{}' || !msg ? 'Ocorreu um erro ao registrar o terreiro. É possível que este e-mail já esteja cadastrado.' : msg);
      return;
    }

    let newTerreiroId = '';
    if (signUpData.user) {
      const { data: createdTerreiroId, error: dbError } = await supabase.rpc('create_my_terreiro', {
        terreiro_nome: regTerreiroNome,
        terreiro_sigla: regTerreiroSigla,
        terreiro_cidade: regTerreiroCidade,
        terreiro_estado: regTerreiroEstado,
        terreiro_dirigente: regTerreiroDirigente,
        terreiro_contato: regTerreiroCelular,
        terreiro_cor: regTerreiroCorTema,
      });

      if (dbError) {
        const msg = dbError.message;
        setError(msg === '{}' || !msg ? 'Ocorreu um erro ao salvar as configurações do terreiro.' : msg);
        return;
      }
      newTerreiroId = createdTerreiroId;
    }

    const targetEmail = regTerreiroEmail;
    const targetSenha = regTerreiroSenha;
    setSuccessData({
      isOpen: true,
      title: 'Sucesso!',
      message: 'Terreiro cadastrado com sucesso! Compartilhe o código abaixo para que seus membros possam se vincular durante o cadastro.',
      inviteCode: newTerreiroId,
      onDone: () => {
        setIsRegister(false);
        setEmail(targetEmail);
        setPassword(targetSenha);
        setError(null);
        setRegStep(1);

        // Clear fields
        setRegTerreiroDirigente('');
        setRegTerreiroUsername('');
        setRegTerreiroNome('');
        setRegTerreiroSigla('');
        setRegTerreiroEmail('');
        setRegTerreiroCelular('');
        setRegTerreiroCidade('');
        setRegTerreiroEstado('');
        setRegTerreiroSenha('');
        setRegTerreiroConfirmaSenha('');
        setRegTerreiroCorTema('#BF2429');
        setSuccessData(null);
      }
    });
  }

  function handleTerreiroNext() {
    if (!regTerreiroNome || !regTerreiroSigla || !regTerreiroCelular || !regTerreiroCidade || !regTerreiroEstado) {
      setError('Preencha os dados do terreiro para continuar.');
      return;
    }
    setError(null);
    setRegStep(2);
  }

  function handleTerreiroNext2() {
    if (regTerreiroSenha !== regTerreiroConfirmaSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!regTerreiroDirigente || !regTerreiroUsername || !regTerreiroEmail || !regTerreiroSenha) {
      setError('Preencha todos os dados do administrador para continuar.');
      return;
    }
    setError(null);
    setRegStep(3);
  }

  return (
    <div className={`relative mx-auto min-h-[100dvh] max-w-[430px] overflow-hidden bg-black font-inter text-[#414141] flex flex-col transition-all duration-[250ms] ease-[0.23,1,0.32,1] ${isRegister ? 'justify-center py-6' : 'justify-end pb-6'
      }`}>
      {/* Fullscreen Background (Perfect Gapless Crossfade) */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${SLIDESHOW_IMAGES[prevBg]}')` }}
        />
        <motion.div
          key={currentBg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${SLIDESHOW_IMAGES[currentBg]}')` }}
        />
      </div>

      {/* Dynamic Background Aurora Glows for Registration */}
      <AnimatePresence>
        {isRegister && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-[1] pointer-events-none overflow-hidden select-none"
          >
            {registerType === 'membro' ? (
              // Pure white glow for Member
              <>
                <div className="absolute w-[80vw] h-[80vw] rounded-full bg-gradient-to-br from-white/25 to-zinc-200/5 blur-[80px] -top-[10%] -right-[10%] animate-[pulse_6s_ease-in-out_infinite]" />
                <div className="absolute w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-white/15 to-zinc-300/5 blur-[70px] -bottom-[10%] -left-[10%] animate-[pulse_8s_ease-in-out_infinite_1s]" />
              </>
            ) : (
              // Deep crimson-red glow for Terreiro
              <>
                <div className="absolute w-[80vw] h-[80vw] rounded-full bg-gradient-to-br from-[#BF2429]/35 to-rose-800/15 blur-[80px] -top-[10%] -left-[10%] animate-[pulse_6s_ease-in-out_infinite]" />
                <div className="absolute w-[65vw] h-[65vw] rounded-full bg-gradient-to-tr from-[#BF2429]/20 to-[#4a0000]/10 blur-[75px] -bottom-[10%] -right-[10%] animate-[pulse_8s_ease-in-out_infinite_1.2s]" />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logos Container (Only Ilê logo flutters above card in login mode) */}
      <AnimatePresence>
        {!isRegister && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-20 mx-4 mb-3 flex justify-center items-center h-14"
          >
            <motion.div
              layout
              className="h-11 flex items-center"
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
              <img
                src="/img/logo-ile.webp"
                alt="Ilê"
                className="h-9 object-contain"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(95%) sepia(10%) saturate(541%) hue-rotate(332deg) brightness(97%) contrast(89%)'
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Access Floating Avatars (elegant, minimal) */}
      <AnimatePresence>
        {!isRegister && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="relative z-20 mx-4 mb-4"
          >
            <button
              onClick={() => setShowQuickAccess(!showQuickAccess)}
              className="mx-auto flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-white/70 hover:text-white transition-colors focus:outline-none"
            >
              <span className={`h-1 w-1 rounded-full transition-colors duration-500 ${showQuickAccess ? 'bg-green-400' : 'bg-white/40'}`} />
              Credenciais
            </button>

            <AnimatePresence>
              {showQuickAccess && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="mt-2.5 flex justify-center gap-3"
                >
                  {[
                    { logo: '/img/login/icone.webp', label: 'Adm Ilê', user: 'admin', pass: '123456', isIle: true },
                    { logo: '/img/logo-T7CA.webp', label: 'Pai (T7CA)', user: 'erick', pass: '123456', isIle: false },
                    { logo: '/img/logo-T7CA.webp', label: 'Filho', user: 'membro', pass: '123456', isIle: false },
                    { logo: '/img/login/icone.webp', label: 'Hub Membro', user: 'membro.hub', pass: '123456', isIle: true },
                  ].map((hint, i) => (
                    <motion.button
                      key={hint.user}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        setEmail(hint.user);
                        setPassword(hint.pass);
                      }}
                      className="group flex flex-col items-center gap-1.5 focus:outline-none"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-xl border border-white/20 shadow-lg group-hover:bg-white/25 group-active:scale-90 transition-all overflow-hidden">
                        <img
                          src={hint.logo}
                          alt={hint.label}
                          className={`h-6 w-6 object-contain ${hint.isIle ? 'brightness-0 invert opacity-80' : ''}`}
                        />
                      </span>
                      <span className="text-[8px] font-black text-white/60 tracking-wider uppercase group-hover:text-white/90 transition-colors">
                        {hint.label}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double Bezel Outer Shell */}
      <div className={`relative mx-4 mb-2 p-1.5 rounded-[44px] bg-white/5 border border-white/15 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.25)] z-10 overflow-hidden transition-all duration-[250ms] ease-[0.23,1,0.32,1]`}>

        {/* Double Bezel Inner Core Card */}
        <motion.div
          layout
          className={`relative rounded-[38px] px-6 pt-6 pb-5 overflow-hidden transition-all duration-[250ms] ease-[0.23,1,0.32,1] ${isRegister
            ? 'flex flex-col gap-4 border border-white/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]'
            : 'border border-white/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45)]'
            }`}
        >
          {/* Dynamic Background Gradient */}
          <div
            className="absolute inset-0 z-0 pointer-events-none transition-all duration-[250ms] ease-[0.23,1,0.32,1]"
            style={{
              background: isRegister
                ? 'linear-gradient(180deg, rgba(252, 248, 242, 0.88) 0%, rgba(255, 255, 255, 0.78) 100%)'
                : isT7CA
                  ? 'linear-gradient(180deg, #e3f2fd 0%, #d0e8fc 100%)'
                  : 'linear-gradient(180deg, #FAF4E9 0%, #eadecc 100%)'
            }}
          />

          {/* Watermark Dança Removed */}

          {/* Aurora Effect inside Card Footer */}
          <AnimatePresence>
            {isT7CA && !isRegister && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-x-0 bottom-0 pointer-events-none z-0 select-none"
              >
                <div className="absolute -bottom-10 left-1/4 w-32 h-32 rounded-full bg-[#0d47a1] blur-[30px] animate-[pulse_4s_infinite]" />
                <div className="absolute -bottom-14 right-1/4 w-36 h-36 rounded-full bg-[#00b0ff] blur-[35px] animate-[pulse_5s_infinite_1.2s]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo goes inside the card at the top during registration */}
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center mb-3 z-10"
              >
                <img
                  src="/img/login/icone.webp"
                  alt="Ilê"
                  className="h-9 object-contain opacity-95 transition-all duration-300"
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(20%) sepia(82%) saturate(4976%) hue-rotate(345deg) brightness(87%) contrast(95%)'
                  }}
                />
              </motion.div>
            )}

            {/* Title with optional T7CA logo next to Bem-Vindo */}
            <div className="flex items-center justify-center gap-2.5 mb-3">
              {/* T7CA Logo appears inside the card left of Bem-Vindo during login */}
              <AnimatePresence>
                {isT7CA && !isRegister && (
                  <motion.div
                    initial={{ width: 0, opacity: 0, scale: 0.5 }}
                    animate={{ width: 32, opacity: 1, scale: 1 }}
                    exit={{ width: 0, opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    className="h-8 w-8 flex-shrink-0 overflow-hidden"
                  >
                    <img src="/img/logo-T7CA.webp" alt="T7CA Logo" className="h-full w-full object-contain" />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.h1
                animate={{
                  color: isRegister
                    ? '#BF2429'
                    : isT7CA
                      ? '#0d47a1'
                      : '#BF2429',
                }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="text-[34px] font-behind italic leading-none tracking-tight text-center"
              >
                {isRegister ? 'Cadastro' : 'Bem-Vindo'}
              </motion.h1>
            </div>

            {/* Registration Mode Selector (Membro vs Terreiro) */}
            {isRegister && (
              <div className="relative flex p-1 rounded-full mb-3 w-full max-w-[280px] mx-auto border border-black/5 bg-black/5 backdrop-blur-md">
                {/* Active sliding background */}
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-y-1 rounded-full shadow-sm"
                  animate={{
                    left: registerType === 'membro' ? 4 : 'calc(50% + 2px)',
                    width: 'calc(50% - 6px)',
                    backgroundColor: '#BF2429'
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />

                <button
                  type="button"
                  onClick={() => {
                    setRegisterType('membro');
                    setError(null);
                    setMembroStep(1);
                  }}
                  className={`relative z-10 w-1/2 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-full transition-all duration-300 flex items-center justify-center gap-1.5 ${registerType === 'membro'
                    ? 'text-white font-black'
                    : 'text-black/40 hover:text-black/70 font-medium'
                    }`}
                >
                  <lord-icon
                    src="https://cdn.lordicon.com/hroklero.json"
                    trigger="hover"
                    colors={registerType === 'membro' ? 'primary:#ffffff,secondary:#ffffff' : 'primary:#BF2429,secondary:#BF2429'}
                    style={{ width: '18px', height: '18px' }}
                  />
                  Membro
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRegisterType('terreiro');
                    setError(null);
                    setRegStep(1);
                  }}
                  className={`relative z-10 w-1/2 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-full transition-all duration-300 flex items-center justify-center gap-1.5 ${registerType === 'terreiro'
                    ? 'text-white font-black'
                    : 'text-black/40 hover:text-black/70 font-medium'
                    }`}
                >
                  <lord-icon
                    src="https://cdn.lordicon.com/mfgtmuty.json"
                    trigger="hover"
                    colors={registerType === 'terreiro' ? 'primary:#ffffff,secondary:#ffffff,tertiary:#ffffff' : 'primary:#BF2429,secondary:#BF2429,tertiary:#BF2429'}
                    style={{ width: '18px', height: '18px' }}
                  />
                  Terreiro
                </button>
              </div>
            )}

            {/* Unified Step progress bar for both registration modes */}
            {isRegister && (
              <div className="w-full max-w-[200px] mt-2 mb-1 text-left mx-auto">
                <div className="flex justify-between items-center mb-1 px-0.5">
                  <span className="text-[8px] font-black tracking-widest text-[#BF2429]/70 uppercase">
                    {registerType === 'membro' ? 'Cadastro Membro' : 'Cadastro Terreiro'}
                  </span>
                  <span className="text-[9px] font-black text-[#BF2429]/90 font-mono">
                    Passo {registerType === 'membro' ? membroStep : regStep} de 2
                  </span>
                </div>
                <div
                  className="h-1 w-full rounded-full overflow-hidden border bg-black/5"
                  style={{
                    borderColor: 'rgba(191, 36, 41, 0.08)'
                  }}
                >
                  <motion.div
                    className="h-full"
                    style={{
                      backgroundColor: '#BF2429'
                    }}
                    initial={{ width: '50%' }}
                    animate={{
                      width: (registerType === 'membro' ? membroStep === 1 : regStep === 1) ? '50%' : '100%'
                    }}
                    transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Forms Section */}
          <AnimatePresence mode="wait">
            {!isRegister ? (
              /* LOGIN FORM */
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                onSubmit={handleSubmit}
                className="relative z-10"
              >
                {error ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-2xl border border-red-500/10 bg-red-500/5 px-4 py-2.5 text-red-600 mb-3"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-[13px] font-medium">{error}</p>
                  </motion.div>
                ) : null}

                <div className="space-y-3">
                  {/* Email Input */}
                  <div className="group relative">
                    <Mail className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isT7CA
                      ? 'text-[#0d47a1]/25 group-focus-within:text-[#0d47a1]'
                      : 'text-[#BF2429]/25 group-focus-within:text-[#BF2429]'
                      }`} />
                    <input
                      required
                      type="text"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (error) setError(null);
                      }}
                      className={`w-full rounded-[22px] bg-white/90 py-3.5 pl-10 pr-10 text-[15px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),_0_2px_5px_rgba(0,0,0,0.015)] ${isT7CA
                        ? 'text-[#0d47a1] border-[#0d47a1]/15 focus:border-[#0d47a1]/40 focus:bg-white focus:ring-4 focus:ring-[#0d47a1]/5'
                        : 'text-[#414141] border-[#BF2429]/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-4 focus:ring-[#BF2429]/5'
                        }`}
                      placeholder="Email ou Usuário"
                    />
                    {/* Detecting / Clear indicator */}
                    <AnimatePresence>
                      {isDetecting ? (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                          >
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-[#0d47a1]/30 border-t-[#0d47a1] animate-spin" />
                          </motion.div>
                        </div>
                      ) : email ? (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                          <motion.button
                            type="button"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => {
                              setEmail('');
                              if (error) setError(null);
                            }}
                            className={`p-0.5 rounded-full hover:bg-zinc-100 transition-colors focus:outline-none ${isT7CA ? 'text-[#0d47a1]/40 hover:text-[#0d47a1]' : 'text-zinc-400 hover:text-zinc-600'}`}
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        </div>
                      ) : null}
                    </AnimatePresence>
                  </div>

                  {/* Password Input */}
                  <div className="group relative">
                    <Lock className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isT7CA
                      ? 'text-[#0d47a1]/25 group-focus-within:text-[#0d47a1]'
                      : 'text-[#BF2429]/25 group-focus-within:text-[#BF2429]'
                      }`} />
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (error) setError(null);
                      }}
                      className={`w-full rounded-[22px] bg-white/90 py-3.5 pl-10 pr-10 text-[15px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),_0_2px_5px_rgba(0,0,0,0.015)] ${isT7CA
                        ? 'text-[#0d47a1] border-[#0d47a1]/15 focus:border-[#0d47a1]/40 focus:bg-white focus:ring-4 focus:ring-[#0d47a1]/5'
                        : 'text-[#414141] border-[#BF2429]/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-4 focus:ring-[#BF2429]/5'
                        }`}
                      placeholder="Senha"
                    />
                    {password && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-zinc-100 transition-colors focus:outline-none ${isT7CA ? 'text-[#0d47a1]/40 hover:text-[#0d47a1]' : 'text-zinc-400 hover:text-zinc-600'}`}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  animate={{
                    background: isT7CA
                      ? 'linear-gradient(175deg, #1e72d8 0%, #0d47a1 100%)'
                      : 'linear-gradient(175deg, #e8383c 0%, #a91b1f 100%)',
                  }}
                  transition={{ duration: 0.25 }}
                  className="w-full rounded-full py-[15px] text-[14px] font-bold tracking-wide text-white transition-all active:scale-[0.97] mt-5"
                  style={{
                    boxShadow: isT7CA
                      ? '0 0 0 2.5px rgba(255,255,255,0.28), 0 10px 28px rgba(13,71,161,0.44), inset 0 1px 0 rgba(255,255,255,0.3)'
                      : '0 0 0 2.5px rgba(255,255,255,0.28), 0 10px 28px rgba(191,36,41,0.44), inset 0 1px 0 rgba(255,255,255,0.3)'
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    {detectedTerreiro ? `ENTRAR NO ${detectedShortName}` : 'ENTRAR'}
                  </span>
                </motion.button>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      setError(null);
                    }}
                    className={`text-xs font-semibold transition-colors focus:outline-none ${isT7CA
                      ? 'text-[#0d47a1]/70 hover:text-[#0d47a1]'
                      : 'text-[#BF2429]/70 hover:text-[#BF2429]'
                      }`}
                  >
                    Não tem uma conta? Cadastre-se agora.
                  </button>
                </div>

                {/* Feed Ilê Feature Card / Exploration Button */}
                <div className="mt-5 pt-3.5 border-t border-[#414141]/8 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => onExploreHub?.()}
                    className="w-full group relative overflow-hidden rounded-[28px] text-left transition-all active:scale-[0.98] shadow-[0_6px_28px_rgba(139,0,0,0.09),_0_2px_8px_rgba(0,0,0,0.06)]"
                    style={{
                      background: 'linear-gradient(135deg, #fff9f5 0%, #fff5ee 40%, #fdf0e8 100%)',
                      border: '1px solid rgba(139,0,0,0.10)',
                    }}
                  >
                    {/* Subtle inner glow top edge */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

                    <div className="flex items-center gap-3.5 p-4">
                      {/* Animated icon container */}
                      <div
                        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] transition-all"
                        style={{
                          background: 'linear-gradient(145deg, #fff 60%, #fde8d8 100%)',
                          boxShadow: `0 4px 16px ${FEED_ICONS[feedIconIdx].shadow}, 0 1px 4px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.9)`,
                          border: '1px solid rgba(139,0,0,0.08)',
                          transition: 'box-shadow 0.4s ease',
                        }}
                      >
                        <img
                          src={FEED_ICONS[feedIconIdx].src}
                          alt=""
                          className="h-8 w-8 object-contain"
                          style={{
                            opacity: feedIconVisible ? 1 : 0,
                            transform: feedIconVisible ? 'scale(1)' : 'scale(0.82)',
                            transition: 'opacity 0.3s ease, transform 0.3s ease',
                            filter: `drop-shadow(0 2px 6px ${FEED_ICONS[feedIconIdx].shadow})`,
                          }}
                        />
                      </div>

                      {/* Text content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[12.5px] font-bold text-[#414141] tracking-tight">Feed Ilê</span>
                          <span
                            className="text-[8.5px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
                            style={{
                              background: 'linear-gradient(90deg, rgba(139,0,0,0.10) 0%, rgba(139,0,0,0.06) 100%)',
                              color: '#8B0000',
                              border: '1px solid rgba(139,0,0,0.12)',
                            }}
                          >
                            Visitante
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-[#414141]/55 leading-tight">
                          Explore terreiros, giras e pontos sem conta
                        </p>
                      </div>

                      {/* Arrow */}
                      <div
                        className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(139,0,0,0.06)',
                          border: '1px solid rgba(139,0,0,0.10)',
                        }}
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-[#8B0000]/60 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </button>
                </div>
              </motion.form>
            ) : registerType === 'membro' ? (
              /* MEMBER REGISTRATION FORM (2-STEP GLASSMORPHIC WIZARD) */
              <motion.form
                key="register-membro"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                onSubmit={handleMemberRegisterSubmit}
                className="relative z-10"
              >
                {error ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-2xl border border-red-500/15 bg-red-500/10 px-4 py-2.5 text-red-700 mb-3"
                  >
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-[13px] font-bold">{error}</p>
                  </motion.div>
                ) : null}

                <AnimatePresence mode="wait">
                  {membroStep === 1 ? (
                    /* STEP 1: PERSONAL DETAILS */
                    <motion.div
                      key="membro-step1"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.14, ease: 'easeOut' }}
                      className="space-y-3 pb-1"
                    >
                      {/* Nome & Sobrenome */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="group relative">
                          <User className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isMemberNomeError
                            ? 'text-red-500'
                            : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                            }`} />
                          <input
                            required
                            type="text"
                            value={regNome}
                            onChange={(e) => {
                              setRegNome(e.target.value);
                              if (error) setError(null);
                            }}
                            className={`w-full rounded-[16px] bg-white/75 py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isMemberNomeError
                              ? 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
                              : 'border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                              }`}
                            placeholder="Nome"
                          />
                        </div>
                        <div className="group relative">
                          <input
                            required
                            type="text"
                            value={regSobrenome}
                            onChange={(e) => {
                              setRegSobrenome(e.target.value);
                              if (error) setError(null);
                            }}
                            className={`w-full rounded-[16px] bg-white/75 py-3.5 px-5 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isMemberSobrenomeError
                              ? 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
                              : 'border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                              }`}
                            placeholder="Sobrenome"
                          />
                        </div>
                      </div>


                      {/* Celular */}
                      <div className="group relative">
                        <Phone className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isMemberNumeroError
                          ? 'text-red-500'
                          : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                          }`} />
                        <input
                          required
                          type="tel"
                          value={regNumero}
                          onChange={(e) => {
                            setRegNumero(formatCelular(e.target.value));
                            if (error) setError(null);
                          }}
                          className={`w-full rounded-[16px] bg-white/75 py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isMemberNumeroError
                            ? 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
                            : 'border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                            }`}
                          placeholder="Celular (DDD + número)"
                        />
                      </div>

                      {/* Divider com label */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex-1 h-px bg-[#BF2429]/10" />
                        <span className="text-[9.5px] font-black tracking-[0.18em] text-[#BF2429]/50 uppercase">Código do Terreiro</span>
                        <div className="flex-1 h-px bg-[#BF2429]/10" />
                      </div>

                      {/* Código do Terreiro */}
                      <div className="group relative">
                        <Hash className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isMemberTerreiroCodeInvalid
                          ? 'text-red-500'
                          : detectedMemberTerreiro
                            ? 'text-emerald-600'
                            : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                          }`} />
                        <input
                          type="text"
                          value={regCodigoTerreiro}
                          onChange={(e) => {
                            setRegCodigoTerreiro(e.target.value);
                            if (error) setError(null);
                          }}
                          className={`w-full rounded-[16px] py-3.5 pl-10 pr-10 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isMemberTerreiroCodeInvalid
                            ? 'bg-white/75 border-red-500 focus:border-red-600 focus:ring-red-500/10'
                            : detectedMemberTerreiro
                              ? 'bg-emerald-500/[0.02] border-emerald-500/35 focus:border-emerald-500 focus:ring-emerald-500/10'
                              : 'bg-white/75 border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                            }`}
                          placeholder="Código convite (opcional)"
                        />
                        {isDetectingMemberTerreiro && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-[#BF2429]/30 border-t-[#BF2429] animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Feedback do código */}
                      {detectedMemberTerreiro ? (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-3.5 py-2.5 -mt-1 text-left"
                        >
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-black text-emerald-800 leading-none mb-0.5">Terreiro encontrado!</p>
                            <p className="font-medium text-emerald-700/80">{detectedMemberTerreiro.nome} <span className="text-emerald-600/60">· {detectedMemberTerreiro.id.toUpperCase()}</span></p>
                          </div>
                        </motion.div>
                      ) : regCodigoTerreiro.trim().length >= 3 && !isDetectingMemberTerreiro ? (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-[11px] text-red-700 bg-red-500/8 border border-red-500/15 rounded-2xl px-3.5 py-2.5 -mt-1 text-left"
                        >
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-500/12 flex items-center justify-center">
                            <X className="h-3.5 w-3.5 text-red-500" />
                          </div>
                          <div>
                            <p className="font-black leading-none mb-0.5">Código não encontrado</p>
                            <p className="font-medium text-red-600/80">Verifique com seu pai/mãe de santo.</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative overflow-hidden rounded-2xl -mt-1"
                          style={{
                            background: 'linear-gradient(135deg, rgba(139,0,0,0.04) 0%, rgba(191,36,41,0.04) 100%)',
                            border: '1px solid rgba(139,0,0,0.10)',
                          }}
                        >
                          <div className="flex gap-3 p-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <div
                                className="h-7 w-7 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(139,0,0,0.08)' }}
                              >
                                <span className="text-[14px]">🤝</span>
                              </div>
                            </div>
                            <div className="space-y-1 text-left">
                              <p className="text-[11px] font-black text-[#8B0000] leading-none">Como obter o código?</p>
                              <p className="text-[10.5px] text-[#414141]/65 leading-relaxed">
                                Peça ao seu <strong className="text-[#8B0000]/80 font-bold">pai ou mãe de santo</strong> que envie o código convite do terreiro. Caso não tenha, <strong className="text-[#414141]/80">deixe em branco</strong> — você acessará o{' '}
                                <strong className="text-[#8B0000] font-bold">Feed Ilê</strong> e poderá explorar terreiros de todo o país!
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <motion.button
                        type="button"
                        onClick={() => {
                          if (!regNome || !regSobrenome || !regNumero) {
                            setError('Preencha os dados obrigatórios para continuar.');
                            return;
                          }
                          setError(null);
                          setMembroStep(2);
                        }}
                        className="w-full rounded-full py-[15px] text-[14px] font-bold tracking-wide text-white transition-all active:scale-[0.97] mt-2"
                        style={{
                          background: 'linear-gradient(175deg, #e8383c 0%, #a91b1f 100%)',
                          boxShadow: '0 0 0 2.5px rgba(255,255,255,0.28), 0 10px 28px rgba(191,36,41,0.44), inset 0 1px 0 rgba(255,255,255,0.3)'
                        }}
                      >
                        <span className="flex items-center justify-center gap-2">
                          AVANÇAR
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-80"><path d="M5 3l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                      </motion.button>

                      {/* Já tem conta */}
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsRegister(false);
                            setError(null);
                            setMembroStep(1);
                          }}
                          className="text-[11px] font-semibold text-[#BF2429]/60 hover:text-[#BF2429] transition-colors focus:outline-none"
                        >
                          Já tem uma conta?{' '}
                          <span className="font-black underline underline-offset-2">Fazer Login</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* STEP 2: CREDENTIALS */
                    <motion.div
                      key="membro-step2"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.14, ease: 'easeOut' }}
                      className="space-y-3 pb-1"
                    >
                      {/* Username */}
                      <div className="group relative">
                        <User className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isUsernameTaken
                          ? 'text-red-500'
                          : usernameStatus?.checked && !usernameStatus.taken
                            ? 'text-emerald-600'
                            : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                          }`} />
                        <input
                          required
                          type="text"
                          value={regUsername}
                          onChange={(e) => {
                            setRegUsername(e.target.value.replace(/\s+/g, '').toLowerCase());
                            if (error) setError(null);
                          }}
                          className={`w-full rounded-[16px] py-3.5 pl-10 pr-10 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isUsernameTaken
                            ? 'bg-white/75 border-red-500 focus:border-red-600 focus:ring-red-500/10'
                            : usernameStatus?.checked && !usernameStatus.taken
                              ? 'bg-emerald-500/[0.02] border-emerald-500/35 focus:border-emerald-500 focus:ring-emerald-500/10'
                              : 'bg-white/75 border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                            }`}
                          placeholder="Nome de Usuário (login)"
                        />
                        {checkingUsername && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-[#BF2429]/30 border-t-[#BF2429] animate-spin" />
                          </div>
                        )}
                      </div>
                      {usernameStatus?.checked && usernameStatus.taken && (
                        <p className="text-[10px] text-red-500 font-bold px-1 text-left -mt-2">
                          Este nome de usuário já está em uso.
                        </p>
                      )}
                      {usernameStatus?.checked && !usernameStatus.taken && (
                        <p className="text-[10px] text-emerald-600 font-semibold px-1 text-left -mt-2">
                          Nome de usuário disponível.
                        </p>
                      )}

                      {/* Email */}
                      <div className="group relative">
                        <Mail className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isEmailTaken
                          ? 'text-red-500'
                          : emailStatus?.checked && !emailStatus.taken
                            ? 'text-emerald-600'
                            : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                          }`} />
                        <input
                          required
                          type="email"
                          value={regEmail}
                          onChange={(e) => {
                            setRegEmail(e.target.value);
                            if (error) setError(null);
                          }}
                          className={`w-full rounded-[16px] py-3.5 pl-10 pr-10 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isEmailTaken
                            ? 'bg-white/75 border-red-500 focus:border-red-600 focus:ring-red-500/10'
                            : emailStatus?.checked && !emailStatus.taken
                              ? 'bg-emerald-500/[0.02] border-emerald-500/35 focus:border-emerald-500 focus:ring-emerald-500/10'
                              : 'bg-white/75 border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                            }`}
                          placeholder="Email"
                        />
                        {checkingEmail && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-[#BF2429]/30 border-t-[#BF2429] animate-spin" />
                          </div>
                        )}
                      </div>
                      {emailStatus?.checked && emailStatus.taken && (
                        <p className="text-[10px] text-red-500 font-bold px-1 text-left -mt-2">
                          Este email já está cadastrado.
                        </p>
                      )}
                      {emailStatus?.checked && !emailStatus.taken && (
                        <p className="text-[10px] text-emerald-600 font-semibold px-1 text-left -mt-2">
                          Email disponível.
                        </p>
                      )}

                      {/* Senha & Confirmar Senha */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="group relative">
                          <Lock className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isPasswordError
                            ? 'text-red-500'
                            : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                            }`} />
                          <input
                            required
                            type="password"
                            value={regSenha}
                            onChange={(e) => {
                              setRegSenha(e.target.value);
                              if (error) setError(null);
                            }}
                            className={`w-full rounded-[16px] bg-white/75 py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isPasswordError
                              ? 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
                              : 'border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                              }`}
                            placeholder="Senha"
                          />
                        </div>
                        <div className="group relative">
                          <Lock className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isPasswordError
                            ? 'text-red-500'
                            : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                            }`} />
                          <input
                            required
                            type="password"
                            value={regConfirmaSenha}
                            onChange={(e) => {
                              setRegConfirmaSenha(e.target.value);
                              if (error) setError(null);
                            }}
                            className={`w-full rounded-[16px] bg-white/75 py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isPasswordError
                              ? 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
                              : 'border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                              }`}
                            placeholder="Confirmar"
                          />
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        className="w-full rounded-full py-[15px] text-[14px] font-bold tracking-wide text-white transition-all active:scale-[0.97] mt-2"
                        style={{
                          background: 'linear-gradient(175deg, #e8383c 0%, #a91b1f 100%)',
                          boxShadow: '0 0 0 2.5px rgba(255,255,255,0.28), 0 10px 28px rgba(191,36,41,0.44), inset 0 1px 0 rgba(255,255,255,0.3)'
                        }}
                      >
                        <span className="flex items-center justify-center gap-2">
                          CONFIRMAR CADASTRO
                        </span>
                      </motion.button>

                      {/* Voltar */}
                      <div className="flex items-center justify-center gap-4 pt-1">
                        <button
                          type="button"
                          onClick={() => setMembroStep(1)}
                          className="text-[11px] font-semibold text-[#414141]/50 hover:text-[#414141]/80 transition-colors focus:outline-none flex items-center gap-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Passo anterior
                        </button>
                        <span className="text-[#414141]/15 text-xs">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRegister(false);
                            setError(null);
                            setMembroStep(1);
                          }}
                          className="text-[11px] font-semibold text-[#BF2429]/60 hover:text-[#BF2429] transition-colors focus:outline-none"
                        >
                          Já tenho conta
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>
            ) : (
              /* TERREIRO REGISTRATION FORM (3-STEP GLASSMORPHIC WIZARD) */
              <motion.form
                key="register-terreiro"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                onSubmit={handleTerreiroRegisterSubmit}
                className="relative z-10"
              >
                {error ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-2xl border border-red-500/15 bg-red-500/10 px-4 py-2.5 text-red-700 mb-3"
                  >
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-[13px] font-bold">{error}</p>
                  </motion.div>
                ) : null}

                <AnimatePresence mode="wait">
                  {regStep === 1 ? (
                    /* STEP 1: TERREIRO DETAILS */
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.14, ease: 'easeOut' }}
                      className="space-y-3 pb-1"
                    >
                      {/* Nome do Terreiro */}
                      <div className="group relative">
                        <User className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isTerreiroNomeError
                          ? 'text-red-500'
                          : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                          }`} />
                        <input
                          required
                          type="text"
                          value={regTerreiroNome}
                          onChange={(e) => {
                            setRegTerreiroNome(e.target.value);
                            if (error) setError(null);
                          }}
                          className={`w-full rounded-[16px] bg-white/75 py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isTerreiroNomeError
                            ? 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
                            : 'border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                            }`}
                          placeholder="Nome do Terreiro"
                        />
                      </div>


                      {/* Sigla do Terreiro */}
                      <div className="group relative">
                        <Hash className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${(isTerreiroStep1Missing && !regTerreiroSigla)
                          ? 'text-red-500'
                          : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                          }`} />
                        <input
                          required
                          type="text"
                          maxLength={8}
                          value={regTerreiroSigla}
                          onChange={(e) => {
                            setRegTerreiroSigla(e.target.value.replace(/\s+/g, '').toUpperCase());
                            if (error) setError(null);
                          }}
                          className={`w-full rounded-[16px] bg-white/75 py-3.5 pl-10 pr-4 text-[14px] font-black uppercase tracking-[0.12em] outline-none transition-all placeholder:text-[#414141]/35 placeholder:normal-case placeholder:tracking-normal focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${(isTerreiroStep1Missing && !regTerreiroSigla)
                            ? 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
                            : 'border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                            }`}
                          placeholder="Sigla do terreiro (ex: T7CA)"
                        />
                      </div>
                      <p className="text-[10px] text-[#414141]/45 font-medium px-1 -mt-1">
                        Abreviação exibida na barra superior do app para seus membros
                      </p>

                      {/* Celular */}
                      <div className="group relative">
                        <Phone className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isTerreiroCelularError
                          ? 'text-red-500'
                          : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                          }`} />
                        <input
                          required
                          type="tel"
                          value={regTerreiroCelular}
                          onChange={(e) => {
                            setRegTerreiroCelular(formatCelular(e.target.value));
                            if (error) setError(null);
                          }}
                          className={`w-full rounded-[16px] bg-white/75 py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isTerreiroCelularError
                            ? 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
                            : 'border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                            }`}
                          placeholder="Celular"
                        />
                      </div>

                      {/* Cidade & Estado */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 group relative">
                          <MapPin className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isTerreiroCidadeError
                            ? 'text-red-500'
                            : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                            }`} />
                          <input
                            required
                            type="text"
                            value={regTerreiroCidade}
                            onChange={(e) => {
                              setRegTerreiroCidade(e.target.value);
                              if (error) setError(null);
                            }}
                            className={`w-full rounded-[16px] bg-white/75 py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isTerreiroCidadeError
                              ? 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
                              : 'border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                              }`}
                            placeholder="Cidade"
                          />
                        </div>
                        <div className="group relative">
                          <Compass className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isTerreiroEstadoError
                            ? 'text-red-500'
                            : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                            }`} />
                          <input
                            required
                            type="text"
                            maxLength={2}
                            value={regTerreiroEstado}
                            onChange={(e) => {
                              setRegTerreiroEstado(e.target.value);
                              if (error) setError(null);
                            }}
                            className={`w-full rounded-[16px] bg-white/75 py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border text-center uppercase ${isTerreiroEstadoError
                              ? 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
                              : 'border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                              }`}
                            placeholder="UF"
                          />
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        onClick={handleTerreiroNext}
                        className="w-full rounded-full py-[15px] text-[14px] font-bold tracking-wide text-white transition-all active:scale-[0.97] mt-2"
                        style={{
                          background: 'linear-gradient(175deg, #e8383c 0%, #a91b1f 100%)',
                          boxShadow: '0 0 0 2.5px rgba(255,255,255,0.28), 0 10px 28px rgba(191,36,41,0.44), inset 0 1px 0 rgba(255,255,255,0.3)'
                        }}
                      >
                        <span className="flex items-center justify-center gap-2">
                          AVANÇAR
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-80"><path d="M5 3l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                      </motion.button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsRegister(false);
                            setError(null);
                            setRegStep(1);
                          }}
                          className="text-[11px] font-semibold text-[#BF2429]/60 hover:text-[#BF2429] transition-colors focus:outline-none"
                        >
                          Já tem uma conta?{' '}
                          <span className="font-black underline underline-offset-2">Fazer Login</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : regStep === 2 ? (
                    /* STEP 2: ADMIN / CREATOR DETAILS — avança para step 3 */
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.14, ease: 'easeOut' }}
                      className="space-y-3 pb-1"
                    >
                      {/* Dirigente */}
                      <div className="group relative">
                        <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#BF2429] transition-colors" />
                        <input
                          required
                          type="text"
                          value={regTerreiroDirigente}
                          onChange={(e) => setRegTerreiroDirigente(e.target.value)}
                          className="w-full rounded-[16px] bg-white/75 py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 border border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-4 focus:ring-[#BF2429]/5 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)]"
                          placeholder="Nome do Dirigente"
                        />
                      </div>

                      {/* Username Admin */}
                      <div className="group relative">
                        <User className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isUsernameTaken
                          ? 'text-red-500'
                          : usernameStatus?.checked && !usernameStatus.taken
                            ? 'text-emerald-600'
                            : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                          }`} />
                        <input
                          required
                          type="text"
                          value={regTerreiroUsername}
                          onChange={(e) => {
                            setRegTerreiroUsername(e.target.value.replace(/\s+/g, '').toLowerCase());
                            if (error) setError(null);
                          }}
                          className={`w-full rounded-[16px] py-3.5 pl-10 pr-10 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isUsernameTaken
                            ? 'bg-white/75 border-red-500 focus:border-red-600 focus:ring-red-500/10'
                            : usernameStatus?.checked && !usernameStatus.taken
                              ? 'bg-emerald-500/[0.02] border-emerald-500/35 focus:border-emerald-500 focus:ring-emerald-500/10'
                              : 'bg-white/75 border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                            }`}
                          placeholder="Nome de Usuário Admin (login)"
                        />
                        {checkingUsername && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-[#BF2429]/30 border-t-[#BF2429] animate-spin" />
                          </div>
                        )}
                      </div>
                      {usernameStatus?.checked && usernameStatus.taken && (
                        <p className="text-[10px] text-red-500 font-bold px-1 text-left -mt-2">
                          Este nome de usuário já está em uso.
                        </p>
                      )}
                      {usernameStatus?.checked && !usernameStatus.taken && (
                        <p className="text-[10px] text-emerald-600 font-semibold px-1 text-left -mt-2">
                          Nome de usuário disponível.
                        </p>
                      )}

                      {/* Email Admin */}
                      <div className="group relative">
                        <Mail className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isEmailTaken
                          ? 'text-red-500'
                          : emailStatus?.checked && !emailStatus.taken
                            ? 'text-emerald-600'
                            : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                          }`} />
                        <input
                          required
                          type="email"
                          value={regTerreiroEmail}
                          onChange={(e) => {
                            setRegTerreiroEmail(e.target.value);
                            if (error) setError(null);
                          }}
                          className={`w-full rounded-[16px] py-3.5 pl-10 pr-10 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isEmailTaken
                            ? 'bg-white/75 border-red-500 focus:border-red-600 focus:ring-red-500/10'
                            : emailStatus?.checked && !emailStatus.taken
                              ? 'bg-emerald-500/[0.02] border-emerald-500/35 focus:border-emerald-500 focus:ring-emerald-500/10'
                              : 'bg-white/75 border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                            }`}
                          placeholder="Email Admin"
                        />
                        {checkingEmail && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-[#BF2429]/30 border-t-[#BF2429] animate-spin" />
                          </div>
                        )}
                      </div>
                      {emailStatus?.checked && emailStatus.taken && (
                        <p className="text-[10px] text-red-500 font-bold px-1 text-left -mt-2">
                          Este email já está cadastrado.
                        </p>
                      )}
                      {emailStatus?.checked && !emailStatus.taken && (
                        <p className="text-[10px] text-emerald-600 font-semibold px-1 text-left -mt-2">
                          Email disponível.
                        </p>
                      )}

                      {/* Senha & Confirmar Senha */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="group relative">
                          <Lock className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isPasswordError
                            ? 'text-red-500'
                            : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                            }`} />
                          <input
                            required
                            type="password"
                            value={regTerreiroSenha}
                            onChange={(e) => {
                              setRegTerreiroSenha(e.target.value);
                              if (error) setError(null);
                            }}
                            className={`w-full rounded-[16px] bg-white/75 py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isPasswordError
                              ? 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
                              : 'border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                              }`}
                            placeholder="Senha"
                          />
                        </div>
                        <div className="group relative">
                          <Lock className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isPasswordError
                            ? 'text-red-500'
                            : 'text-zinc-400 group-focus-within:text-[#BF2429]'
                            }`} />
                          <input
                            required
                            type="password"
                            value={regTerreiroConfirmaSenha}
                            onChange={(e) => {
                              setRegTerreiroConfirmaSenha(e.target.value);
                              if (error) setError(null);
                            }}
                            className={`w-full rounded-[16px] bg-white/75 py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none transition-all placeholder:text-[#414141]/35 focus:bg-white focus:ring-4 text-[#414141] shadow-[0_1px_2px_rgba(0,0,0,0.015)] border ${isPasswordError
                              ? 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
                              : 'border-amber-950/15 focus:border-[#BF2429]/40 focus:bg-white focus:ring-[#BF2429]/5'
                              }`}
                            placeholder="Confirmar"
                          />
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        onClick={handleTerreiroNext2}
                        className="w-full rounded-full py-[15px] text-[14px] font-bold tracking-wide text-white transition-all active:scale-[0.97] mt-2"
                        style={{
                          background: 'linear-gradient(175deg, #e8383c 0%, #a91b1f 100%)',
                          boxShadow: '0 0 0 2.5px rgba(255,255,255,0.28), 0 10px 28px rgba(191,36,41,0.44), inset 0 1px 0 rgba(255,255,255,0.3)'
                        }}
                      >
                        <span className="flex items-center justify-center gap-2">
                          AVANÇAR
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-80"><path d="M5 3l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                      </motion.button>

                      {/* Navegação */}
                      <div className="flex items-center justify-center gap-4 pt-1">
                        <button
                          type="button"
                          onClick={() => setRegStep(1)}
                          className="text-[11px] font-semibold text-[#414141]/50 hover:text-[#414141]/80 transition-colors focus:outline-none flex items-center gap-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Passo anterior
                        </button>
                        <span className="text-[#414141]/15 text-xs">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRegister(false);
                            setError(null);
                            setRegStep(1);
                          }}
                          className="text-[11px] font-semibold text-[#BF2429]/60 hover:text-[#BF2429] transition-colors focus:outline-none"
                        >
                          Já tenho conta
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* STEP 3: THEME COLOR SELECTION */
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.14, ease: 'easeOut' }}
                      className="space-y-4 pb-1"
                    >
                      {/* Step 3 header */}
                      <div className="text-center space-y-1 pt-1 pb-2">
                        <p className="text-[13px] font-black text-[#414141] tracking-tight">Escolha a Cor do seu Terreiro</p>
                        <p className="text-[11px] text-[#414141]/50 font-medium leading-relaxed">
                          Essa cor define o fundo aurora da Home para todos os membros do <strong className="text-[#414141]/70">{regTerreiroSigla || 'seu terreiro'}</strong>
                        </p>
                      </div>

                      {/* Color Grid */}
                      <div className="grid grid-cols-4 gap-3">
                        {([
                          { hex: '#BF2429', label: 'Vermelho' },
                          { hex: '#1565c0', label: 'Azul' },
                          { hex: '#1a7a4a', label: 'Verde' },
                          { hex: '#6B21A8', label: 'Roxo' },
                          { hex: '#B45309', label: 'Dourado' },
                          { hex: '#BE185D', label: 'Rosa' },
                          { hex: '#0891B2', label: 'Ciano' },
                          { hex: '#C2410C', label: 'Laranja' },
                        ] as const).map(({ hex, label }) => {
                          const isSelected = regTerreiroCorTema === hex;
                          return (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => setRegTerreiroCorTema(hex)}
                              className="flex flex-col items-center gap-1.5 focus:outline-none group"
                            >
                              <div
                                className={`relative w-full aspect-square rounded-[18px] transition-all duration-200 ${isSelected ? 'scale-105' : 'scale-100 hover:scale-102 opacity-80 hover:opacity-100'}`}
                                style={{
                                  background: `linear-gradient(135deg, ${hex}cc, ${hex})`,
                                  boxShadow: isSelected
                                    ? `0 0 0 3px white, 0 0 0 5px ${hex}, 0 8px 20px ${hex}66`
                                    : `0 4px 12px ${hex}44`
                                }}
                              >
                                {isSelected && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </div>
                                )}
                              </div>
                              <span className={`text-[9px] font-bold tracking-wide transition-colors ${isSelected ? 'text-[#414141]' : 'text-[#414141]/45'}`}>
                                {label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Preview */}
                      <div
                        className="w-full rounded-[20px] overflow-hidden h-[60px] relative"
                        style={{ background: '#f5f5f5' }}
                      >
                        <div
                          className="absolute w-[90%] h-[160%] rounded-full blur-[30px] -top-[30%] -left-[10%]"
                          style={{ background: regTerreiroCorTema + 'cc', transition: 'background 0.4s ease' }}
                        />
                        <div
                          className="absolute w-[70%] h-[160%] rounded-full blur-[25px] -top-[20%] -right-[15%]"
                          style={{ background: regTerreiroCorTema + '99', transition: 'background 0.4s ease' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[11px] font-black text-white/90 tracking-widest uppercase" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                            Preview — {regTerreiroSigla || 'SIGLA'}
                          </span>
                        </div>
                      </div>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        className="w-full rounded-full py-[15px] text-[14px] font-bold tracking-wide text-white transition-all active:scale-[0.97] mt-1"
                        style={{
                          background: `linear-gradient(175deg, ${regTerreiroCorTema}ee, ${regTerreiroCorTema})`,
                          boxShadow: `0 0 0 2.5px rgba(255,255,255,0.28), 0 10px 28px ${regTerreiroCorTema}70, inset 0 1px 0 rgba(255,255,255,0.3)`
                        }}
                      >
                        <span className="flex items-center justify-center gap-2">
                          CADASTRAR TERREIRO
                        </span>
                      </motion.button>

                      {/* Navegação */}
                      <div className="flex items-center justify-center gap-4 pt-1">
                        <button
                          type="button"
                          onClick={() => setRegStep(2)}
                          className="text-[11px] font-semibold text-[#414141]/50 hover:text-[#414141]/80 transition-colors focus:outline-none flex items-center gap-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Passo anterior
                        </button>
                        <span className="text-[#414141]/15 text-xs">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRegister(false);
                            setError(null);
                            setRegStep(1);
                          }}
                          className="text-[11px] font-semibold text-[#BF2429]/60 hover:text-[#BF2429] transition-colors focus:outline-none"
                        >
                          Já tenho conta
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Success Modal Backdrop & Dialog */}
      <AnimatePresence>
        {successData?.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={successData.onDone}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 w-full max-w-[340px] rounded-[32px] bg-white p-6 shadow-2xl flex flex-col items-center text-center border border-zinc-100"
            >
              {/* Checkmark Badge Icon matching reference image */}
              <div className="relative flex items-center justify-center w-20 h-20 mb-5">
                <svg className="w-full h-full text-green-100 fill-current drop-shadow-sm" viewBox="0 0 24 24">
                  <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12z" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-10 w-10 text-green-600" strokeWidth={3.5} />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">
                {successData.title}
              </h3>

              {/* Message */}
              <p className="text-[13px] font-semibold text-zinc-500 leading-relaxed px-2 mb-4">
                {successData.message}
              </p>

              {/* Email confirmation notice */}
              <div className="w-full mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/15 flex items-start gap-2.5 text-left">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
                    Confirmação Necessária
                  </span>
                  <p className="text-[11px] font-medium text-amber-700 leading-normal">
                    Enviamos um link de ativação para o e-mail cadastrado. Por favor, verifique sua caixa de entrada (e pasta de spam) para confirmar a conta antes de fazer o login.
                  </p>
                </div>
              </div>

              {/* Invitation Code for Terreiro */}
              {successData.inviteCode && (
                <div className="w-full mb-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col items-center gap-1.5">
                  <span className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">
                    Código de Convite
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-wider text-zinc-800 font-mono">
                      {successData.inviteCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(successData.inviteCode ?? '');
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="p-1.5 rounded-lg hover:bg-zinc-200/50 text-zinc-400 hover:text-zinc-600 active:scale-95 transition-all flex items-center gap-1.5 min-w-[36px]"
                    >
                      {copiedCode ? (
                        <span className="text-[9px] font-black text-green-600 uppercase tracking-wider">Copiado!</span>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={successData.onDone}
                className="w-full py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-black tracking-widest uppercase shadow-lg shadow-zinc-900/10 hover:shadow-zinc-900/20 active:scale-[0.97] transition-all"
              >
                Concluir
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        /* Custom hide scrollbar */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
