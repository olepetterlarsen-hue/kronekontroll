-- Kronekontroll: grunnskjema.
-- Sikkerhetsprinsipp: HVER tabell med brukerdata har user_id + Row Level Security.
-- Isolasjonen håndheves i databaselaget, ikke bare i applikasjonskoden.

-- ============================================================
-- Hjelpefunksjoner
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- ============================================================
-- Profiler
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  plan text not null default 'standard' check (plan in ('standard', 'pluss')),
  onboarding_focus text check (onboarding_focus in ('forbruk', 'gjeld', 'sparing')),
  stripe_customer_id text unique,
  subscription_status text not null default 'trial'
    check (subscription_status in ('trial', 'active', 'past_due', 'canceled')),
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: les egen" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: oppdater egen" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Kolonnenivå-tilgang: brukeren kan bare endre ufarlige felter i egen profil.
-- Abonnementsfelt, admin-flagg og prøveperiode settes kun av webhooks/cron
-- via service role. Dette hindrer at noen forlenger egen prøveperiode eller
-- gir seg selv admin via direkte API-kall mot databasen.
revoke update on public.profiles from authenticated;
grant update (full_name, onboarding_focus) on public.profiles to authenticated;

-- Opprett profil + varslingsinnstillinger automatisk ved registrering
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  insert into public.notification_settings (user_id) values (new.id);
  return new;
end;
$$;

-- ============================================================
-- Dokumenter (opplastede filer + AI-tolkning)
-- ============================================================

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  doc_type text not null check (doc_type in ('kontoutskrift', 'inkasso', 'laan', 'epost')),
  original_name text not null,
  storage_path text not null,
  status text not null default 'mottatt'
    check (status in ('mottatt', 'tolket', 'bekreftet', 'feilet')),
  parsed jsonb,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;
create policy "documents: alt eget" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index documents_user_idx on public.documents (user_id, created_at desc);

-- ============================================================
-- Transaksjoner (fra kontoutskrifter)
-- ============================================================

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid references public.documents (id) on delete set null,
  tx_date date not null,
  description text not null,
  amount numeric(12, 2) not null, -- negativt = utgift, positivt = inntekt
  category text not null default 'annet',
  is_recurring boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;
create policy "transactions: alt eget" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index transactions_user_date_idx on public.transactions (user_id, tx_date desc);

-- ============================================================
-- Gjeld (lån, kredittkort, inkasso, manuelt registrert)
-- ============================================================

create table public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_document_id uuid references public.documents (id) on delete set null,
  creditor text not null,
  debt_type text not null default 'annet'
    check (debt_type in ('forbrukslaan', 'kredittkort', 'boliglaan', 'billaan', 'inkasso', 'annet')),
  principal numeric(12, 2) not null,
  interest_rate numeric(5, 2), -- nominell årlig rente i prosent
  monthly_payment numeric(12, 2),
  status text not null default 'aktiv' check (status in ('aktiv', 'nedbetalt')),
  created_at timestamptz not null default now()
);

alter table public.debts enable row level security;
create policy "debts: alt eget" on public.debts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index debts_user_idx on public.debts (user_id);

-- ============================================================
-- Inkassokrav (for inkassokontrollen og tidslinjevarsling)
-- ============================================================

create table public.inkasso_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid references public.documents (id) on delete set null,
  creditor text not null,
  collector text, -- inkassoselskap, om annet enn kreditor
  original_amount numeric(12, 2) not null,
  purregebyr numeric(12, 2) not null default 0,
  salaer numeric(12, 2) not null default 0,
  renter numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null,
  deadline date,
  stage text not null default 'purring'
    check (stage in ('purring', 'inkassovarsel', 'betalingsoppfordring', 'rettslig')),
  flags jsonb not null default '[]'::jsonb, -- avvik funnet av inkassokontrollen
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.inkasso_claims enable row level security;
create policy "inkasso: alt eget" on public.inkasso_claims
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index inkasso_user_idx on public.inkasso_claims (user_id, deadline);

-- ============================================================
-- Sparemål
-- ============================================================

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null,
  saved_amount numeric(12, 2) not null default 0,
  target_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.savings_goals enable row level security;
create policy "savings: alt eget" on public.savings_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index savings_user_idx on public.savings_goals (user_id);

-- ============================================================
-- Oppgaver med frister (mates av gjeldsmodul og varsles på e-post)
-- ============================================================

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status text not null default 'aapen' check (status in ('aapen', 'fullfort')),
  source text not null default 'manuell'
    check (source in ('manuell', 'inkasso', 'gjeld', 'sparing', 'import')),
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
create policy "tasks: alt eget" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index tasks_user_due_idx on public.tasks (user_id, status, due_date);

-- ============================================================
-- E-postutkast (generert av e-postverkstedet)
-- ============================================================

create table public.email_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_type text not null check (template_type in (
    'betalingsplan', 'innsigelse_inkasso', 'rentenedsettelse',
    'oppsigelse_abonnement', 'frys_renter'
  )),
  subject text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.email_drafts enable row level security;
create policy "email_drafts: alt eget" on public.email_drafts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index email_drafts_user_idx on public.email_drafts (user_id, created_at desc);

-- ============================================================
-- Varslingsinnstillinger + varslingslogg (idempotent cron)
-- ============================================================

create table public.notification_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  task_reminders boolean not null default true,
  weekly_summary boolean not null default false,
  savings_milestones boolean not null default true
);

alter table public.notification_settings enable row level security;
create policy "notif_settings: alt eget" on public.notification_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.notifications_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  notification_type text not null,
  ref_id uuid, -- f.eks. task-id eller sparemål-id
  dedupe_key text not null, -- hindrer dobbel utsending fra cron
  sent_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

alter table public.notifications_log enable row level security;
create policy "notif_log: les egen" on public.notifications_log
  for select using (auth.uid() = user_id);
-- Skriving skjer kun fra cron via service role (omgår RLS).

-- ============================================================
-- Innholdsstudio (kun admin) - sosiale medier-kø
-- ============================================================

create table public.social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram', 'tiktok', 'youtube', 'linkedin', 'x')),
  format text not null, -- f.eks. 'reels_manus', 'karusell', 'post'
  title text not null,
  body jsonb not null, -- hook, replikker, caption, hashtags osv.
  status text not null default 'utkast' check (status in ('utkast', 'godkjent', 'publisert')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.social_posts enable row level security;
create policy "social: kun admin" on public.social_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Trigger for nye brukere (etter at alle tabeller finnes)
-- ============================================================

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Storage: privat bøtte for dokumenter, sti = {user_id}/{filnavn}
-- ============================================================

insert into storage.buckets (id, name, public)
values ('dokumenter', 'dokumenter', false)
on conflict (id) do nothing;

create policy "dokumenter: last opp egen mappe" on storage.objects
  for insert with check (
    bucket_id = 'dokumenter'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "dokumenter: les egen mappe" on storage.objects
  for select using (
    bucket_id = 'dokumenter'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "dokumenter: slett egen mappe" on storage.objects
  for delete using (
    bucket_id = 'dokumenter'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
