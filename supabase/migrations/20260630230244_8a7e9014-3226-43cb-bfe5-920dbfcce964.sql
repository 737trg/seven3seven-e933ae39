
-- ENUMS
create type public.app_role as enum ('owner', 'admin', 'athlete');
create type public.product_collection as enum ('compete', 'build', 'blueprint');
create type public.product_status as enum ('draft', 'published', 'archived');
create type public.entitlement_source as enum ('development', 'purchase', 'gift', 'admin', 'owner');

-- TIMESTAMP TRIGGER
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create trigger profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();

-- USER ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  granted_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "user_roles_select_own" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create index user_roles_user_id_idx on public.user_roles(user_id);

-- ROLE HELPERS
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('owner','admin'))
$$;

-- AUTO PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'name', split_part(new.email,'@',1))
  ) on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'athlete')
    on conflict (user_id, role) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text,
  description text,
  collection public.product_collection not null,
  status public.product_status not null default 'draft',
  duration_weeks integer,
  sessions_per_week text,
  difficulty text,
  price_cents integer,
  currency text not null default 'GBP',
  cover_image_url text,
  hero_image_url text,
  base_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products_select_published_anon" on public.products for select to anon using (status = 'published');
create policy "products_select_published_auth" on public.products for select to authenticated using (status = 'published' or public.is_staff(auth.uid()));
create policy "products_staff_insert" on public.products for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "products_staff_update" on public.products for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "products_staff_delete" on public.products for delete to authenticated using (public.is_staff(auth.uid()));
create trigger products_updated_at before update on public.products for each row execute function public.update_updated_at_column();
create index products_status_idx on public.products(status);

-- ENTITLEMENTS (define BEFORE programme_versions so policies can reference it)
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  source public.entitlement_source not null default 'admin',
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  granted_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);
grant select on public.entitlements to authenticated;
grant all on public.entitlements to service_role;
alter table public.entitlements enable row level security;
create policy "entitlements_select_own_or_staff" on public.entitlements
  for select to authenticated using (auth.uid() = user_id or public.is_staff(auth.uid()));
create trigger entitlements_updated_at before update on public.entitlements for each row execute function public.update_updated_at_column();
create index entitlements_user_idx on public.entitlements(user_id);
create index entitlements_product_idx on public.entitlements(product_id);

-- PROGRAMME VERSIONS
create table public.programme_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  version text not null,
  released_at timestamptz not null default now(),
  notes text,
  pdf_path text,
  manifest jsonb not null default '{}'::jsonb,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, version)
);
grant select, insert, update, delete on public.programme_versions to authenticated;
grant all on public.programme_versions to service_role;
alter table public.programme_versions enable row level security;
create policy "programme_versions_select_entitled" on public.programme_versions
  for select to authenticated using (
    public.is_staff(auth.uid())
    or exists (
      select 1 from public.entitlements e
      where e.user_id = auth.uid() and e.product_id = programme_versions.product_id and e.revoked_at is null
    )
  );
create policy "programme_versions_staff_insert" on public.programme_versions for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "programme_versions_staff_update" on public.programme_versions for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "programme_versions_staff_delete" on public.programme_versions for delete to authenticated using (public.is_staff(auth.uid()));
create trigger programme_versions_updated_at before update on public.programme_versions for each row execute function public.update_updated_at_column();
create index programme_versions_product_idx on public.programme_versions(product_id);

-- ENROLMENTS
create table public.programme_enrolments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  started_at timestamptz not null default now(),
  current_week integer,
  completion_pct numeric(5,2),
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);
grant select, insert, update, delete on public.programme_enrolments to authenticated;
grant all on public.programme_enrolments to service_role;
alter table public.programme_enrolments enable row level security;
create policy "enrolments_select_own" on public.programme_enrolments for select to authenticated using (auth.uid() = user_id or public.is_staff(auth.uid()));
create policy "enrolments_insert_own_entitled" on public.programme_enrolments for insert to authenticated with check (
  auth.uid() = user_id
  and exists (select 1 from public.entitlements e where e.user_id = auth.uid() and e.product_id = programme_enrolments.product_id and e.revoked_at is null)
);
create policy "enrolments_update_own" on public.programme_enrolments for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "enrolments_delete_own" on public.programme_enrolments for delete to authenticated using (auth.uid() = user_id);
create trigger programme_enrolments_updated_at before update on public.programme_enrolments for each row execute function public.update_updated_at_column();
create index enrolments_user_idx on public.programme_enrolments(user_id);

-- SESSION COMPLETIONS
create table public.session_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  session_id text not null,
  week integer,
  day integer,
  completed_at timestamptz not null default now(),
  duration_seconds integer,
  notes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.session_completions to authenticated;
grant all on public.session_completions to service_role;
alter table public.session_completions enable row level security;
create policy "completions_select_own" on public.session_completions for select to authenticated using (auth.uid() = user_id or public.is_staff(auth.uid()));
create policy "completions_insert_own" on public.session_completions for insert to authenticated with check (auth.uid() = user_id);
create policy "completions_update_own" on public.session_completions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "completions_delete_own" on public.session_completions for delete to authenticated using (auth.uid() = user_id);
create index completions_user_idx on public.session_completions(user_id);
create index completions_product_session_idx on public.session_completions(product_id, session_id);

-- WORKOUT RESULTS
create table public.workout_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  session_id text not null,
  block_id text,
  exercise_id text,
  kind text,
  payload jsonb not null default '{}'::jsonb,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.workout_results to authenticated;
grant all on public.workout_results to service_role;
alter table public.workout_results enable row level security;
create policy "results_select_own" on public.workout_results for select to authenticated using (auth.uid() = user_id or public.is_staff(auth.uid()));
create policy "results_insert_own" on public.workout_results for insert to authenticated with check (auth.uid() = user_id);
create policy "results_update_own" on public.workout_results for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "results_delete_own" on public.workout_results for delete to authenticated using (auth.uid() = user_id);
create index results_user_idx on public.workout_results(user_id);
create index results_session_idx on public.workout_results(product_id, session_id);

-- READINESS LOGS
create table public.readiness_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  sleep_hours numeric(4,2),
  soreness smallint,
  stress smallint,
  energy smallint,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);
grant select, insert, update, delete on public.readiness_logs to authenticated;
grant all on public.readiness_logs to service_role;
alter table public.readiness_logs enable row level security;
create policy "readiness_select_own" on public.readiness_logs for select to authenticated using (auth.uid() = user_id or public.is_staff(auth.uid()));
create policy "readiness_insert_own" on public.readiness_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "readiness_update_own" on public.readiness_logs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "readiness_delete_own" on public.readiness_logs for delete to authenticated using (auth.uid() = user_id);
create trigger readiness_logs_updated_at before update on public.readiness_logs for each row execute function public.update_updated_at_column();
create index readiness_user_idx on public.readiness_logs(user_id);

-- AUDIT LOGS
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "audit_select_staff" on public.audit_logs for select to authenticated using (public.is_staff(auth.uid()));
create index audit_actor_idx on public.audit_logs(actor_id);
create index audit_created_idx on public.audit_logs(created_at desc);

-- SEED PRODUCTS
insert into public.products (slug, name, subtitle, description, collection, status, duration_weeks, sessions_per_week, difficulty, price_cents, currency, base_path)
values
  ('athx-2026', 'ATHX 2026', 'Seven-week hybrid competition preparation.', 'Competition-ready hybrid block built around peak performance for ATHX 2026.', 'compete', 'published', 8, '5-6 sessions / week', 'Intermediate / Advanced', null, 'GBP', '/my-programmes/athx-2026'),
  ('basic-training-blueprint-plus', 'Basic Training Blueprint+', 'Foundational hybrid strength & conditioning.', 'A long-form foundation programme to build hybrid capacity from the ground up.', 'blueprint', 'published', 12, '4-5 sessions / week', 'All levels', 1999, 'GBP', '/programmes/basic-training-blueprint-plus'),
  ('sem-8', 'S.E.M. 8', 'Strength · Endurance · Mixed — 8 week block.', 'Eight-week block alternating strength, endurance and mixed sessions.', 'build', 'published', 8, '5 sessions / week', 'Intermediate', 1999, 'GBP', '/programmes/sem'),
  ('hybrid-race-plan', 'Hybrid Race Plan', 'Race-specific hybrid preparation.', 'Targeted race-day preparation for hybrid athletes.', 'compete', 'published', 10, '5 sessions / week', 'Intermediate / Advanced', 2999, 'GBP', '/programmes/hybrid-race-plan'),
  ('mixed', 'MIXED', 'Open hybrid track with RX & scaled options.', 'Flexible mixed programming with RX and scaled variants.', 'build', 'published', 8, '4-5 sessions / week', 'All levels', 2999, 'GBP', '/programmes/mixed')
on conflict (slug) do nothing;
