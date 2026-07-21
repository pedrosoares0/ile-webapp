-- Non-destructive production foundation for Ilê.

create extension if not exists pgcrypto;

alter table public.terreiros add column if not exists slug text;
alter table public.terreiros add column if not exists descricao_publica text;
alter table public.terreiros add column if not exists endereco text;
alter table public.terreiros add column if not exists latitude numeric(9,6);
alter table public.terreiros add column if not exists longitude numeric(9,6);
alter table public.terreiros add column if not exists logo_url text;
alter table public.terreiros add column if not exists banner_url text;
alter table public.terreiros add column if not exists instagram text;
alter table public.terreiros add column if not exists site text;
alter table public.terreiros add column if not exists publicado boolean not null default true;
alter table public.terreiros add column if not exists updated_at timestamptz not null default now();

alter table public.accounts add column if not exists updated_at timestamptz not null default now();
alter table public.users add column if not exists updated_at timestamptz not null default now();
alter table public.events add column if not exists updated_at timestamptz not null default now();
alter table public.pontos add column if not exists updated_at timestamptz not null default now();
alter table public.notices add column if not exists updated_at timestamptz not null default now();
alter table public.prayer_requests add column if not exists updated_at timestamptz not null default now();

create unique index if not exists accounts_username_lower_uidx on public.accounts (lower(username)) where username is not null;
create unique index if not exists accounts_email_lower_uidx on public.accounts (lower(email)) where email is not null;
create unique index if not exists terreiros_slug_lower_uidx on public.terreiros (lower(slug)) where slug is not null;
create index if not exists accounts_terreiro_idx on public.accounts (terreiro_id);
create index if not exists users_terreiro_idx on public.users (terreiro_id);
create index if not exists events_terreiro_date_idx on public.events (terreiro_id, date);
create index if not exists pontos_terreiro_idx on public.pontos (terreiro_id);
create index if not exists notices_terreiro_created_idx on public.notices (terreiro_id, created_at desc);
create index if not exists prayers_terreiro_created_idx on public.prayer_requests (terreiro_id, created_at desc);
create index if not exists prayers_account_idx on public.prayer_requests (account_id);

do $$ begin
  alter table public.accounts add constraint accounts_auth_user_fkey foreign key (id) references auth.users(id) on delete cascade not valid;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.accounts add constraint accounts_terreiro_fkey foreign key (terreiro_id) references public.terreiros(id) on delete set null not valid;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.users add constraint users_terreiro_fkey foreign key (terreiro_id) references public.terreiros(id) on delete cascade not valid;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.events add constraint events_terreiro_fkey foreign key (terreiro_id) references public.terreiros(id) on delete cascade not valid;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.pontos add constraint pontos_terreiro_fkey foreign key (terreiro_id) references public.terreiros(id) on delete cascade not valid;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.notices add constraint notices_terreiro_fkey foreign key (terreiro_id) references public.terreiros(id) on delete cascade not valid;
exception when duplicate_object then null; end $$;

create or replace function public.current_account_role()
returns text language sql stable security definer set search_path = public, auth as $$
  select role from public.accounts where id = auth.uid()
$$;
create or replace function public.current_terreiro_id()
returns text language sql stable security definer set search_path = public, auth as $$
  select nullif(terreiro_id, '') from public.accounts where id = auth.uid()
$$;
create or replace function public.is_global_admin()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select coalesce(public.current_account_role() = 'global_admin', false)
$$;
create or replace function public.is_terreiro_admin(target_terreiro text)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select public.is_global_admin() or (
    public.current_account_role() = 'terreiro_admin'
    and public.current_terreiro_id() = target_terreiro
  )
$$;

create or replace function public.resolve_login_email(identifier text)
returns text language sql stable security definer set search_path = public as $$
  select email from public.accounts
  where lower(username) = lower(trim(identifier)) or lower(email) = lower(trim(identifier))
  limit 1
$$;
revoke all on function public.resolve_login_email(text) from public;
grant execute on function public.resolve_login_email(text) to anon, authenticated;

create or replace function public.account_identifier_available(candidate_username text, candidate_email text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'username_available', not exists(select 1 from public.accounts where lower(username)=lower(trim(candidate_username))),
    'email_available', not exists(select 1 from public.accounts where lower(email)=lower(trim(candidate_email)))
  )
$$;
revoke all on function public.account_identifier_available(text, text) from public;
grant execute on function public.account_identifier_available(text, text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  insert into public.accounts (id, nome, email, username, scope, role, terreiro_id, user_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(new.email, '@', 1)),
    'global',
    'terreiro_user',
    null,
    null
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.complete_member_registration(
  member_name text, member_email text, member_phone text, invite_code text default null
) returns text language plpgsql security definer set search_path = public, auth as $$
declare
  account_uuid uuid := auth.uid();
  member_id text;
  target_terreiro text;
begin
  if account_uuid is null then raise exception 'Authentication required'; end if;
  if nullif(trim(invite_code), '') is not null then
    select id into target_terreiro from public.terreiros
      where lower(id)=lower(trim(invite_code)) and ativo=true limit 1;
    if target_terreiro is null then raise exception 'Invalid terreiro code'; end if;
  end if;
  member_id := 'user_' || replace(account_uuid::text, '-', '');
  update public.accounts set nome=trim(member_name), email=lower(trim(member_email)), scope=case when target_terreiro is null then 'global' else 'terreiro' end,
    role='terreiro_user', terreiro_id=target_terreiro, user_id=member_id, updated_at=now() where id=account_uuid;
  insert into public.users (id,nome,email,telefone,role,status,terreiro_id,access_account_id)
  values (member_id,trim(member_name),lower(trim(member_email)),trim(member_phone),'membro','ativo',target_terreiro,account_uuid)
  on conflict (id) do update set nome=excluded.nome,email=excluded.email,telefone=excluded.telefone,terreiro_id=excluded.terreiro_id,updated_at=now();
  return member_id;
end $$;
revoke all on function public.complete_member_registration(text,text,text,text) from public;
grant execute on function public.complete_member_registration(text,text,text,text) to authenticated;

create or replace function public.create_my_terreiro(
  terreiro_nome text, terreiro_sigla text, terreiro_cidade text, terreiro_estado text,
  terreiro_dirigente text, terreiro_contato text, terreiro_cor text
) returns text language plpgsql security definer set search_path = public, auth as $$
declare
  account_uuid uuid := auth.uid();
  new_id text;
begin
  if account_uuid is null then raise exception 'Authentication required'; end if;
  if exists(select 1 from public.accounts where id=account_uuid and nullif(terreiro_id,'') is not null) then
    raise exception 'Account already belongs to a terreiro';
  end if;
  loop
    new_id := 'T' || (1000 + floor(random()*9000))::int::text;
    exit when not exists(select 1 from public.terreiros where id=new_id);
  end loop;
  insert into public.terreiros(id,nome,sigla,cidade,estado,dirigente,contato,ativo,access_account_id,cor_tema,publicado)
  values(new_id,trim(terreiro_nome),upper(trim(terreiro_sigla)),trim(terreiro_cidade),upper(trim(terreiro_estado)),trim(terreiro_dirigente),trim(terreiro_contato),true,account_uuid,terreiro_cor,true);
  update public.accounts set nome=trim(terreiro_dirigente),scope='terreiro',role='terreiro_admin',terreiro_id=new_id,updated_at=now() where id=account_uuid;
  return new_id;
end $$;
revoke all on function public.create_my_terreiro(text,text,text,text,text,text,text) from public;
grant execute on function public.create_my_terreiro(text,text,text,text,text,text,text) to authenticated;

alter table public.accounts enable row level security;
alter table public.users enable row level security;
alter table public.terreiros enable row level security;
alter table public.events enable row level security;
alter table public.pontos enable row level security;
alter table public.notices enable row level security;
alter table public.prayer_requests enable row level security;

create policy accounts_select on public.accounts for select to authenticated using (
  id=auth.uid() or public.is_global_admin() or (public.current_account_role()='terreiro_admin' and nullif(terreiro_id,'')=public.current_terreiro_id())
);
create policy accounts_global_write on public.accounts for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy users_select on public.users for select to authenticated using (
  public.is_global_admin() or access_account_id=auth.uid() or (terreiro_id is not null and terreiro_id=public.current_terreiro_id())
);
create policy users_admin_write on public.users for all to authenticated using (public.is_terreiro_admin(terreiro_id)) with check (public.is_terreiro_admin(terreiro_id));
create policy terreiros_public_read on public.terreiros for select to anon, authenticated using (publicado=true or public.is_terreiro_admin(id));
create policy terreiros_admin_write on public.terreiros for all to authenticated using (public.is_terreiro_admin(id)) with check (public.is_terreiro_admin(id));
create policy events_public_read on public.events for select to anon, authenticated using (exists(select 1 from public.terreiros t where t.id=terreiro_id and t.publicado=true));
create policy events_admin_write on public.events for all to authenticated using (public.is_terreiro_admin(terreiro_id)) with check (public.is_terreiro_admin(terreiro_id));
create policy pontos_public_read on public.pontos for select to anon, authenticated using (exists(select 1 from public.terreiros t where t.id=terreiro_id and t.publicado=true));
create policy pontos_admin_write on public.pontos for all to authenticated using (public.is_terreiro_admin(terreiro_id)) with check (public.is_terreiro_admin(terreiro_id));
create policy notices_read on public.notices for select to authenticated using (public.is_global_admin() or terreiro_id=public.current_terreiro_id());
create policy notices_admin_write on public.notices for all to authenticated using (public.is_terreiro_admin(terreiro_id)) with check (public.is_terreiro_admin(terreiro_id));
create policy prayers_select on public.prayer_requests for select to authenticated using (
  public.is_terreiro_admin(terreiro_id) or account_id=auth.uid()::text
);
create policy prayers_insert on public.prayer_requests for insert to authenticated with check (
  account_id=auth.uid()::text and terreiro_id=public.current_terreiro_id()
);
create policy prayers_admin_update on public.prayer_requests for update to authenticated using (public.is_terreiro_admin(terreiro_id)) with check (public.is_terreiro_admin(terreiro_id));

grant select on public.terreiros, public.events, public.pontos to anon;
grant select, insert, update, delete on public.accounts, public.users, public.terreiros, public.events, public.pontos, public.notices, public.prayer_requests to authenticated;
