import { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Copy, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loadAppData } from '../lib/storage';

const LOGIN_BACKGROUNDS = ['/img/fundo-hero1.png', '/img/fundo-hero4.jpg', '/img/fundo-hero7.jpg'];

export default function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loginExamples = useMemo(() => {
    return [
      { id: 'global', label: 'ADMIN GERAL', email: 'admin@ile.app', pass: '123456' },
      { id: 'admin', label: 'TERREIRO ADMIN', email: 't7ca@ile.app', pass: '123456' },
      { id: 'user', label: 'USUÁRIO', email: 'ana@ile.app', pass: '123456' }
    ];
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = login(email, password);

    if (!result.success) {
      setError(result.error ?? 'Não foi possível entrar.');
      return;
    }

    setError(null);
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-[430px] overflow-hidden bg-[#fef7e7] font-inter text-[#414141]">
      {/* Soft Background Accents - More Life */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -right-[5%] h-[400px] w-[400px] rounded-full bg-[#941c1c]/5 blur-[80px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[5%] -left-[10%] h-[350px] w-[350px] rounded-full bg-[#941c1c]/5 blur-[80px]" 
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-8 pb-12 pt-16">
        <div className="flex flex-1 flex-col">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative mb-4 h-28 w-28"
            >
              <img src="/img/logo-ile.webp" alt="Ilê" className="h-full w-full object-contain" />
            </motion.div>

            <motion.div
              animate={{ 
                y: [0, -4, 0],
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="mb-6 h-16 w-30"
            >
              <img src="/img/iconeObaluae.png" alt="Obaluaê" className="h-full w-full object-contain" />
            </motion.div>
            
            <div className="space-y-1">
              <h1 className="text-[52px] font-behind leading-tight tracking-tight text-[#941c1c]">
                Bem-vindo
              </h1>
              <p className="mx-auto max-w-[280px] text-[15px] font-medium leading-relaxed text-[#414141]/60">
                Acesse sua conta para gerenciar seu terreiro.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {error ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 rounded-2xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-red-600"
                >
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-[13px] font-medium">{error}</p>
                </motion.div>
              ) : null}

              <div className="space-y-4">
                <div className="group relative">
                  <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#414141]/20 transition-colors group-focus-within:text-[#941c1c]" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full rounded-[22px] border border-[#414141]/5 bg-white py-[18px] pl-14 pr-6 text-[15px] font-medium text-[#414141] outline-none transition-all placeholder:text-[#414141]/20 focus:border-[#941c1c]/20 focus:bg-white focus:ring-4 focus:ring-[#941c1c]/5"
                    placeholder="E-mail"
                  />
                </div>

                <div className="group relative">
                  <Lock className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#414141]/20 transition-colors group-focus-within:text-[#941c1c]" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full rounded-[22px] border border-[#414141]/5 bg-white py-[18px] pl-14 pr-6 text-[15px] font-medium text-[#414141] outline-none transition-all placeholder:text-[#414141]/20 focus:border-[#941c1c]/20 focus:bg-white focus:ring-4 focus:ring-[#941c1c]/5"
                    placeholder="Senha"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-[22px] bg-gradient-to-r from-[#941c1c] via-[#b52a2a] to-[#941c1c] bg-[length:200%_auto] py-5 text-[15px] font-bold tracking-[0.1em] text-white shadow-lg shadow-[#941c1c]/20 transition-all hover:shadow-[#941c1c]/40 hover:scale-[1.02] active:scale-[0.98] animate-[gradientMove_3s_linear_infinite]"
              >
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                
                {/* Inner Shimmer */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
                
                <span className="relative flex items-center justify-center gap-2">
                  ENTRAR
                </span>
              </button>
            </form>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[#414141]/5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#414141]/20">Acessos Rápidos</span>
                <div className="h-px flex-1 bg-[#414141]/5" />
              </div>
              
              <div className="grid gap-4">
                {loginExamples.map((hint) => (
                  <motion.div 
                    whileHover={{ y: -2 }}
                    key={hint.id} 
                    className="relative rounded-[28px] bg-white p-6 shadow-[0_10px_25px_rgba(0,0,0,0.03)] border border-[#414141]/5"
                  >
                    <span className="block mb-4 text-[10px] font-black uppercase tracking-[0.15em] text-[#414141]/30">
                      {hint.label}
                    </span>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-medium text-[#414141]/50 font-mono truncate">
                          {hint.email}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(hint.email, `${hint.id}-email`)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#414141]/5 text-[#414141]/30 transition-all hover:bg-[#941c1c]/10 hover:text-[#941c1c] active:scale-90"
                        >
                          {copiedId === `${hint.id}-email` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-medium text-[#414141]/50 font-mono">
                          {hint.pass}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(hint.pass, `${hint.id}-pass`)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#414141]/5 text-[#414141]/30 transition-all hover:bg-[#941c1c]/10 hover:text-[#941c1c] active:scale-90"
                        >
                          {copiedId === `${hint.id}-pass` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );


}
