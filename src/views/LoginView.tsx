import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Mail, Lock, User, Phone, Hash, MapPin, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const SLIDESHOW_IMAGES = [
  '/img/login/oxalalogin.webp',
  '/img/login/oxumlogin.webp',
  '/img/login/yemanjalogin.webp'
];

export default function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Smart Terreiro Recognition — debounced lookup against Supabase
  const [detectedTerreiro, setDetectedTerreiro] = useState<{ id: string; nome: string } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const isT7CA = Boolean(detectedTerreiro);

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
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [email, isRegister]);

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
        .or(`id.ilike.%${code}%,nome.ilike.%${code}%`)
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
      setError(signUpError.message);
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
        setError(dbError.message);
        return;
      }
    }

    alert(
      matchedTerreiroId
        ? 'Cadastro realizado com sucesso! Você foi vinculado ao seu Terreiro.'
        : 'Cadastro realizado com sucesso! Como você não usou código, terá acesso ao Hub Geral do Ilê.'
    );

    setIsRegister(false);
    setEmail(regEmail);
    setPassword(regSenha);
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
      setError(signUpError.message);
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
        setError(dbError.message);
        return;
      }
    }

    alert(`Terreiro cadastrado com sucesso!\nCódigo de convite para seus membros: ${newTerreiroId}`);

    setIsRegister(false);
    setEmail(regTerreiroEmail);
    setPassword(regTerreiroSenha);
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
    <div className={`relative mx-auto min-h-screen max-w-[430px] overflow-hidden bg-black font-inter text-[#414141] flex flex-col transition-all duration-[250ms] ease-[0.23,1,0.32,1] ${isRegister ? 'justify-center py-6' : 'justify-end pb-6'
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
              className="mx-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-white/70 hover:text-white transition-colors focus:outline-none"
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
                    { logo: '/img/logo-ile.webp', label: 'Adm Ilê', user: 'admin', pass: '123456', isIle: true },
                    { logo: '/img/logo-T7CA.png', label: 'Erick', user: 'erick', pass: '123456', isIle: false },
                    { logo: '/img/logo-T7CA.png', label: 'Membro', user: 'membro', pass: '123456', isIle: false },
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
                      <span className="text-[8px] font-bold text-white/60 tracking-wider uppercase group-hover:text-white/90 transition-colors">
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
          className={`relative rounded-[38px] px-6 pt-6 pb-5 border border-white/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45)] overflow-hidden transition-all duration-[250ms] ease-[0.23,1,0.32,1] ${isRegister ? 'min-h-[76vh] flex flex-col justify-between' : ''
            }`}
        >
          {/* Dynamic Background Gradient */}
          <div
            className="absolute inset-0 z-0 pointer-events-none transition-all duration-[250ms] ease-[0.23,1,0.32,1]"
            style={{
              background: isRegister
                ? registerType === 'terreiro'
                  ? 'linear-gradient(180deg, #8B0000 0%, #4a0000 100%)'
                  : 'linear-gradient(180deg, #FAF4E9 0%, #eadecc 100%)'
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
                transition={{ duration: 1.2 }}
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
                  className={`h-9 object-contain transition-all duration-[250ms] ease-[0.23,1,0.32,1] ${registerType === 'terreiro' ? 'brightness-0 invert-[0.9] sepia-[0.3] saturate-[1.5]' : ''
                    }`}
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
                    <img src="/img/logo-T7CA.png" alt="T7CA Logo" className="h-full w-full object-contain" />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.h1
                animate={{
                  color: isRegister
                    ? registerType === 'terreiro'
                      ? '#FAF4E9'
                      : '#8B0000'
                    : isT7CA
                      ? '#0d47a1'
                      : '#8B0000',
                }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="text-[34px] font-behind italic leading-none tracking-tight text-center"
              >
                {isRegister ? 'Cadastro' : 'Bem-Vindo'}
              </motion.h1>
            </div>

            {/* Registration Mode Selector (Membro vs Terreiro) */}
            {isRegister && (
              <div className={`relative flex p-1 rounded-full mb-3 w-full max-w-[280px] mx-auto border transition-colors duration-[250ms] ${registerType === 'terreiro'
                ? 'bg-black/25 border-white/10'
                : 'bg-black/5 border-black/5'
                }`}>
                {/* Active sliding background */}
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-y-1 rounded-full shadow-sm"
                  animate={{
                    left: registerType === 'membro' ? 4 : 'calc(50% + 2px)',
                    width: 'calc(50% - 6px)',
                    backgroundColor: registerType === 'membro' ? '#8B0000' : '#FAF4E9'
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />

                <button
                  type="button"
                  onClick={() => {
                    setRegisterType('membro');
                    setError(null);
                  }}
                  className={`relative z-10 w-1/2 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all duration-300 text-center ${registerType === 'membro'
                    ? 'text-white font-extrabold'
                    : 'text-white/50 hover:text-white/80 font-medium'
                    }`}
                >
                  Membro
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRegisterType('terreiro');
                    setError(null);
                  }}
                  className={`relative z-10 w-1/2 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all duration-300 text-center ${registerType === 'terreiro'
                    ? 'text-[#8B0000] font-extrabold'
                    : 'text-[#8B0000]/50 hover:text-[#8B0000] font-medium'
                    }`}
                >
                  Terreiro
                </button>
              </div>
            )}

            {/* Step indicator for Terreiro mode */}
            {isRegister && registerType === 'terreiro' && (
              <span className="text-[9px] font-extrabold tracking-widest text-[#FAF4E9]/60 uppercase mb-3 block">
                Passo {regStep} de 2
              </span>
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
                className="space-y-3 relative z-10"
              >
                {error ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-2xl border border-red-500/10 bg-red-500/5 px-4 py-2.5 text-red-600"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-[13px] font-medium">{error}</p>
                  </motion.div>
                ) : null}

                <div className="space-y-2.5">
                  {/* Email Input */}
                  <div className="group relative">
                    <Mail className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isT7CA
                      ? 'text-[#0d47a1]/25 group-focus-within:text-[#0d47a1]'
                      : 'text-[#8B0000]/25 group-focus-within:text-[#8B0000]'
                      }`} />
                    <input
                      required
                      type="text"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (error) setError(null);
                      }}
                      className={`w-full rounded-[22px] bg-white/90 py-3.5 pl-10 pr-6 text-[15px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),_0_2px_5px_rgba(0,0,0,0.015)] ${isT7CA
                        ? 'text-[#0d47a1] border-[#0d47a1]/15 focus:border-[#0d47a1]/40 focus:bg-white focus:ring-4 focus:ring-[#0d47a1]/5'
                        : 'text-[#414141] border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5'
                        }`}
                      placeholder="Email ou Usuário"
                    />
                    {/* Detecting indicator */}
                    <AnimatePresence>
                      {isDetecting && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          <div className="h-3.5 w-3.5 rounded-full border-2 border-[#0d47a1]/30 border-t-[#0d47a1] animate-spin" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password Input */}
                  <div className="group relative">
                    <Lock className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isT7CA
                      ? 'text-[#0d47a1]/25 group-focus-within:text-[#0d47a1]'
                      : 'text-[#8B0000]/25 group-focus-within:text-[#8B0000]'
                      }`} />
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (error) setError(null);
                      }}
                      className={`w-full rounded-[22px] bg-white/90 py-3.5 pl-10 pr-6 text-[15px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),_0_2px_5px_rgba(0,0,0,0.015)] ${isT7CA
                        ? 'text-[#0d47a1] border-[#0d47a1]/15 focus:border-[#0d47a1]/40 focus:bg-white focus:ring-4 focus:ring-[#0d47a1]/5'
                        : 'text-[#414141] border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5'
                        }`}
                      placeholder="Senha"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  animate={{
                    background: isT7CA
                      ? 'linear-gradient(180deg, #1565c0 0%, #0d47a1 100%)'
                      : 'linear-gradient(180deg, #b21e1e 0%, #800000 100%)',
                  }}
                  transition={{ duration: 0.8 }}
                  className="group relative w-full overflow-hidden rounded-[22px] py-4 text-[13px] font-bold tracking-[0.2em] text-white transition-all active:scale-[0.96] mt-4 border-t border-white/20 shadow-lg"
                  style={{
                    boxShadow: isT7CA
                      ? '0 6px 20px rgba(13, 71, 161, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                      : '0 6px 20px rgba(139, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                  <span className="relative flex items-center justify-center gap-2">
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
                      : 'text-[#8B0000]/70 hover:text-[#8B0000]'
                      }`}
                  >
                    Não tem uma conta? Faça seu cadastro agora.
                  </button>
                </div>
              </motion.form>
            ) : registerType === 'membro' ? (
              /* MEMBER REGISTRATION FORM */
              <motion.form
                key="register-membro"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                onSubmit={handleMemberRegisterSubmit}
                className="space-y-3.5 relative z-10"
              >
                {error ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-2xl border border-red-500/10 bg-red-500/5 px-4 py-2.5 text-red-600"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-[13px] font-medium">{error}</p>
                  </motion.div>
                ) : null}

                <div className="space-y-2.5 max-h-[46vh] overflow-y-auto pr-0.5 no-scrollbar pb-1">
                  {/* Nome & Sobrenome */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="group relative">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/25 group-focus-within:text-[#8B0000]" />
                      <input
                        required
                        type="text"
                        value={regNome}
                        onChange={(e) => setRegNome(e.target.value)}
                        className="w-full rounded-[22px] bg-white/90 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                        placeholder="Nome"
                      />
                    </div>
                    <div className="group relative">
                      <input
                        required
                        type="text"
                        value={regSobrenome}
                        onChange={(e) => setRegSobrenome(e.target.value)}
                        className="w-full rounded-[22px] bg-white/90 py-3 px-5 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                        placeholder="Sobrenome"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="group relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/25 group-focus-within:text-[#8B0000]" />
                    <input
                      required
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                      className="w-full rounded-[22px] bg-white/90 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                      placeholder="Nome de Usuário (login)"
                    />
                  </div>

                  {/* Email */}
                  <div className="group relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/25 group-focus-within:text-[#8B0000]" />
                    <input
                      required
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full rounded-[22px] bg-white/90 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                      placeholder="Email"
                    />
                  </div>

                  {/* Celular & Código do Terreiro (Opcional) */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="group relative">
                      <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/25 group-focus-within:text-[#8B0000]" />
                      <input
                        required
                        type="tel"
                        value={regNumero}
                        onChange={(e) => setRegNumero(e.target.value)}
                        className="w-full rounded-[22px] bg-white/90 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                        placeholder="Celular"
                      />
                    </div>
                    <div className="group relative">
                      <Hash className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/25 group-focus-within:text-[#8B0000]" />
                      <input
                        type="text"
                        value={regCodigoTerreiro}
                        onChange={(e) => setRegCodigoTerreiro(e.target.value)}
                        className="w-full rounded-[22px] bg-white/90 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                        placeholder="Cód. Terreiro (Opcional)"
                      />
                    </div>
                  </div>

                  {/* Senha & Confirmar Senha */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="group relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/25 group-focus-within:text-[#8B0000]" />
                      <input
                        required
                        type="password"
                        value={regSenha}
                        onChange={(e) => setRegSenha(e.target.value)}
                        className="w-full rounded-[22px] bg-white/90 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                        placeholder="Senha"
                      />
                    </div>
                    <div className="group relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/25 group-focus-within:text-[#8B0000]" />
                      <input
                        required
                        type="password"
                        value={regConfirmaSenha}
                        onChange={(e) => setRegConfirmaSenha(e.target.value)}
                        className="w-full rounded-[22px] bg-white/90 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                        placeholder="Confirmar"
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="group relative w-full overflow-hidden rounded-[22px] py-3.5 text-[13px] font-bold tracking-[0.2em] text-white transition-all active:scale-[0.96] border-t border-white/20 shadow-lg bg-gradient-to-b from-[#b21e1e] to-[#800000]"
                  style={{
                    boxShadow: '0 6px 20px rgba(139, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                  <span className="relative flex items-center justify-center gap-2">
                    CADASTRAR MEMBRO
                  </span>
                </motion.button>

                <div className="text-center mt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setError(null);
                    }}
                    className="text-xs font-semibold text-[#8B0000]/70 hover:text-[#8B0000] transition-colors focus:outline-none"
                  >
                    Já tem uma conta? Fazer Login.
                  </button>
                </div>
              </motion.form>
            ) : (
              /* TERREIRO REGISTRATION FORM (2 STEPS WITH CLEAN WHITE INPUTS) */
              <motion.form
                key="register-terreiro"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                onSubmit={handleTerreiroRegisterSubmit}
                className="space-y-3.5 relative z-10"
              >
                {error ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-[#FAF4E9]"
                  >
                    <AlertCircle className="h-4 w-4 text-[#FAF4E9]" />
                    <p className="text-[13px] font-medium">{error}</p>
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
                      className="space-y-2.5 pb-1"
                    >
                      {/* Nome do Terreiro */}
                      <div className="group relative">
                        <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/35 group-focus-within:text-[#8B0000]" />
                        <input
                          required
                          type="text"
                          value={regTerreiroNome}
                          onChange={(e) => {
                            setRegTerreiroNome(e.target.value);
                            if (error) setError(null);
                          }}
                          className="w-full rounded-[22px] bg-white/95 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                          placeholder="Nome do Terreiro"
                        />
                      </div>

                      {/* Celular */}
                      <div className="group relative">
                        <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/35 group-focus-within:text-[#8B0000]" />
                        <input
                          required
                          type="tel"
                          value={regTerreiroCelular}
                          onChange={(e) => {
                            setRegTerreiroCelular(e.target.value);
                            if (error) setError(null);
                          }}
                          className="w-full rounded-[22px] bg-white/95 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                          placeholder="Celular"
                        />
                      </div>

                      {/* Cidade & Estado */}
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="col-span-2 group relative">
                          <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/35 group-focus-within:text-[#8B0000]" />
                          <input
                            required
                            type="text"
                            value={regTerreiroCidade}
                            onChange={(e) => {
                              setRegTerreiroCidade(e.target.value);
                              if (error) setError(null);
                            }}
                            className="w-full rounded-[22px] bg-white/95 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                            placeholder="Cidade"
                          />
                        </div>
                        <div className="group relative">
                          <Compass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/35 group-focus-within:text-[#8B0000]" />
                          <input
                            required
                            type="text"
                            maxLength={2}
                            value={regTerreiroEstado}
                            onChange={(e) => {
                              setRegTerreiroEstado(e.target.value);
                              if (error) setError(null);
                            }}
                            className="w-full rounded-[22px] bg-white/95 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] text-center uppercase"
                            placeholder="UF"
                          />
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        onClick={handleTerreiroNext}
                        className="group relative w-full overflow-hidden rounded-[22px] py-3.5 text-[13px] font-bold tracking-[0.2em] text-[#8B0000] transition-all active:scale-[0.96] border-t border-white/20 shadow-lg bg-gradient-to-b from-[#FAF4E9] to-[#ebdcb9] mt-3"
                        style={{
                          boxShadow: '0 6px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)'
                        }}
                      >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
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
                      className="space-y-2.5 pb-1"
                    >
                      {/* Dirigente */}
                      <div className="group relative">
                        <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/35 group-focus-within:text-[#8B0000]" />
                        <input
                          required
                          type="text"
                          value={regTerreiroDirigente}
                          onChange={(e) => setRegTerreiroDirigente(e.target.value)}
                          className="w-full rounded-[22px] bg-white/95 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                          placeholder="Nome do Dirigente"
                        />
                      </div>

                      {/* Username Admin */}
                      <div className="group relative">
                        <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/35 group-focus-within:text-[#8B0000]" />
                        <input
                          required
                          type="text"
                          value={regTerreiroUsername}
                          onChange={(e) => setRegTerreiroUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                          className="w-full rounded-[22px] bg-white/95 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                          placeholder="Nome de Usuário Admin (login)"
                        />
                      </div>

                      {/* Email Admin */}
                      <div className="group relative">
                        <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/35 group-focus-within:text-[#8B0000]" />
                        <input
                          required
                          type="email"
                          value={regTerreiroEmail}
                          onChange={(e) => setRegTerreiroEmail(e.target.value)}
                          className="w-full rounded-[22px] bg-white/95 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                          placeholder="Email Admin"
                        />
                      </div>

                      {/* Senha & Confirmar Senha */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="group relative">
                          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/35 group-focus-within:text-[#8B0000]" />
                          <input
                            required
                            type="password"
                            value={regTerreiroSenha}
                            onChange={(e) => setRegTerreiroSenha(e.target.value)}
                            className="w-full rounded-[22px] bg-white/95 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                            placeholder="Senha"
                          />
                        </div>
                        <div className="group relative">
                          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/35 group-focus-within:text-[#8B0000]" />
                          <input
                            required
                            type="password"
                            value={regTerreiroConfirmaSenha}
                            onChange={(e) => setRegTerreiroConfirmaSenha(e.target.value)}
                            className="w-full rounded-[22px] bg-white/95 py-3 pl-10 pr-4 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/25 border border-[#8B0000]/15 focus:border-[#8B0000]/40 focus:bg-white focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                            placeholder="Confirmar"
                          />
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        className="group relative w-full overflow-hidden rounded-[22px] py-3.5 text-[13px] font-bold tracking-[0.2em] text-[#8B0000] transition-all active:scale-[0.96] border-t border-white/20 shadow-lg bg-gradient-to-b from-[#FAF4E9] to-[#ebdcb9] mt-3"
                        style={{
                          boxShadow: '0 6px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)'
                        }}
                      >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                        <span className="relative flex items-center justify-center gap-2">
                          CADASTRAR TERREIRO
                        </span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Back controls */}
                <div className="text-center mt-2.5">
                  {regStep === 2 && registerType === 'terreiro' ? (
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="text-xs font-semibold text-[#FAF4E9]/75 hover:text-white transition-colors focus:outline-none block mx-auto mb-1.5"
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
                    className={`text-xs font-semibold transition-colors focus:outline-none ${registerType === 'terreiro' ? 'text-[#FAF4E9]/75 hover:text-white' : 'text-[#8B0000]/70 hover:text-[#8B0000]'
                      }`}
                  >
                    Já tem uma conta? Fazer Login.
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

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
