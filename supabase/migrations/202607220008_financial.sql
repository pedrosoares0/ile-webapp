create table if not exists public.financial_settings (
  terreiro_id text primary key references public.terreiros(id) on delete cascade,
  monthly_goal numeric(12,2) not null default 0 check(monthly_goal>=0),
  pix_key text,
  pix_key_type text check(pix_key_type in ('cpf','cnpj','email','phone','random')),
  auto_charge_enabled boolean not null default false,
  charge_day smallint not null default 5 check(charge_day between 1 and 28),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  terreiro_id text not null references public.terreiros(id) on delete cascade,
  description text not null,
  category text not null,
  transaction_type text not null check(transaction_type in ('income','expense')),
  amount numeric(12,2) not null check(amount>0),
  occurred_on date not null default current_date,
  status text not null default 'paid' check(status in ('paid','pending','cancelled')),
  responsible text,
  created_by uuid references public.accounts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_members (
  id text primary key,
  terreiro_id text not null references public.terreiros(id) on delete cascade,
  user_id text references public.users(id) on delete set null,
  name text not null,
  role_label text,
  phone text,
  email text,
  last_payment_on date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_dues (
  id uuid primary key default gen_random_uuid(),
  terreiro_id text not null references public.terreiros(id) on delete cascade,
  financial_member_id text not null references public.financial_members(id) on delete cascade,
  reference_month date not null,
  due_date date not null,
  amount numeric(12,2) not null check(amount>0),
  status text not null default 'pending' check(status in ('pending','paid','cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(financial_member_id,reference_month)
);

create table if not exists public.collection_attempts (
  id uuid primary key default gen_random_uuid(),
  terreiro_id text not null references public.terreiros(id) on delete cascade,
  financial_member_id text references public.financial_members(id) on delete set null,
  channel text not null check(channel in ('whatsapp','email')),
  status text not null default 'registered' check(status in ('registered','opened','sent','failed')),
  message text,
  attempted_by uuid references public.accounts(id) on delete set null,
  attempted_at timestamptz not null default now(),
  provider_reference text,
  error_message text
);

create index if not exists financial_transactions_terreiro_date_idx on public.financial_transactions(terreiro_id,occurred_on desc);
create index if not exists financial_members_terreiro_idx on public.financial_members(terreiro_id,active);
create index if not exists financial_dues_terreiro_status_idx on public.financial_dues(terreiro_id,status,due_date);
create index if not exists collection_attempts_terreiro_date_idx on public.collection_attempts(terreiro_id,attempted_at desc);

alter table public.financial_settings enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.financial_members enable row level security;
alter table public.financial_dues enable row level security;
alter table public.collection_attempts enable row level security;

create policy financial_settings_admin on public.financial_settings for all to authenticated
  using(public.is_terreiro_admin(terreiro_id)) with check(public.is_terreiro_admin(terreiro_id));
create policy financial_transactions_admin on public.financial_transactions for all to authenticated
  using(public.is_terreiro_admin(terreiro_id)) with check(public.is_terreiro_admin(terreiro_id));
create policy financial_members_admin on public.financial_members for all to authenticated
  using(public.is_terreiro_admin(terreiro_id)) with check(public.is_terreiro_admin(terreiro_id));
create policy financial_dues_admin on public.financial_dues for all to authenticated
  using(public.is_terreiro_admin(terreiro_id)) with check(public.is_terreiro_admin(terreiro_id));
create policy collection_attempts_admin on public.collection_attempts for all to authenticated
  using(public.is_terreiro_admin(terreiro_id)) with check(public.is_terreiro_admin(terreiro_id));

grant select,insert,update,delete on public.financial_settings,public.financial_transactions,
  public.financial_members,public.financial_dues,public.collection_attempts to authenticated;

insert into public.financial_settings(terreiro_id,monthly_goal,pix_key,pix_key_type,auto_charge_enabled,charge_day)
select 'terreiro_t7ca',2800,'00.123.456/0001-99','cnpj',true,5
where exists(select 1 from public.terreiros where id='terreiro_t7ca')
on conflict(terreiro_id) do nothing;

insert into public.financial_transactions(id,terreiro_id,description,category,transaction_type,amount,occurred_on,status,responsible)
select values_row.* from (values
  ('10000000-0000-0000-0000-000000000001'::uuid,'terreiro_t7ca','Mensalidade - Julho','Mensalidades','income',120.00,'2026-07-20'::date,'paid','Ialorixá Maria'),
  ('10000000-0000-0000-0000-000000000002'::uuid,'terreiro_t7ca','Mensalidade - Julho','Mensalidades','income',120.00,'2026-07-19'::date,'paid','Ogum João'),
  ('10000000-0000-0000-0000-000000000003'::uuid,'terreiro_t7ca','Doação de Velas e Ervas','Doações','income',250.00,'2026-07-18'::date,'paid','Anônimo'),
  ('10000000-0000-0000-0000-000000000004'::uuid,'terreiro_t7ca','Conta de Energia (Luz)','Manutenção','expense',345.80,'2026-07-15'::date,'paid',null),
  ('10000000-0000-0000-0000-000000000005'::uuid,'terreiro_t7ca','Compra de Alguidar e Velas','Materiais','expense',180.00,'2026-07-12'::date,'paid',null),
  ('10000000-0000-0000-0000-000000000006'::uuid,'terreiro_t7ca','Mensalidade - Julho','Mensalidades','income',120.00,'2026-07-05'::date,'pending','Carlos Eduardo'),
  ('10000000-0000-0000-0000-000000000007'::uuid,'terreiro_t7ca','Mensalidade - Julho','Mensalidades','income',120.00,'2026-07-05'::date,'pending','Ana Paula')
) as values_row(id,terreiro_id,description,category,transaction_type,amount,occurred_on,status,responsible)
where exists(select 1 from public.terreiros where id='terreiro_t7ca')
on conflict(id) do nothing;

insert into public.financial_members(id,terreiro_id,name,role_label,last_payment_on)
select values_row.* from (values
  ('financial_carlos','terreiro_t7ca','Carlos Eduardo','Filho de Santo','2026-05-10'::date),
  ('financial_ana','terreiro_t7ca','Ana Paula Souza','Ekedi','2026-06-05'::date),
  ('financial_rodrigo','terreiro_t7ca','Rodrigo Alves','Ogan','2026-04-12'::date)
) as values_row(id,terreiro_id,name,role_label,last_payment_on)
where exists(select 1 from public.terreiros where id='terreiro_t7ca')
on conflict(id) do nothing;

insert into public.financial_dues(id,terreiro_id,financial_member_id,reference_month,due_date,amount,status)
select values_row.* from (values
  ('20000000-0000-0000-0000-000000000001'::uuid,'terreiro_t7ca','financial_carlos','2026-06-01'::date,'2026-06-05'::date,120.00,'pending'),
  ('20000000-0000-0000-0000-000000000002'::uuid,'terreiro_t7ca','financial_carlos','2026-07-01'::date,'2026-07-05'::date,120.00,'pending'),
  ('20000000-0000-0000-0000-000000000003'::uuid,'terreiro_t7ca','financial_ana','2026-07-01'::date,'2026-07-05'::date,120.00,'pending'),
  ('20000000-0000-0000-0000-000000000004'::uuid,'terreiro_t7ca','financial_rodrigo','2026-05-01'::date,'2026-05-05'::date,120.00,'pending'),
  ('20000000-0000-0000-0000-000000000005'::uuid,'terreiro_t7ca','financial_rodrigo','2026-06-01'::date,'2026-06-05'::date,120.00,'pending'),
  ('20000000-0000-0000-0000-000000000006'::uuid,'terreiro_t7ca','financial_rodrigo','2026-07-01'::date,'2026-07-05'::date,120.00,'pending')
) as values_row(id,terreiro_id,financial_member_id,reference_month,due_date,amount,status)
where exists(select 1 from public.terreiros where id='terreiro_t7ca')
on conflict(id) do nothing;
