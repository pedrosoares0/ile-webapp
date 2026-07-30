-- Migration to add orixa column to accounts and users, and update complete_member_registration RPC

alter table public.accounts add column if not exists orixa text;
alter table public.users add column if not exists orixa text;

create or replace function public.complete_member_registration(
  member_name text, member_email text, member_phone text, invite_code text default null, member_orixa text default null
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
    role='terreiro_user', terreiro_id=target_terreiro, user_id=member_id, orixa=trim(member_orixa), updated_at=now() where id=account_uuid;
  insert into public.users (id,nome,email,telefone,role,status,terreiro_id,access_account_id,orixa)
  values (member_id,trim(member_name),lower(trim(member_email)),trim(member_phone),'membro','ativo',target_terreiro,account_uuid,trim(member_orixa))
  on conflict (id) do update set nome=excluded.nome,email=excluded.email,telefone=excluded.telefone,terreiro_id=excluded.terreiro_id,orixa=excluded.orixa,updated_at=now();
  return member_id;
end $$;

revoke all on function public.complete_member_registration(text,text,text,text,text) from public;
grant execute on function public.complete_member_registration(text,text,text,text,text) to authenticated;
