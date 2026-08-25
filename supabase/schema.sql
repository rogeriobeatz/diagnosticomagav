create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nome_condominio text not null,
  nome_sindico text not null,
  email_contato text not null,
  telefone_contato text not null default '',
  data_diagnostico date not null,
  respostas jsonb not null,
  pontuacao_por_fator jsonb not null,
  pontuacao_total integer not null check (pontuacao_total between 0 and 96),
  percentual integer not null check (percentual between 0 and 100),
  fator_mais_fraco text not null,
  nivel text not null,
  consentimento_lgpd boolean not null default false check (consentimento_lgpd = true),
  consentimento_em timestamptz not null,
  origem text not null default 'diagnostico-magav',
  status text not null default 'novo' check (status in ('novo', 'contatado', 'reuniao_agendada', 'convertido', 'descartado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_contato_idx on public.leads (lower(email_contato));

alter table public.leads enable row level security;

revoke all on public.leads from anon, authenticated;
