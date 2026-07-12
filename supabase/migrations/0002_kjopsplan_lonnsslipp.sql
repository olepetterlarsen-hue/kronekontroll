-- Kjøpsplanlegger + lønnsslipp.
-- Samme sikkerhetsprinsipp som 0001: user_id + RLS på alt.

-- Dokumenttyper: lønnsslipp inn i importflyten
alter table public.documents drop constraint documents_doc_type_check;
alter table public.documents add constraint documents_doc_type_check
  check (doc_type in ('kontoutskrift', 'inkasso', 'laan', 'epost', 'lonnsslipp'));

-- ============================================================
-- Lønnsslipper (inntektsgrunnlag for kjøpsplan og oversikt)
-- ============================================================

create table public.payslips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid references public.documents (id) on delete set null,
  employer text,
  period text, -- f.eks. "2026-06"
  gross_pay numeric(12, 2) not null,
  net_pay numeric(12, 2) not null,
  tax_withheld numeric(12, 2),
  created_at timestamptz not null default now()
);

alter table public.payslips enable row level security;
create policy "payslips: alt eget" on public.payslips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index payslips_user_idx on public.payslips (user_id, created_at desc);

-- ============================================================
-- Kjøpsplaner ("er jeg klar til å kjøpe X?")
-- ============================================================

create table public.purchase_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  price numeric(12, 2) not null,
  monthly_saving numeric(12, 2) not null,
  already_saved numeric(12, 2) not null default 0,
  is_vehicle boolean not null default false,
  finn_url text,
  vehicle_info jsonb, -- {aar, km, drivstoff, modell} fra annonsen
  created_at timestamptz not null default now()
);

alter table public.purchase_plans enable row level security;
create policy "purchase_plans: alt eget" on public.purchase_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index purchase_plans_user_idx on public.purchase_plans (user_id, created_at desc);
