create or replace function public.resolve_login_context(identifier text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('email',email,'terreiro_id',nullif(terreiro_id,''))
  from public.accounts
  where lower(username)=lower(trim(identifier)) or lower(email)=lower(trim(identifier))
  limit 1
$$;
revoke all on function public.resolve_login_context(text) from public;
grant execute on function public.resolve_login_context(text) to anon,authenticated;

drop policy if exists prayers_insert on public.prayer_requests;
create policy prayers_insert on public.prayer_requests for insert to authenticated with check (
  account_id=auth.uid()::text
  and exists(select 1 from public.terreiros t where t.id=terreiro_id and t.publicado=true and t.ativo=true)
);
