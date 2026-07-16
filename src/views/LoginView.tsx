import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Mail, Lock, User, Phone, Hash, MapPin, Compass, Check, X, Eye, EyeOff } from 'lucide-react';
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
  'https://i.pinimg.com/1200x/ff/27/66/ff2766b9a007eccd8a89d69c3624d505.jpg',
  '/img/login/oxumlogin.webp',
  '/img/login/oxalalogin.webp',
  '/img/login/yemanjalogin.webp',
];

const formatCelular = (value: string) => {
  const digits = value.replace(/\D/g, '');
  const trimmed = digits.slice(0, 11);
  if (trimmed.length <= 2) return trimmed;
  if (trimmed.length <= 7) return `${trimmed.slice(0, 2)} ${trimmed.slice(2)}`;
  return `${trimmed.slice(0, 2)} ${trimmed.slice(2, 7)}-${trimmed.slice(7)}`;
};

export default function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);
  const [prevBg, setPrevBg] = useState(0);

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

  // Terreiro Registration states (Split into 2 Steps)
  const [regStep, setRegStep] = useState(1);
  const [membroStep, setMembroStep] = useState(1);
  const [regTerreiroDirigente, setRegTerreiroDirigente] = useState('');
  const [regTerreiroUsername, setRegTerreiroUsername] = useState('');
  const [regTerreiroNome, setRegTerreiroNome] = useState('');
  const [regTerreiroEmail, setRegTerreiroEmail] = useState('');
  const [regTerreiroCelular, setRegTerreiroCelular] = useState('');
  const [regTerreiroCidade, setRegTerreiroCidade] = useState('');
  const [regTerreiroEstado, setRegTerreiroEstado] = useState('');
  const [regTerreiroSenha, setRegTerreiroSenha] = useState('');
  const [regTerreiroConfirmaSenha, setRegTerreiroConfirmaSenha] = useState('');

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
        let identifier = val;

        // If it looks like a username (no @), resolve to email first
        if (!val.includes('@')) {
          const { data: profile } = await supabase
            .from('accounts')
            .select('email, terreiro_id')
            .ilike('username', val)
            .maybeSingle();

          if (profile?.terreiro_id) {
            // Directly found terreiro via username
            const { data: terreiro } = await supabase
              .from('terreiros')
              .select('id, nome')
              .eq('id', profile.terreiro_id)
              .single();
            setDetectedTerreiro(terreiro ?? null);
            setIsDetecting(false);
            return;
          }
          // If no terreiro_id, this is a global admin or unknown user
          setDetectedTerreiro(null);
          setIsDetecting(false);
          return;
        }

        // It's an email — look up the account
        const { data: profile } = await supabase
          .from('accounts')
          .select('terreiro_id')
          .ilike('email', identifier)
          .maybeSingle();

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
        const { data: existingUser } = await supabase
          .from('accounts')
          .select('id')
          .ilike('username', userVal)
          .maybeSingle();

        setUsernameStatus({
          checked: true,
          taken: Boolean(existingUser)
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
        const { data: existingEmail } = await supabase
          .from('accounts')
          .select('id')
          .ilike('email', emailVal)
          .maybeSingle();

        setEmailStatus({
          checked: true,
          taken: Boolean(existingEmail)
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

    // Check if username is already taken
    if (regUsername.trim()) {
      const { data: existingUser, error: lookupError } = await supabase
        .from('accounts')
        .select('id')
        .ilike('username', regUsername.trim())
        .maybeSingle();

      if (lookupError || existingUser) {
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

    const newUserId = `user_membro_${Date.now()}`;

    // Register user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: regEmail.trim(),
      password: regSenha,
      options: {
        data: {
          nome: regNome,
          username: regUsername.trim().toLowerCase(),
          scope: matchedTerreiroId ? 'terreiro' : 'global',
          role: 'terreiro_user',
          terreiroId: matchedTerreiroId,
          userId: newUserId,
        }
      }
    });

    if (signUpError) {
      const msg = signUpError.message;
      setError(msg === '{}' || !msg ? 'Ocorreu um erro ao criar a conta. É possível que este e-mail já esteja em uso.' : msg);
      return;
    }

    // Insert user info into public.users table
    if (signUpData.user) {
      const { error: dbError } = await supabase.from('users').insert({
        id: newUserId,
        nome: `${regNome} ${regSobrenome}`,
        email: regEmail.trim(),
        telefone: regNumero,
        role: 'membro',
        status: 'ativo',
        terreiro_id: matchedTerreiroId || null,
        access_account_id: signUpData.user.id,
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

    // Check if admin username is already taken
    if (regTerreiroUsername.trim()) {
      const { data: existingUser, error: lookupError } = await supabase
        .from('accounts')
        .select('id')
        .ilike('username', regTerreiroUsername.trim())
        .maybeSingle();

      if (lookupError || existingUser) {
        setError('Este nome de usuário do administrador já está em uso.');
        return;
      }
    }

    // Generate unique short code for invite, e.g. T4891
    const newTerreiroId = 'T' + Math.floor(1000 + Math.random() * 9000);

    // Register admin user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: regTerreiroEmail.trim(),
      password: regTerreiroSenha,
      options: {
        data: {
          nome: regTerreiroDirigente,
          username: regTerreiroUsername.trim().toLowerCase(),
          scope: 'terreiro',
          role: 'terreiro_admin',
          terreiroId: newTerreiroId,
        }
      }
    });

    if (signUpError) {
      const msg = signUpError.message;
      setError(msg === '{}' || !msg ? 'Ocorreu um erro ao registrar o terreiro. É possível que este e-mail já esteja cadastrado.' : msg);
      return;
    }

    // Insert new Terreiro details
    if (signUpData.user) {
      const { error: dbError } = await supabase.from('terreiros').insert({
        id: newTerreiroId,
        nome: regTerreiroNome,
        cidade: regTerreiroCidade,
        estado: regTerreiroEstado.toUpperCase(),
        dirigente: regTerreiroDirigente,
        contato: regTerreiroCelular,
        observacoes: 'Terreiro cadastrado pelo portal público.',
        ativo: true,
        access_account_id: signUpData.user.id,
      });

      if (dbError) {
        const msg = dbError.message;
        setError(msg === '{}' || !msg ? 'Ocorreu um erro ao salvar as configurações do terreiro.' : msg);
        return;
      }
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
        setRegTerreiroEmail('');
        setRegTerreiroCelular('');
        setRegTerreiroCidade('');
        setRegTerreiroEstado('');
        setRegTerreiroSenha('');
        setRegTerreiroConfirmaSenha('');
        setSuccessData(null);
      }
    });
  }

  function handleTerreiroNext() {
    if (!regTerreiroNome || !regTerreiroCelular || !regTerreiroCidade || !regTerreiroEstado) {
      setError('Preencha os dados do terreiro para continuar.');
      return;
    }
    setError(null);
    setRegStep(2);
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
                    { logo: '/img/logo-T7CA.webp', label: 'Pai', user: 'erick', pass: '123456', isIle: false },
                    { logo: '/img/logo-T7CA.webp', label: 'Filho', user: 'membro', pass: '123456', isIle: false },
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
      <div className={`relative mx-4 mb-2 p-1.5 rounded-[44px] bg-white/5 border border-white/15 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.25)] z-10 overflow-hidden transition-all duration-[250ms] ease-[0.23,1,0.32,1] ${isRegister ? 'min-h-[78vh] flex flex-col justify-center' : ''
        }`}>

        {/* Double Bezel Inner Core Card */}
        <motion.div
          layout
          className={`relative rounded-[38px] px-6 pt-6 pb-5 overflow-hidden transition-all duration-[250ms] ease-[0.23,1,0.32,1] ${isRegister
            ? 'min-h-[76vh] flex flex-col justify-start gap-4 border border-white/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]'
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
                      ? 'linear-gradient(180deg, #1565c0 0%, #0d47a1 100%)'
                      : 'linear-gradient(180deg, #BF2429 0%, #991b1d 100%)',
                  }}
                  transition={{ duration: 0.25 }}
                  className="group relative w-full overflow-hidden rounded-[22px] py-4 text-[13px] font-black tracking-[0.2em] text-white transition-all active:scale-[0.96] mt-5 border-t border-white/20 shadow-lg"
                  style={{
                    boxShadow: isT7CA
                      ? '0 6px 20px rgba(13, 71, 161, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                      : '0 6px 20px rgba(191, 36, 41, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                  <span className="relative flex items-center justify-center gap-2">
                    {detectedTerreiro ? `ENTRAR NO ${detectedShortName}` : 'ENTRAR'}
                  </span>
                </motion.button>

                <div className="text-center mt-4">
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
                          placeholder="Celular"
                        />
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
                          placeholder="Cód. Terreiro (Opcional)"
                        />
                        {isDetectingMemberTerreiro && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-[#BF2429]/30 border-t-[#BF2429] animate-spin" />
                          </div>
                        )}
                      </div>

                      {detectedMemberTerreiro ? (
                        <motion.div
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-500/10 border border-emerald-500/15 rounded-xl px-3 py-2 -mt-1 text-left"
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                          <span>
                            Terreiro localizado: <strong className="font-black">{detectedMemberTerreiro.nome} ({detectedMemberTerreiro.id.toUpperCase()})</strong>
                          </span>
                        </motion.div>
                      ) : regCodigoTerreiro.trim().length >= 3 && !isDetectingMemberTerreiro ? (
                        <motion.div
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1.5 text-[10px] text-red-700 bg-red-500/10 border border-red-500/15 rounded-xl px-3 py-2 -mt-1 text-left"
                        >
                          <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                          <span>
                            Código inválido ou não encontrado.
                          </span>
                        </motion.div>
                      ) : (
                        <p className="text-[10px] text-zinc-500/75 leading-relaxed px-1 text-left -mt-1">
                          O código de convite é fornecido pelo dirigente (pai ou mãe de santo) do seu terreiro para vincular sua conta diretamente a ele.
                        </p>
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
                        className="group relative w-full overflow-hidden rounded-[16px] py-4 text-[13px] font-black tracking-[0.2em] text-white transition-all active:scale-[0.96] border-t border-white/20 shadow-lg bg-gradient-to-b from-[#BF2429] to-[#991b1d] hover:from-[#d9383d] hover:to-[#bf2429] mt-2"
                        style={{
                          boxShadow: '0 6px 20px rgba(191, 36, 41, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                      >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                        <span className="relative flex items-center justify-center gap-2">
                          AVANÇAR
                        </span>
                      </motion.button>
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
                        className="group relative w-full overflow-hidden rounded-[16px] py-4 text-[13px] font-black tracking-[0.2em] text-white transition-all active:scale-[0.96] border-t border-white/20 shadow-lg bg-gradient-to-b from-[#BF2429] to-[#991b1d] hover:from-[#d9383d] hover:to-[#bf2429] mt-2"
                        style={{
                          boxShadow: '0 6px 20px rgba(191, 36, 41, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                      >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                        <span className="relative flex items-center justify-center gap-2">
                          CONFIRMAR CADASTRO
                        </span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Back controls */}
                <div className="text-center mt-4">
                  {membroStep === 2 && (
                    <button
                      type="button"
                      onClick={() => setMembroStep(1)}
                      className="text-xs font-semibold text-[#BF2429]/70 hover:text-[#BF2429] transition-colors focus:outline-none block mx-auto mb-1.5"
                    >
                      ← Voltar para o Passo 1
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setError(null);
                      setMembroStep(1);
                    }}
                    className="text-xs font-semibold text-[#BF2429]/70 hover:text-[#BF2429] transition-colors focus:outline-none"
                  >
                    Já tem uma conta? Fazer Login.
                  </button>
                </div>
              </motion.form>
            ) : (
              /* TERREIRO REGISTRATION FORM (2-STEP GLASSMORPHIC WIZARD) */
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
                        className="group relative w-full overflow-hidden rounded-[16px] py-4 text-[13px] font-black tracking-[0.2em] text-white transition-all active:scale-[0.96] border-t border-white/20 shadow-lg bg-gradient-to-b from-[#BF2429] to-[#991b1d] hover:from-[#d9383d] hover:to-[#bf2429] mt-2"
                        style={{
                          boxShadow: '0 6px 20px rgba(191, 36, 41, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                      >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                        <span className="relative flex items-center justify-center gap-2">
                          AVANÇAR
                        </span>
                      </motion.button>
                    </motion.div>
                  ) : (
                    /* STEP 2: ADMIN / CREATOR DETAILS */
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
                        type="submit"
                        className="group relative w-full overflow-hidden rounded-[16px] py-4 text-[13px] font-black tracking-[0.2em] text-white transition-all active:scale-[0.96] border-t border-white/20 shadow-lg bg-gradient-to-b from-[#BF2429] to-[#991b1d] hover:from-[#d9383d] hover:to-[#bf2429] mt-2"
                        style={{
                          boxShadow: '0 6px 20px rgba(191, 36, 41, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                      >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                        <span className="relative flex items-center justify-center gap-2">
                          CADASTRAR TERREIRO
                        </span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Back controls */}
                <div className="text-center mt-4">
                  {regStep === 2 && registerType === 'terreiro' ? (
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="text-xs font-semibold text-[#BF2429]/70 hover:text-[#BF2429] transition-colors focus:outline-none block mx-auto mb-1.5"
                    >
                      ← Voltar para o Passo 1
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setError(null);
                      setRegStep(1);
                    }}
                    className="text-xs font-semibold text-[#BF2429]/70 hover:text-[#BF2429] transition-colors focus:outline-none"
                  >
                    Já tem uma conta? Fazer Login.
                  </button>
                </div>
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
