import { useState, FormEvent, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Upload, ImagePlus, User, Hash, Phone, MapPin, Compass, Sparkles, AlertCircle } from 'lucide-react';
import { Terreiro } from '../types';
import { supabase } from '../lib/supabase';
import { useAppData } from '../context/AppDataContext';

interface PerfilTerreiroModalProps {
  isOpen: boolean;
  onClose: () => void;
  terreiro: Terreiro | null;
}

const COLOR_OPTIONS = [
  { hex: '#BF2429', label: 'Vermelho', orixa: 'Exu & Iansã' },
  { hex: '#1565C0', label: 'Azul', orixa: 'Ogum & Iemanjá' },
  { hex: '#1A7A4A', label: 'Verde', orixa: 'Oxóssi' },
  { hex: '#6B21A8', label: 'Roxo', orixa: 'Nanã' },
  { hex: '#EAB308', label: 'Amarelo', orixa: 'Oxum' },
  { hex: '#BE185D', label: 'Rosa', orixa: 'Erês & Ewá' },
  { hex: '#B5A490', label: 'Bege', orixa: 'Oxalá' },
  { hex: '#C2410C', label: 'Laranja', orixa: 'Xangô' },
] as const;

const BRAZIL_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const BRAZIL_CITIES: { nome: string; uf: string }[] = [
  { nome: 'Salvador', uf: 'BA' },
  { nome: 'Feira de Santana', uf: 'BA' },
  { nome: 'Vitória da Conquista', uf: 'BA' },
  { nome: 'Camaçari', uf: 'BA' },
  { nome: 'Juazeiro', uf: 'BA' },
  { nome: 'Lauro de Freitas', uf: 'BA' },
  { nome: 'Itabuna', uf: 'BA' },
  { nome: 'Ilhéus', uf: 'BA' },
  { nome: 'Porto Seguro', uf: 'BA' },
  { nome: 'Barreiras', uf: 'BA' },
  { nome: 'Jequié', uf: 'BA' },
  { nome: 'Alagoinhas', uf: 'BA' },
  { nome: 'Simões Filho', uf: 'BA' },
  { nome: 'Paulo Afonso', uf: 'BA' },
  { nome: 'Santo Antônio de Jesus', uf: 'BA' },
  { nome: 'Valença', uf: 'BA' },
  { nome: 'Candeias', uf: 'BA' },
  { nome: 'Guanambi', uf: 'BA' },
  { nome: 'Jacobina', uf: 'BA' },
  { nome: 'Serrinha', uf: 'BA' },
  { nome: 'Senhor do Bonfim', uf: 'BA' },
  { nome: 'Dias d\'Ávila', uf: 'BA' },
  { nome: 'Luís Eduardo Magalhães', uf: 'BA' },
  { nome: 'Itapetinga', uf: 'BA' },
  { nome: 'Irecê', uf: 'BA' },
  { nome: 'São Paulo', uf: 'SP' },
  { nome: 'Campinas', uf: 'SP' },
  { nome: 'Santos', uf: 'SP' },
  { nome: 'São Bernardo do Campo', uf: 'SP' },
  { nome: 'Santo André', uf: 'SP' },
  { nome: 'Osasco', uf: 'SP' },
  { nome: 'Ribeirão Preto', uf: 'SP' },
  { nome: 'Sorocaba', uf: 'SP' },
  { nome: 'São José dos Campos', uf: 'SP' },
  { nome: 'Guarulhos', uf: 'SP' },
  { nome: 'Rio de Janeiro', uf: 'RJ' },
  { nome: 'Niterói', uf: 'RJ' },
  { nome: 'Duque de Caxias', uf: 'RJ' },
  { nome: 'Nova Iguaçu', uf: 'RJ' },
  { nome: 'São Gonçalo', uf: 'RJ' },
  { nome: 'Petrópolis', uf: 'RJ' },
  { nome: 'Cabo Frio', uf: 'RJ' },
  { nome: 'Belo Horizonte', uf: 'MG' },
  { nome: 'Uberlândia', uf: 'MG' },
  { nome: 'Juiz de Fora', uf: 'MG' },
  { nome: 'Contagem', uf: 'MG' },
  { nome: 'Montes Claros', uf: 'MG' },
  { nome: 'Brasília', uf: 'DF' },
  { nome: 'Curitiba', uf: 'PR' },
  { nome: 'Londrina', uf: 'PR' },
  { nome: 'Porto Alegre', uf: 'RS' },
  { nome: 'Caxias do Sul', uf: 'RS' },
  { nome: 'Recife', uf: 'PE' },
  { nome: 'Olinda', uf: 'PE' },
  { nome: 'Caruaru', uf: 'PE' },
  { nome: 'Fortaleza', uf: 'CE' },
  { nome: 'Belém', uf: 'PA' },
  { nome: 'Manaus', uf: 'AM' },
  { nome: 'Goiânia', uf: 'GO' },
  { nome: 'São Luís', uf: 'MA' },
  { nome: 'Maceió', uf: 'AL' },
  { nome: 'Natal', uf: 'RN' },
  { nome: 'Campo Grande', uf: 'MS' },
  { nome: 'Teresina', uf: 'PI' },
  { nome: 'João Pessoa', uf: 'PB' },
  { nome: 'Aracaju', uf: 'SE' },
  { nome: 'Cuiabá', uf: 'MT' },
  { nome: 'Florianópolis', uf: 'SC' },
  { nome: 'Vitória', uf: 'ES' },
  { nome: 'Macapá', uf: 'AP' },
  { nome: 'Porto Velho', uf: 'RO' },
  { nome: 'Boa Vista', uf: 'RR' },
  { nome: 'Rio Branco', uf: 'AC' },
  { nome: 'Palmas', uf: 'TO' },
];

export default function PerfilTerreiroModal({ isOpen, onClose, terreiro }: PerfilTerreiroModalProps) {
  const { currentAccount } = useAppData();
  const [nome, setNome] = useState(terreiro?.nome || '');
  const [sigla, setSigla] = useState(terreiro?.sigla || '');
  const [dirigente, setDirigente] = useState(terreiro?.dirigente || '');
  const [contato, setContato] = useState(terreiro?.contato || '');
  const [cidade, setCidade] = useState(terreiro?.cidade || '');
  const [estado, setEstado] = useState(terreiro?.estado || '');
  const [corTema, setCorTema] = useState(terreiro?.corTema || '#BF2429');
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(terreiro?.logoUrl || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const filteredCitySuggestions = useMemo(() => {
    const query = cidade.trim().toLowerCase();
    if (!query) return [];
    return BRAZIL_CITIES.filter(c => 
      c.nome.toLowerCase().includes(query) &&
      (!estado || c.uf.toUpperCase() === estado.toUpperCase())
    ).slice(0, 6);
  }, [cidade, estado]);

  if (!isOpen || !terreiro) return null;

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!terreiro) return;
    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      let updatedLogoUrl = logoPreview || terreiro?.logoUrl || '';

      // Upload new logo if selected
      if (logoFile) {
        const ext = logoFile.name.split('.').pop()?.toLowerCase() || 'webp';
        const path = `${terreiro.id}/logo_${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('terreiros')
          .upload(path, logoFile, { contentType: logoFile.type, upsert: true });

        if (uploadError) throw uploadError;
        updatedLogoUrl = supabase.storage.from('terreiros').getPublicUrl(path).data.publicUrl;
      }

      // Update Terreiro in Database
      const { error: updateError } = await supabase
        .from('terreiros')
        .update({
          nome: nome.trim(),
          sigla: sigla.trim().toUpperCase(),
          dirigente: dirigente.trim(),
          contato: contato.trim(),
          cidade: cidade.trim(),
          estado: estado.trim().toUpperCase(),
          cor_tema: corTema,
          logo_url: updatedLogoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', terreiro.id);

      if (updateError) throw updateError;

      // Update dirigente name in account profile if modified
      if (currentAccount?.id && dirigente.trim()) {
        await supabase
          .from('accounts')
          .update({ nome: dirigente.trim() })
          .eq('id', currentAccount.id);
      }

      setSuccessMessage('Perfil do Terreiro atualizado com sucesso!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar o perfil do terreiro.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full max-w-[420px] rounded-[36px] bg-white p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] no-scrollbar border border-zinc-100 text-[#414141]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 transition-colors duration-300" style={{ color: corTema }} />
              <h3 className="text-xl font-bold tracking-tight text-[#242424]">
                Perfil do Terreiro
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-black/50 hover:text-black transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="overflow-y-auto no-scrollbar space-y-4 pt-4 pb-2">
            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-bold text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-bold text-emerald-700">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                <p>{successMessage}</p>
              </div>
            )}

            {/* Live Home Welcome Card Preview */}
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-black text-[#414141]/50 uppercase tracking-wider">
                Pré-visualização da sua Home
              </span>
              <div
                className="relative w-full rounded-[24px] p-4 text-white overflow-hidden shadow-lg border border-white/20 transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, ${corTema} 0%, #111111 100%)`,
                }}
              >
                {/* Dynamic Aurora glow background inside preview */}
                <div
                  className="absolute w-[120%] h-[120%] rounded-full blur-[22px] -top-[30%] -left-[20%] opacity-90 transition-colors duration-500 pointer-events-none"
                  style={{ background: corTema }}
                />
                <div
                  className="absolute w-[80%] h-[80%] rounded-full blur-[18px] -bottom-[20%] -right-[10%] opacity-70 transition-colors duration-500 pointer-events-none"
                  style={{ background: corTema }}
                />

                {/* Header of mini-card */}
                <div className="relative z-10 flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-white/20 border border-white/40 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        <img src="/img/login/icone.webp" alt="Logo" className="h-5 w-5 object-contain brightness-0 invert" />
                      )}
                    </div>
                    <span className="text-[13px] font-black tracking-widest uppercase font-inter drop-shadow-sm">
                      {sigla || 'SIGLA'}
                    </span>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full border-2 border-white" />
                  </div>
                </div>

                {/* Dirigente Welcome text */}
                <div className="relative z-10 space-y-1 my-1">
                  <h4 className="text-[20px] font-normal leading-none font-behind-it italic text-white/95 drop-shadow-md">
                    Olá pai {dirigente ? dirigente.split(' ')[0] : 'Dirigente'}
                  </h4>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 border border-white/15 px-2.5 py-0.5 text-[8.5px] font-bold tracking-wider font-mono">
                    CONVITE: {terreiro.id.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Logo / Profile Photo Upload */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-[#414141]/75 flex items-center gap-1.5">
                <ImagePlus className="h-3.5 w-3.5 transition-colors duration-300" style={{ color: corTema }} />
                Foto de Perfil / Logo do Terreiro
              </label>
              <div className="flex items-center gap-3">
                <label 
                  className="flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-2xl border border-dashed bg-black/[0.02] hover:bg-black/[0.04] py-3 px-4 text-[12px] font-bold transition-all active:scale-98"
                  style={{ borderColor: corTema + '55', color: corTema }}
                >
                  <Upload className="h-4 w-4" />
                  <span className="truncate max-w-[180px]">
                    {logoFile ? logoFile.name : 'Trocar foto de perfil'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (!file.type.startsWith('image/')) {
                          setError('Selecione um arquivo de imagem.');
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          setError('A imagem deve ter no máximo 5 MB.');
                          return;
                        }
                        setLogoFile(file);
                        setLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
                {logoPreview && (
                  <div className="relative h-11 w-11 rounded-2xl border border-black/10 overflow-hidden bg-white shrink-0 shadow-sm">
                    <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Color Palette Choice */}
            <div className="space-y-2 text-left pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#414141]/75 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 transition-colors duration-300" style={{ color: corTema }} />
                  Cor de Tema da Home (Aurora)
                </label>
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/[0.04] text-[#414141]/70 border border-black/5">
                  {COLOR_OPTIONS.find(c => c.hex.toLowerCase() === corTema.toLowerCase())?.orixa || 'Orixá'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3.5 p-1 pt-2 pb-1">
                {COLOR_OPTIONS.map(({ hex, label, orixa }) => {
                  const isSelected = corTema.toLowerCase() === hex.toLowerCase();
                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setCorTema(hex)}
                      className="flex flex-col items-center gap-1.5 focus:outline-none group relative"
                    >
                      <div
                        className={`relative w-full aspect-square rounded-[18px] transition-all duration-200 ${
                          isSelected ? 'scale-100 shadow-md' : 'scale-95 opacity-80 hover:opacity-100 hover:scale-100'
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${hex}ee, ${hex})`,
                          outline: isSelected ? `2.5px solid ${hex}` : 'none',
                          outlineOffset: '2.5px',
                          boxShadow: isSelected ? `0 6px 18px ${hex}45` : `0 2px 6px ${hex}20`
                        }}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white drop-shadow-sm" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div className="text-center leading-none">
                        <p className={`text-[9.5px] font-extrabold tracking-tight transition-colors ${isSelected ? 'text-[#242424]' : 'text-[#414141]/55'}`}>
                          {label}
                        </p>
                        <p className="text-[7.5px] font-bold text-[#414141]/40 uppercase tracking-tighter mt-0.5 truncate max-w-[65px]">
                          {orixa}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Terreiro Info Fields */}
            <div className="space-y-3 pt-2">
              <div className="group relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  required
                  type="text"
                  value={dirigente}
                  onChange={(e) => setDirigente(e.target.value)}
                  className="w-full rounded-[16px] bg-black/[0.03] py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none border border-black/10 focus:border-[#BF2429]/40 focus:bg-white text-[#414141]"
                  placeholder="Nome do Dirigente"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 group relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    required
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full rounded-[16px] bg-black/[0.03] py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none border border-black/10 focus:border-[#BF2429]/40 focus:bg-white text-[#414141]"
                    placeholder="Nome do Terreiro"
                  />
                </div>
                <div className="group relative">
                  <Hash className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    required
                    type="text"
                    maxLength={8}
                    value={sigla}
                    onChange={(e) => setSigla(e.target.value.toUpperCase())}
                    className="w-full rounded-[16px] bg-black/[0.03] py-3.5 pl-9 pr-3 text-[13px] font-black uppercase outline-none border border-black/10 focus:border-[#BF2429]/40 focus:bg-white text-[#414141] text-center"
                    placeholder="Sigla"
                  />
                </div>
              </div>

              {/* Cidade & UF */}
              <div className="grid grid-cols-3 gap-3 relative z-30">
                <div className="col-span-2 group relative">
                  <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    required
                    type="text"
                    value={cidade}
                    onFocus={() => setShowCityDropdown(true)}
                    onChange={(e) => {
                      setCidade(e.target.value);
                      setShowCityDropdown(true);
                    }}
                    className="w-full rounded-[16px] bg-black/[0.03] py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none border border-black/10 focus:border-[#BF2429]/40 focus:bg-white text-[#414141]"
                    placeholder="Cidade"
                  />
                  {showCityDropdown && filteredCitySuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-2xl bg-white border border-black/10 shadow-xl overflow-hidden max-h-40 overflow-y-auto no-scrollbar">
                      {filteredCitySuggestions.map((item, idx) => (
                        <button
                          key={`${item.nome}-${item.uf}-${idx}`}
                          type="button"
                          onClick={() => {
                            setCidade(item.nome);
                            setEstado(item.uf);
                            setShowCityDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-[12px] font-semibold text-[#414141] hover:bg-[#BF2429]/10 hover:text-[#BF2429] flex items-center justify-between border-b border-black/[0.03] last:border-none"
                        >
                          <span>{item.nome}</span>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-black/5">{item.uf}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="group relative">
                  <Compass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <select
                    required
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full appearance-none rounded-[16px] bg-black/[0.03] py-3.5 pl-9 pr-6 text-[13px] font-black outline-none border border-black/10 focus:border-[#BF2429]/40 focus:bg-white text-[#414141] text-center uppercase cursor-pointer"
                  >
                    <option value="" disabled>UF</option>
                    {BRAZIL_UFS.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="group relative">
                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  required
                  type="tel"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  className="w-full rounded-[16px] bg-black/[0.03] py-3.5 pl-10 pr-4 text-[14px] font-semibold outline-none border border-black/10 focus:border-[#BF2429]/40 focus:bg-white text-[#414141]"
                  placeholder="Telefone / Celular de Contato"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full py-4 text-[13px] font-black tracking-wider uppercase text-white transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
                style={{
                  background: `linear-gradient(175deg, ${corTema}ee, ${corTema})`,
                  boxShadow: `0 8px 25px ${corTema}60`
                }}
              >
                {saving ? 'SALVANDO ALTERAÇÕES...' : 'SALVAR E APLICAR PERFIL'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
