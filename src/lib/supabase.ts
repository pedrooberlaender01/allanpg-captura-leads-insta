import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tkoenlmmepieswidqofh.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrb2VubG1tZXBpZXN3aWRxb2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODQ5NjMsImV4cCI6MjA5NDI2MDk2M30.LrAfcOfm5uOa6oWNTSyMO7R8PLU1ZJ9eNPGvUnXf1RM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export type LeadInsert = {
  nome_completo: string;
  cpf: string;
  data_nascimento: string; // ISO YYYY-MM-DD
  estado: string;
  cidade: string;
  whatsapp: string;
  email: string;
  senha: string | null;
  aceite_termos: boolean;
  aceite_at: string | null; // ISO timestamp
  menor_idade: boolean;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referrer?: string | null;
  ip?: string | null;
  user_agent?: string | null;
};

export type LeadEventInsert = {
  lead_id: string;
  tipo: string;
  payload?: Record<string, unknown> | null;
};

export async function fetchPublicIP(): Promise<string | null> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (!res.ok) return null;
    const data = (await res.json()) as { ip?: string };
    return data.ip ?? null;
  } catch {
    return null;
  }
}

export function readUtmsFromQuery(): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
} {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    };
  }
  const sp = new URLSearchParams(window.location.search);
  const get = (k: string) => sp.get(k) || null;
  return {
    utm_source: get('utm_source'),
    utm_medium: get('utm_medium'),
    utm_campaign: get('utm_campaign'),
    utm_content: get('utm_content'),
    utm_term: get('utm_term'),
  };
}

const UTMS_STORAGE_KEY = 'allan-cabral-utms-v1';

export function persistUtms(utms: ReturnType<typeof readUtmsFromQuery>) {
  const hasAny = Object.values(utms).some((v) => v !== null);
  if (!hasAny || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(UTMS_STORAGE_KEY, JSON.stringify(utms));
  } catch {
    /* ignore */
  }
}

export function loadPersistedUtms(): ReturnType<typeof readUtmsFromQuery> {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    };
  }
  try {
    const raw = window.localStorage.getItem(UTMS_STORAGE_KEY);
    if (!raw) {
      return {
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    };
  }
}
