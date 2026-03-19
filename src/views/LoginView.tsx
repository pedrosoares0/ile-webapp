import { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loadAppData } from '../lib/storage';

const LOGIN_BACKGROUNDS = ['/img/fundo-hero1.png', '/img/fundo-hero4.jpg', '/img/fundo-hero7.jpg'];

export default function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const loginExamples = useMemo(() => {
    const data = loadAppData();
    const globalAccount = data.accounts.find((account) => account.scope === 'global') ?? null;
    const terreiroAdminAccount = data.accounts.find((account) => account.role === 'terreiro_admin' && !account.userId) ?? null;
    const terreiroUserAccount = data.accounts.find((account) => account.role === 'terreiro_user') ?? null;
    const getTerreiroName = (terreiroId: string) =>
      data.terreiros.find((terreiro) => terreiro.id === terreiroId)?.nome ?? 'Terreiro';

    return {
      globalAccount,
      terreiroAdminAccount,
      terreiroAdminName: terreiroAdminAccount ? getTerreiroName(terreiroAdminAccount.terreiroId) : null,
      terreiroUserAccount,
      terreiroUserName: terreiroUserAccount ? getTerreiroName(terreiroUserAccount.terreiroId) : null,
    };
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
    <div className="relative mx-auto min-h-screen max-w-[430px] overflow-hidden bg-[#fef7e7] font-inter text-[#414141] shadow-2xl">
      <div className="absolute inset-0">
        <img src={LOGIN_BACKGROUNDS[0]} alt="Login background" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,7,7,0.2)_0%,rgba(20,7,7,0.72)_52%,rgba(254,247,231,0.96)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-6 pb-10 pt-12">
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/15 shadow-lg backdrop-blur-md">
              <img src="/img/logo-T7CA.png" alt="Ilê" className="h-[82%] w-[82%] object-contain" />
            </div>
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.28em] text-[#fee3c5]/70">
              Sistema Ilê
            </p>
            <h1 className="mt-3 text-[46px] font-black leading-none text-[#fee3c5]">Entrar</h1>
            <p className="mt-4 max-w-[260px] text-[13px] font-medium leading-relaxed text-[#fee3c5]/75">
              Acesse com a conta do admin geral ou com a conta do seu terreiro.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[40px] border border-white/20 bg-black/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {error ? (
                <div className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/10 px-4 py-3 text-[#fee3c5]">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <p className="text-[13px] font-semibold leading-relaxed">{error}</p>
                </div>
              ) : null}

              <div>
                <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#fee3c5]/55">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#fee3c5]/35" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) {
                        setError(null);
                      }
                    }}
                    className="w-full rounded-[26px] border border-white/10 bg-white/10 px-14 py-4 font-bold text-[#fee3c5] placeholder:text-[#fee3c5]/30"
                    placeholder="voce@terreiro.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#fee3c5]/55">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#fee3c5]/35" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) {
                        setError(null);
                      }
                    }}
                    className="w-full rounded-[26px] border border-white/10 bg-white/10 px-14 py-4 font-bold text-[#fee3c5] placeholder:text-[#fee3c5]/30"
                    placeholder="Digite sua senha"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-[28px] bg-[#941c1c] py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-[#941c1c]/20 transition-all active:scale-[0.98]"
              >
                Entrar
              </button>
            </form>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-[#fee3c5]/80">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#fee3c5]/45">
                Acesso inicial
              </p>
              {loginExamples.globalAccount ? (
                <p className="mt-2 text-[13px] font-semibold">
                  Admin geral: <span className="font-mono">{loginExamples.globalAccount.email}</span> /{' '}
                  <span className="font-mono">{loginExamples.globalAccount.password}</span>
                </p>
              ) : null}
              {loginExamples.terreiroAdminAccount ? (
                <p className="mt-2 text-[13px] font-semibold">
                  Admin do terreiro {loginExamples.terreiroAdminName ?? 'demo'}:{' '}
                  <span className="font-mono">{loginExamples.terreiroAdminAccount.email}</span> /{' '}
                  <span className="font-mono">{loginExamples.terreiroAdminAccount.password}</span>
                </p>
              ) : null}
              {loginExamples.terreiroUserAccount ? (
                <p className="mt-2 text-[13px] font-semibold">
                  Usuário {loginExamples.terreiroUserName ?? 'demo'}:{' '}
                  <span className="font-mono">{loginExamples.terreiroUserAccount.email}</span> /{' '}
                  <span className="font-mono">{loginExamples.terreiroUserAccount.password}</span>
                </p>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
