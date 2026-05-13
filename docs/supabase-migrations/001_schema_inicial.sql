-- =====================================================================
-- Migration 001: Schema inicial - leads + lead_events
-- Projeto Supabase: tkoenlmmepieswidqofh
-- Landing Allan Cabral filantropia
-- =====================================================================

-- ---------------------------------------------------------------------
-- Função genérica touch updated_at
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

-- ---------------------------------------------------------------------
-- Tabela: leads
-- ---------------------------------------------------------------------
create table public.leads (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Dados do formulário
  nome_completo     text not null,
  cpf               text not null,
  data_nascimento   date not null,
  estado            text not null,
  cidade            text not null,
  whatsapp          text not null,
  email             text not null,
  senha             text,  -- ATENÇÃO: plain text por escolha explícita do produto

  -- Compliance LGPD
  aceite_termos     boolean not null default false,
  aceite_at         timestamptz,

  -- Classificação
  menor_idade       boolean not null default false,
  status            text not null default 'pending'
                    check (status in ('pending','contacted','qualified','won','lost')),

  -- Tracking de campanha
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_content       text,
  utm_term          text,
  referrer          text,
  ip                inet,
  user_agent        text,

  -- Operação CRM
  contatado_at      timestamptz,
  notas             text
);

-- Índices
create unique index leads_cpf_unique     on public.leads (cpf);
create        index leads_whatsapp_idx   on public.leads (whatsapp);
create        index leads_email_idx      on public.leads (email);
create        index leads_status_idx     on public.leads (status);
create        index leads_created_at_idx on public.leads (created_at desc);
create        index leads_utm_campaign_idx on public.leads (utm_campaign);

-- Trigger updated_at
create trigger leads_touch_updated_at
  before update on public.leads
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Tabela: lead_events (auditoria + funil)
-- ---------------------------------------------------------------------
create table public.lead_events (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  created_at  timestamptz not null default now(),
  -- tipos esperados: 'registrou','voltou','whatsapp_clicado','email_aberto',
  --                  'contatado','convertido','perdido', etc.
  tipo        text not null,
  payload     jsonb
);

create index lead_events_lead_id_idx on public.lead_events (lead_id, created_at desc);
create index lead_events_tipo_idx    on public.lead_events (tipo);

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.leads        enable row level security;
alter table public.lead_events  enable row level security;

-- anon (frontend público): só INSERT, nunca SELECT/UPDATE/DELETE
create policy "anon_insert_leads"
  on public.leads
  for insert
  to anon
  with check (true);

create policy "anon_insert_lead_events"
  on public.lead_events
  for insert
  to anon
  with check (true);

-- service_role já tem bypass RLS automático — usado pelo n8n para CRM/leitura
