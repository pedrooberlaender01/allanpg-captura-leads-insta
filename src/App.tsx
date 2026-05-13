import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Clock,
  Users,
  Star,
  ArrowRight,
  Quote,
  Trophy,
  User,
  IdCard,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Search,
} from 'lucide-react';

type Screen = 'home' | 'step1' | 'step2' | 'step3' | 'step4' | 'success' | 'underage';

const PATH_BY_SCREEN: Record<Screen, string> = {
  home: '/',
  step1: '/name',
  step2: '/doc',
  step3: '/city',
  step4: '/contact',
  success: '/exito',
  underage: '/menor',
};

function screenFromPath(pathname: string): Screen {
  switch (pathname) {
    case '/name':    return 'step1';
    case '/doc':     return 'step2';
    case '/city':    return 'step3';
    case '/contact': return 'step4';
    case '/exito':   return 'success';
    case '/menor':   return 'underage';
    default:         return 'home';
  }
}

function isUnderage(fechaISO: string): boolean {
  if (!fechaISO) return false;
  const parts = fechaISO.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return false;
  const [y, m, d] = parts;
  const today = new Date();
  let age = today.getFullYear() - y;
  const monthIdx = m - 1;
  if (today.getMonth() < monthIdx || (today.getMonth() === monthIdx && today.getDate() < d)) {
    age -= 1;
  }
  return age < 18;
}

const STORAGE_KEY = 'allan-cabral-form-v1';

type PersistedForm = {
  nombre: string;
  dni: string;
  fecha: string;
  provincia: string;
  cidade: string;
  whatsapp: string;
  email: string;
  pass: string;
  pass2: string;
  acepta: boolean;
};

function loadForm(): PersistedForm {
  if (typeof window === 'undefined') return emptyForm();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyForm();
    return { ...emptyForm(), ...JSON.parse(raw) };
  } catch {
    return emptyForm();
  }
}

function emptyForm(): PersistedForm {
  return { nombre: '', dni: '', fecha: '', provincia: '', cidade: '', whatsapp: '', email: '', pass: '', pass2: '', acepta: false };
}

const ACTIVITY = [
  ['Fernando J.', 'participando pelo 0km'],
  ['Mariano S.', 'acabou de participar'],
  ['Bautista R.', 'acabou de participar'],
  ['Thiago G.', 'ganhou um prêmio em dinheiro'],
  ['Kevin S.', 'registrou sua entrada'],
  ['Emma P.', 'acabou de participar'],
  ['Lucas M.', 'participando pelo 0km'],
  ['Juan L.', 'participando pelo 0km'],
  ['Marcos G.', 'ganhou um prêmio em dinheiro'],
  ['Sofia M.', 'registrou sua entrada'],
  ['Rocio V.', 'acabou de participar'],
  ['Lucía F.', 'participando pelo 0km'],
  ['Julian C.', 'participando pelo 0km'],
  ['Martina B.', 'registrou sua entrada'],
  ['Delfina S.', 'acabou de participar'],
  ['Valentina D.', 'ganhou um prêmio em dinheiro'],
  ['Camila P.', 'ganhou um prêmio em dinheiro'],
  ['Esteban T.', 'participando pelo 0km'],
];

const ESTADOS_BR = [
  'Acre','Alagoas','Amapá','Amazonas','Bahia','Ceará','Distrito Federal','Espírito Santo',
  'Goiás','Maranhão','Mato Grosso','Mato Grosso do Sul','Minas Gerais','Pará','Paraíba',
  'Paraná','Pernambuco','Piauí','Rio de Janeiro','Rio Grande do Norte','Rio Grande do Sul',
  'Rondônia','Roraima','Santa Catarina','São Paulo','Sergipe','Tocantins',
];

const ESTADO_UF: Record<string, string> = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
  'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF',
  'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA',
  'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
  'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE',
  'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR',
  'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE',
  'Tocantins': 'TO',
};

// In-memory cache for IBGE city responses
const cityCache = new Map<string, string[]>();

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const screen = screenFromPath(location.pathname);

  const [cupos, setCupos] = useState(79);
  const [countdown, setCountdown] = useState(99); // 1:39 -> seconds

  // form state — hydrated from localStorage so refresh preserves user input
  const initial = useMemo(loadForm, []);
  const [nombre, setNombre] = useState(initial.nombre);
  const [dni, setDni] = useState(initial.dni);
  const [fecha, setFecha] = useState(initial.fecha);
  const [provincia, setProvincia] = useState(initial.provincia);
  const [cidade, setCidade] = useState(initial.cidade);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [email, setEmail] = useState(initial.email);
  const [pass, setPass] = useState(initial.pass);
  const [pass2, setPass2] = useState(initial.pass2);
  const [acepta, setAcepta] = useState(initial.acepta);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  // Persist form data on change
  useEffect(() => {
    try {
      const payload: PersistedForm = { nombre, dni, fecha, provincia, cidade, whatsapp, email, pass, pass2, acepta };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // localStorage unavailable — skip persistence
    }
  }, [nombre, dni, fecha, provincia, cidade, whatsapp, email, pass, pass2, acepta]);

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 119)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // sporadic cupo decrement
    const t = setInterval(() => setCupos((c) => Math.max(60, c - (Math.random() < 0.5 ? 1 : 0))), 7000);
    return () => clearInterval(t);
  }, []);

  const mmss = useMemo(() => {
    const m = Math.floor(countdown / 60);
    const s = countdown % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [countdown]);

  const passOk = pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass);
  const submitOk =
    whatsapp.trim().length > 0 &&
    /@/.test(email) &&
    pass.length > 0 &&
    pass === pass2 &&
    acepta;

  function goNext(target: Screen) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(PATH_BY_SCREEN[target]);
  }

  // Scroll to top on every navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-start overflow-x-hidden selection:bg-[#39FF14] selection:text-black">
      {/* Top sticky bar */}
      <div className="w-full sticky top-0 z-50 glass py-3 px-4 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 italic">AO VIVO</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-[#FFD700]" />
            <span className="text-xs font-mono font-bold text-[#FFD700]">{mmss}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-[#39FF14]" />
            <span className="text-xs font-black uppercase italic text-[#39FF14]">{cupos} VAGAS</span>
          </div>
        </div>
      </div>

      <main className="w-full max-w-md px-6 py-4 flex-grow flex flex-col items-center">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="w-full text-center space-y-6 mt-4 pb-20"
            >
              {/* Hero card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD700] to-[#39FF14] rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000" />
                <div className="relative overflow-hidden rounded-[2.5rem] glass border-white/20">
                  <img
                    alt="Allan Cabral"
                    className="w-full h-[450px] object-cover object-top"
                    src="/fotos/nico.jpeg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8">
                    <h1 className="text-4xl font-impact italic tracking-tighter leading-[0.85] uppercase text-white mb-2">
                      FALA GALERA <span className="text-[#FFD700]">REGISTRA AÍ E CONCORRE A UM IPHONE</span>
                    </h1>
                    <p className="text-[#39FF14] text-sm font-black uppercase tracking-widest italic mt-1 drop-shadow-md">
                      IPHONE ZERO NA SUA MÃO
                    </p>
                  </div>
                </div>
                <div className="absolute top-6 right-6 glass px-4 py-2 rounded-full border border-[#FFD700]/30 animate-bounce">
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-[#FFD700] fill-[#FFD700]" />
                    <span className="text-[10px] font-black uppercase italic">Oficial Allan Cabral</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-6">
                <button
                  onClick={() => goNext('step1')}
                  className="w-full py-5 bg-[#FFD700] text-black font-impact text-2xl rounded-2xl glow-gold hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase italic"
                >
                  QUERO MINHA VAGA AGORA <ArrowRight size={28} />
                </button>
              </div>

              {/* Activity feed */}
              <div className="pt-8 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#39FF14] italic">
                    Atividade ao Vivo
                  </h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-pulse shadow-[0_0_8px_#39FF14]" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Conectados</span>
                  </div>
                </div>
                <div className="relative h-44 overflow-hidden glass rounded-3xl border-white/10 py-2">
                  <div className="space-y-2 px-6 animate-scroll-up">
                    {[...ACTIVITY, ...ACTIVITY].map(([n, a], i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 py-2 border-b border-white/5 last:border-none"
                      >
                        <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full shadow-[0_0_5px_#39FF14]" />
                        <p className="text-[11px] font-bold text-white/90 italic tracking-tight uppercase leading-none">
                          {n}{' '}
                          <span className="text-gray-500 font-medium not-italic normal-case ml-1">{a}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />
                  <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
                </div>
              </div>

              {/* Testimonial */}
              <div className="glass p-6 rounded-3xl border-white/10 bg-gradient-to-br from-white/5 to-transparent text-left relative overflow-hidden">
                <Quote size={80} className="lucide-quote absolute -top-4 -right-4 text-[#FFD700] opacity-10" />
                <p className="text-sm italic font-medium text-gray-300 leading-relaxed relative z-10">
                  "Eu já ganhei, agora é minha vez de te ajudar a ganhar. Esses caras já estão curtindo seus prêmios,
                  o próximo pode ser você."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#FFD700] overflow-hidden">
                    <img className="w-full h-full object-cover" src="/fotos/nico.jpeg" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-[#FFD700]">Allan Cabral</p>
                    <p className="text-[8px] font-bold text-gray-500 uppercase">Fundador Allan Cabral</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {screen.startsWith('step') && (
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="w-full mt-4 pb-20"
            >
              <FormShell step={Number(screen.slice(-1)) as 1 | 2 | 3 | 4}>
                {screen === 'step1' && (
                  <FormStep1
                    value={nombre}
                    onChange={setNombre}
                    onNext={() => goNext('step2')}
                  />
                )}
                {screen === 'step2' && (
                  <FormStep2
                    dni={dni}
                    setDni={setDni}
                    fecha={fecha}
                    setFecha={setFecha}
                    onNext={() => goNext(isUnderage(fecha) ? 'underage' : 'step3')}
                  />
                )}
                {screen === 'step3' && (
                  <FormStep3
                    estado={provincia}
                    setEstado={setProvincia}
                    cidade={cidade}
                    setCidade={setCidade}
                    onNext={() => goNext('step4')}
                  />
                )}
                {screen === 'step4' && (
                  <FormStep4
                    whatsapp={whatsapp}
                    setWhatsapp={setWhatsapp}
                    email={email}
                    setEmail={setEmail}
                    pass={pass}
                    setPass={setPass}
                    pass2={pass2}
                    setPass2={setPass2}
                    acepta={acepta}
                    setAcepta={setAcepta}
                    showPass={showPass}
                    setShowPass={setShowPass}
                    showPass2={showPass2}
                    setShowPass2={setShowPass2}
                    submitOk={submitOk}
                    passOk={passOk}
                    onSubmit={() => goNext('success')}
                  />
                )}
              </FormShell>
            </motion.div>
          )}

          {screen === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full mt-4 pb-20"
            >
              <SuccessScreen />
            </motion.div>
          )}

          {screen === 'underage' && (
            <motion.div
              key="underage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full mt-4 pb-20"
            >
              <UnderageScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* fixed blur blobs */}
      <div className="fixed top-1/4 -right-32 w-80 h-80 bg-[#FFD700] opacity-[0.03] blur-[150px] rounded-full -z-10 pointer-events-none animate-pulse" />
      <div className="fixed bottom-1/4 -left-32 w-80 h-80 bg-[#39FF14] opacity-[0.03] blur-[150px] rounded-full -z-10 pointer-events-none" />
    </div>
  );
}

function FormShell({ step, children }: { step: 1 | 2 | 3 | 4; children: React.ReactNode }) {
  const pct = (step / 4) * 100;
  return (
    <div className="w-full space-y-6">
      {/* progress */}
      <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FFD700] to-[#39FF14] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full glass border-white/10 flex items-center justify-center">
          <Trophy size={18} className="text-[#FFD700]" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Próximo Nível</p>
          <p className="text-sm font-black text-[#39FF14] italic">FASE {step} / 4</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#FFD700]/20 via-transparent to-[#39FF14]/20 blur-md pointer-events-none" />
        <div className="relative glass rounded-3xl p-7 border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}

function StepTitle({ a, b, accent }: { a: string; b: string; accent: 'gold' | 'green' }) {
  return (
    <h2 className="text-2xl font-impact italic tracking-tighter leading-[0.95] uppercase">
      {a}{' '}
      <span className={accent === 'gold' ? 'text-[#FFD700]' : 'text-[#39FF14]'}>{b}</span>
    </h2>
  );
}

function Label({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-gray-300">
      <span className="text-[#FFD700]">{icon}</span>
      {children}
    </div>
  );
}

function FormStep1({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  const ok = value.trim().length >= 3;
  return (
    <div className="space-y-6">
      <StepTitle a="Primeiro o mais importante, fera." b="Em nome de quem coloco o prêmio?" accent="gold" />
      <div>
        <Label icon={<User size={12} />}>Nome completo</Label>
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escreva seu nome real..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-[#FFD700] outline-none transition text-xl font-bold italic placeholder:text-white/30 text-white"
        />
      </div>
      <button
        disabled={!ok}
        onClick={onNext}
        className="w-full py-5 bg-[#FFD700] text-black font-impact text-xl rounded-2xl glow-gold disabled:bg-white/10 disabled:text-white/30 disabled:glow-gold-none disabled:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase italic disabled:cursor-not-allowed"
      >
        Próximo passo <ArrowRight size={22} />
      </button>
    </div>
  );
}

function FormStep2({
  dni, setDni, fecha, setFecha, onNext,
}: {
  dni: string; setDni: (v: string) => void; fecha: string; setFecha: (v: string) => void; onNext: () => void;
}) {
  const ok = dni.replace(/\D/g, '').length === 11 && !!fecha;
  return (
    <div className="space-y-6">
      <StepTitle a="Preciso saber se você é maior de idade e" b="uma pessoa real." accent="gold" />
      <p className="text-xs italic font-medium text-gray-400 -mt-2">
        Aqui não jogamos com bots, aqui jogamos com gente que quer ganhar.
      </p>
      <div>
        <Label icon={<IdCard size={12} />}>Documento / CPF</Label>
        <input
          inputMode="numeric"
          value={dni}
          onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 11))}
          placeholder="Sem pontos nem traços"
          maxLength={11}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-[#FFD700] outline-none transition text-xl font-bold italic placeholder:text-white/30 text-white"
        />
        <p className="text-[10px] font-bold italic text-[#FFD700] mt-2">
          Dica: Seu documento é sua entrada no sorteio, não erre.
        </p>
      </div>
      <div>
        <Label icon={<Calendar size={12} />}>Data de nascimento</Label>
        <DatePicker value={fecha} onChange={setFecha} />
      </div>
      <button
        disabled={!ok}
        onClick={onNext}
        className="w-full py-5 bg-[#FFD700] text-black font-impact text-xl rounded-2xl glow-gold disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase italic disabled:cursor-not-allowed"
      >
        Próximo passo <ArrowRight size={22} />
      </button>
    </div>
  );
}

function FormStep3({
  estado, setEstado, cidade, setCidade, onNext,
}: {
  estado: string; setEstado: (v: string) => void;
  cidade: string; setCidade: (v: string) => void;
  onNext: () => void;
}) {
  const [cidades, setCidades] = useState<string[]>(() => {
    const uf = ESTADO_UF[estado];
    return uf && cityCache.has(uf) ? cityCache.get(uf)! : [];
  });
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [erroCidades, setErroCidades] = useState(false);

  useEffect(() => {
    if (!estado) { setCidades([]); return; }
    const uf = ESTADO_UF[estado];
    if (!uf) { setCidades([]); return; }
    if (cityCache.has(uf)) { setCidades(cityCache.get(uf)!); return; }

    let cancelled = false;
    setLoadingCidades(true);
    setErroCidades(false);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
      .then((r) => {
        if (!r.ok) throw new Error('IBGE fetch failed');
        return r.json();
      })
      .then((data: { nome: string }[]) => {
        if (cancelled) return;
        const list = data.map((c) => c.nome).sort((a, b) => a.localeCompare(b, 'pt-BR'));
        cityCache.set(uf, list);
        setCidades(list);
      })
      .catch(() => { if (!cancelled) setErroCidades(true); })
      .finally(() => { if (!cancelled) setLoadingCidades(false); });
    return () => { cancelled = true; };
  }, [estado]);

  function handleEstadoChange(v: string) {
    setEstado(v);
    if (v !== estado) setCidade('');
  }

  const ok = !!estado && !!cidade;

  return (
    <div className="space-y-6">
      <StepTitle a="De onde você está me seguindo?" b="Vamos mandar o prêmio." accent="gold" />
      <div>
        <Label icon={<MapPin size={12} />}>Estado</Label>
        <PickerSelect
          value={estado}
          onChange={handleEstadoChange}
          options={ESTADOS_BR.map((e) => ({ value: e, label: e }))}
          size="lg"
          placeholder="Escolha seu estado..."
          searchable
        />
      </div>

      {estado && (
        <div>
          <Label icon={<MapPin size={12} />}>Cidade</Label>
          {loadingCidades ? (
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-base font-bold italic text-white/40 flex items-center gap-3">
              <span className="inline-block w-3 h-3 rounded-full border-2 border-[#FFD700]/50 border-t-[#FFD700] animate-spin" />
              Carregando cidades...
            </div>
          ) : erroCidades ? (
            <input
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Digite sua cidade"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-[#FFD700] outline-none transition text-xl font-bold italic placeholder:text-white/30 text-white"
            />
          ) : (
            <PickerSelect
              value={cidade}
              onChange={setCidade}
              options={cidades.map((c) => ({ value: c, label: c }))}
              size="lg"
              placeholder="Escolha sua cidade..."
              searchable
            />
          )}
          {erroCidades && (
            <p className="text-[10px] font-bold italic text-[#FFD700] mt-2">
              Não consegui carregar a lista. Pode digitar manualmente.
            </p>
          )}
        </div>
      )}

      <button
        disabled={!ok}
        onClick={onNext}
        className="w-full py-5 bg-[#FFD700] text-black font-impact text-xl rounded-2xl glow-gold disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase italic disabled:cursor-not-allowed"
      >
        Próximo passo <ArrowRight size={22} />
      </button>
    </div>
  );
}

function FormStep4(props: {
  whatsapp: string; setWhatsapp: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  pass: string; setPass: (v: string) => void;
  pass2: string; setPass2: (v: string) => void;
  acepta: boolean; setAcepta: (v: boolean) => void;
  showPass: boolean; setShowPass: (v: boolean) => void;
  showPass2: boolean; setShowPass2: (v: boolean) => void;
  submitOk: boolean; passOk: boolean;
  onSubmit: () => void;
}) {
  const {
    whatsapp, setWhatsapp, email, setEmail, pass, setPass, pass2, setPass2,
    acepta, setAcepta, showPass, setShowPass, showPass2, setShowPass2,
    submitOk, passOk, onSubmit,
  } = props;
  return (
    <div className="space-y-6">
      <StepTitle a="Último passo," b="confira se os dados estão bem escritos." accent="green" />
      <p className="text-xs italic font-medium text-gray-400 -mt-2">
        Vamos criar sua conta automaticamente. Escolha uma senha pra sua conta.
      </p>
      <div>
        <Label icon={<Phone size={12} />}>WhatsApp (DDD + número)</Label>
        <input
          inputMode="tel"
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value.replace(/[^\d]/g, ''))}
          placeholder="11 91234 5678"
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-[#FFD700] outline-none transition text-lg font-bold italic placeholder:text-white/30 text-white"
        />
      </div>
      <div>
        <Label icon={<Mail size={12} />}>E-mail de contato</Label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@melhor-email.com"
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-[#FFD700] outline-none transition text-lg font-bold italic placeholder:text-white/30 text-white"
        />
      </div>
      <div>
        <Label icon={<Lock size={12} />}>Senha pra sua conta</Label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Escolha uma senha segura"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pr-14 focus:ring-2 focus:ring-[#FFD700] outline-none transition text-lg font-bold italic placeholder:text-white/30 text-white"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <PasswordStrength pass={pass} />
      </div>
      <div>
        <Label icon={<Lock size={12} />}>Confirmar senha</Label>
        <div className="relative">
          <input
            type={showPass2 ? 'text' : 'password'}
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            placeholder="Repita sua senha"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pr-14 focus:ring-2 focus:ring-[#FFD700] outline-none transition text-lg font-bold italic placeholder:text-white/30 text-white"
          />
          <button
            type="button"
            onClick={() => setShowPass2(!showPass2)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            {showPass2 ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <label className="flex items-start gap-3 glass rounded-2xl p-4 border-white/10 cursor-pointer">
        <input
          type="checkbox"
          checked={acepta}
          onChange={(e) => setAcepta(e.target.checked)}
          className="mt-1 w-5 h-5 accent-[#39FF14] rounded"
        />
        <span className="text-[11px] font-bold uppercase text-gray-300 leading-snug">
          Aceito que criem minha conta e me contatem pra{' '}
          <span className="text-[#39FF14]">participar dos sorteios.</span>
        </span>
      </label>
      <button
        disabled={!submitOk}
        onClick={onSubmit}
        className="w-full py-5 bg-[#39FF14] text-black font-impact text-2xl rounded-2xl glow-green disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase italic disabled:cursor-not-allowed"
      >
        Participar <ArrowRight size={26} />
      </button>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="space-y-6 mt-4">
      <div className="relative">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#39FF14]/30 to-transparent blur-xl" />
        <div className="relative glass rounded-3xl p-8 border-white/10">
          <div className="h-1 rounded-full bg-gradient-to-r from-[#FFD700] to-[#39FF14] mb-8" />
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-[#39FF14] flex items-center justify-center shadow-[0_0_40px_#39FF14]">
              <CheckCircle2 size={56} className="text-black" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-center text-5xl font-impact italic tracking-tighter leading-[0.85] uppercase">
            DENTRO! VOCÊ JÁ FAZ PARTE DOS <span className="text-[#39FF14]">MEUS.</span>
          </h1>
          <div className="mt-8 glass rounded-2xl p-5 border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Mail size={16} className="text-[#FFD700]" />
              <p className="text-sm font-black italic uppercase text-[#FFD700]">Confira seu e-mail</p>
            </div>
            <p className="text-sm text-gray-300 text-center leading-relaxed">
              Estamos criando sua conta. Nos próximos minutos vai chegar um e-mail pra você verificar sua conta
              e poder participar dos sorteios.
            </p>
            <div className="mt-4 glass rounded-xl p-3 border-white/5 flex items-start gap-2">
              <AlertCircle size={14} className="text-[#FFD700] shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-400 leading-snug">
                <span className="text-white">📌 Confira também a pasta de</span>{' '}
                <span className="text-white font-bold">spam / lixo eletrônico.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <a
        href="#"
        className="w-full py-5 bg-[#39FF14] text-black font-impact text-xl rounded-2xl glow-green hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase italic"
      >
        Seguir Allan no Whatsapp
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
      </a>
    </div>
  );
}

type StrengthRule = { label: string; test: (s: string) => boolean };

const PASS_RULES: StrengthRule[] = [
  { label: 'Mínimo 8 caracteres', test: (s) => s.length >= 8 },
  { label: '1 letra maiúscula', test: (s) => /[A-Z]/.test(s) },
  { label: '1 número', test: (s) => /[0-9]/.test(s) },
  { label: '1 caractere especial (@$!%*?&_.#)', test: (s) => /[@$!%*?&_.#]/.test(s) },
];

function PasswordStrength({ pass }: { pass: string }) {
  const results = PASS_RULES.map((r) => r.test(pass));
  const score = results.filter(Boolean).length;

  let label: string;
  let barColor: string;
  let textColor: string;
  let widthPct: number;

  if (score <= 1)      { label = 'Fraca';     barColor = 'bg-red-500';    textColor = 'text-red-500';    widthPct = 25; }
  else if (score === 2){ label = 'Regular';   barColor = 'bg-amber-500';  textColor = 'text-amber-500';  widthPct = 50; }
  else if (score === 3){ label = 'Quase lá';  barColor = 'bg-amber-500';  textColor = 'text-amber-500';  widthPct = 75; }
  else                 { label = 'Forte';     barColor = 'bg-[#39FF14]';  textColor = 'text-[#39FF14]';  widthPct = 100; }

  const showBar = pass.length > 0;

  return (
    <div className="mt-3">
      {showBar && (
        <>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${widthPct}%` }}
            />
          </div>
          <p className={`mt-1 text-[10px] font-bold italic ${textColor}`}>{label}</p>
        </>
      )}
      <div className="space-y-0.5 mt-2">
        {PASS_RULES.map((r, i) => {
          const ok = results[i];
          return (
            <div key={r.label} className="flex items-center gap-1.5">
              {ok ? (
                <CheckCircle2 size={12} className="text-[#39FF14] shrink-0" strokeWidth={2.5} />
              ) : (
                <X size={12} className="text-red-400 shrink-0" strokeWidth={2.5} />
              )}
              <span className={`text-[10px] font-medium ${ok ? 'text-[#39FF14]' : 'text-red-400'}`}>
                {r.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UnderageScreen() {
  return (
    <div className="space-y-6 mt-4">
      <div className="relative">
        <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-br from-[#FFD700]/30 via-[#FFD700]/10 to-transparent blur-2xl pointer-events-none" />
        <div className="relative glass rounded-[2.5rem] p-10 border-2 border-[#FFD700]/40 bg-[#0a0a0a]/85 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFD700]/40 via-[#FFD700] to-[#FFD700]/40" />
          <div className="flex justify-center mb-8 pt-2">
            <div className="w-24 h-24 rounded-full bg-[#FFD700] flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.6)]">
              <Star size={48} className="text-black fill-black" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-center text-3xl font-impact italic tracking-tighter leading-[0.95] uppercase">
            Oi! Como você é{' '}
            <span className="block text-[#FFD700] mt-1">menor de 18 anos</span>
          </h1>
          <p className="text-center text-sm font-bold italic uppercase tracking-wider text-gray-300 mt-6 leading-relaxed px-2">
            Precisa entrar no meu canal do WhatsApp para participar dos prêmios que sorteio todos os dias.
          </p>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 w-full py-5 bg-[#39FF14] text-black font-impact text-xl rounded-2xl glow-green hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase italic"
          >
            Entrar no canal
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}

const MONTHS_PT = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const DOW_PT = ['D','S','T','Q','Q','S','S'];

type PickerOption = { value: string | number; label: string };

function PickerSelect({
  value, onChange, options, accent = 'white', align = 'left', size = 'sm', placeholder, searchable = false,
}: {
  value: string | number;
  onChange: (v: any) => void;
  options: PickerOption[];
  accent?: 'white' | 'gold';
  align?: 'left' | 'right';
  size?: 'sm' | 'lg';
  placeholder?: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) { setQuery(''); return; }
    if (searchable && searchRef.current) {
      // Slight delay so iOS/mobile reliably opens keyboard
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    if (!listRef.current) return;
    const el = listRef.current.querySelector('[data-selected="true"]') as HTMLElement | null;
    if (el) el.scrollIntoView({ block: 'center' });
  }, [open, searchable]);

  function stripAccents(s: string) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
  const filteredOptions = searchable && query.trim()
    ? options.filter((o) => stripAccents(String(o.label)).includes(stripAccents(query.trim())))
    : options;

  const current = options.find((o) => o.value === value);
  const textColor = accent === 'gold' ? 'text-[#FFD700]' : 'text-white';

  const btnSizeCls = size === 'lg'
    ? 'rounded-2xl px-6 py-5 text-xl font-bold italic leading-8'
    : 'rounded-xl px-3 py-2 text-xs font-black uppercase italic tracking-wider leading-5';
  const itemSizeCls = size === 'lg'
    ? 'px-5 py-3 text-base font-bold italic leading-7'
    : 'px-3 py-1.5 text-xs font-black uppercase italic tracking-wider leading-5';
  const listMaxH = size === 'lg' ? 'max-h-72' : 'max-h-60';
  const listRadius = size === 'lg' ? 'rounded-2xl' : 'rounded-xl';
  const chevronSize = size === 'lg' ? 20 : 14;

  const displayLabel = current?.label ?? placeholder ?? '...';
  const placeholderColor = !current && placeholder ? 'text-white/30' : textColor;

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full bg-white/5 border border-white/10 ${btnSizeCls} ${placeholderColor} focus:ring-2 focus:ring-[#FFD700] outline-none flex items-center justify-between gap-2 hover:border-[#FFD700]/40 transition cursor-pointer`}
      >
        <span className="block min-w-0 flex-1 whitespace-nowrap overflow-hidden text-ellipsis pb-1 -mb-1">{displayLabel}</span>
        <ChevronDown size={chevronSize} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${accent === 'gold' ? 'text-[#FFD700]/70' : 'text-white/50'}`} />
      </button>
      {open && (
        <div
          className={`absolute z-[60] mt-2 ${align === 'right' ? 'right-0' : 'left-0'} min-w-full ${listRadius} border border-white/10 bg-[#0e0e10]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,215,0,0.05)] overflow-hidden`}
        >
          {searchable && (
            <div className="p-2 border-b border-white/10 bg-[#0e0e10]/95">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFD700]/70 pointer-events-none" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar..."
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  inputMode="search"
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm font-bold italic text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#FFD700] outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); searchRef.current?.focus(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    aria-label="Limpar busca"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
          <div ref={listRef} className={`${listMaxH} overflow-y-auto scrollbar-themed py-1`}>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs font-bold italic text-white/40">
                Nenhum resultado para "{query}"
              </div>
            ) : (
              filteredOptions.map((o) => {
                const sel = o.value === value;
                return (
                  <button
                    key={String(o.value)}
                    type="button"
                    data-selected={sel ? 'true' : 'false'}
                    onClick={() => { onChange(o.value); setOpen(false); }}
                    className={`w-full text-left ${itemSizeCls} transition ${
                      sel
                        ? 'bg-[#FFD700]/15 text-[#FFD700] shadow-[inset_2px_0_0_#FFD700]'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function pad2(n: number) { return String(n).padStart(2, '0'); }
function toISO(y: number, m: number, d: number) { return `${y}-${pad2(m + 1)}-${pad2(d)}`; }
function fromISO(iso: string): { y: number; m: number; d: number } | null {
  if (!iso) return null;
  const parts = iso.split('-');
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return null;
  return { y, m: m - 1, d };
}
function formatDDMMYYYY(iso: string) {
  const p = fromISO(iso);
  return p ? `${pad2(p.d)}/${pad2(p.m + 1)}/${p.y}` : '';
}

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const now = new Date();
  const todayISO = toISO(now.getFullYear(), now.getMonth(), now.getDate());

  const selected = fromISO(value);
  const initialView = selected
    ? { y: selected.y, m: selected.m }
    : { y: now.getFullYear() - 25, m: now.getMonth() };
  const [view, setView] = useState(initialView);

  useEffect(() => {
    if (open && selected) setView({ y: selected.y, m: selected.m });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const currentYear = now.getFullYear();
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear; y >= currentYear - 100; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const firstDOW = new Date(view.y, view.m, 1).getDay();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDOW }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function moveMonth(delta: number) {
    setView((v) => {
      const m = v.m + delta;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m };
    });
  }

  function pick(d: number) {
    onChange(toISO(view.y, view.m, d));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-[#FFD700] outline-none transition text-xl font-bold italic text-left flex items-center justify-between hover:border-white/20 ${value ? 'text-white' : 'text-white/30'}`}
      >
        <span>{value ? formatDDMMYYYY(value) : 'dd/mm/aaaa'}</span>
        <Calendar size={20} className="text-[#FFD700] shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-white/10 bg-[#0e0e10]/95 backdrop-blur-xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,215,0,0.05)] space-y-3">
          <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#FFD700]/40 to-transparent pointer-events-none" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#FFD700]/40 text-white transition"
              aria-label="Mês anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex-1">
              <PickerSelect
                value={view.m}
                onChange={(m: number) => setView((v) => ({ ...v, m }))}
                options={MONTHS_PT.map((label, i) => ({ value: i, label }))}
              />
            </div>
            <div className="w-24">
              <PickerSelect
                value={view.y}
                onChange={(y: number) => setView((v) => ({ ...v, y }))}
                options={years.map((y) => ({ value: y, label: String(y) }))}
                accent="gold"
                align="right"
              />
            </div>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#FFD700]/40 text-white transition"
              aria-label="Próximo mês"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 px-1">
            {DOW_PT.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-black uppercase tracking-widest text-[#FFD700]/60 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 px-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const iso = toISO(view.y, view.m, d);
              const isSelected = selected && selected.y === view.y && selected.m === view.m && selected.d === d;
              const isToday = iso === todayISO;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(d)}
                  className={[
                    'aspect-square flex items-center justify-center rounded-lg text-sm font-bold italic transition-all',
                    isSelected
                      ? 'bg-[#FFD700] text-black shadow-[0_0_12px_rgba(255,215,0,0.55)] scale-105'
                      : 'text-white/90 hover:bg-white/10 hover:text-[#FFD700]',
                    isToday && !isSelected ? 'ring-1 ring-[#39FF14]/70' : '',
                  ].join(' ')}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="text-[11px] font-black uppercase italic tracking-widest text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => { onChange(todayISO); setOpen(false); }}
              className="text-[11px] font-black uppercase italic tracking-widest text-[#39FF14] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
