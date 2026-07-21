create table if not exists public.membership_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  terreiro_id text not null references public.terreiros(id) on delete cascade,
  request_type text not null check(request_type in ('interest','invite_code')),
  status text not null default 'pending' check(status in ('pending','approved','rejected','cancelled')),
  message text,
  reviewed_by uuid references public.accounts(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists membership_one_pending_idx on public.membership_requests(account_id) where status='pending';
create index if not exists membership_terreiro_status_idx on public.membership_requests(terreiro_id,status,created_at);

alter table public.membership_requests enable row level security;
create policy membership_own_read on public.membership_requests for select to authenticated
  using(account_id=auth.uid() or public.is_terreiro_admin(terreiro_id));
grant select on public.membership_requests to authenticated;

create or replace function public.create_membership_request(
  target_terreiro text default null, invite_code text default null, request_message text default null
) returns uuid language plpgsql security definer set search_path=public,auth as $$
declare requester uuid:=auth.uid(); resolved_terreiro text; request_kind text; new_id uuid;
begin
  if requester is null then raise exception 'Authentication required'; end if;
  if public.current_terreiro_id() is not null then raise exception 'Account already belongs to a terreiro'; end if;
  if nullif(trim(invite_code),'') is not null then
    select id into resolved_terreiro from public.terreiros where lower(id)=lower(trim(invite_code)) and ativo=true limit 1;
    request_kind:='invite_code';
  else
    select id into resolved_terreiro from public.terreiros where id=target_terreiro and ativo=true and publicado=true limit 1;
    request_kind:='interest';
  end if;
  if resolved_terreiro is null then raise exception 'Terreiro not found'; end if;
  if exists(select 1 from public.membership_requests where account_id=requester and status='pending') then
    raise exception 'There is already a pending request';
  end if;
  insert into public.membership_requests(account_id,terreiro_id,request_type,message)
  values(requester,resolved_terreiro,request_kind,nullif(trim(request_message),'')) returning id into new_id;
  return new_id;
end $$;
revoke all on function public.create_membership_request(text,text,text) from public;
grant execute on function public.create_membership_request(text,text,text) to authenticated;

create or replace function public.review_membership_request(target_request uuid, approve_request boolean)
returns void language plpgsql security definer set search_path=public,auth as $$
declare req public.membership_requests%rowtype; member_id text; member_name text; member_email text;
begin
  select * into req from public.membership_requests where id=target_request and status='pending' for update;
  if req.id is null then raise exception 'Pending request not found'; end if;
  if not public.is_terreiro_admin(req.terreiro_id) then raise exception 'Access denied'; end if;
  if approve_request then
    if exists(select 1 from public.accounts where id=req.account_id and nullif(terreiro_id,'') is not null) then
      raise exception 'Account already belongs to a terreiro';
    end if;
    select coalesce(nullif(user_id,''),'user_'||replace(req.account_id::text,'-','')),nome,email
      into member_id,member_name,member_email from public.accounts where id=req.account_id;
    update public.accounts set scope='terreiro',role='terreiro_user',terreiro_id=req.terreiro_id,user_id=member_id,updated_at=now()
      where id=req.account_id;
    insert into public.users(id,nome,email,role,status,terreiro_id,access_account_id)
    values(member_id,coalesce(member_name,''),member_email,'membro','ativo',req.terreiro_id,req.account_id)
    on conflict(id) do update set terreiro_id=excluded.terreiro_id,access_account_id=excluded.access_account_id,status='ativo',updated_at=now();
    update public.membership_requests set status='approved',reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() where id=req.id;
  else
    update public.membership_requests set status='rejected',reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() where id=req.id;
  end if;
end $$;
revoke all on function public.review_membership_request(uuid,boolean) from public;
grant execute on function public.review_membership_request(uuid,boolean) to authenticated;

update storage.buckets set public=true,file_size_limit=5242880,
  allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif']
where id in ('posts','stories','terreiros');

create policy ile_media_public_read on storage.objects for select to anon,authenticated
  using(bucket_id in ('posts','stories','terreiros'));
create policy ile_media_admin_insert on storage.objects for insert to authenticated
  with check(bucket_id in ('posts','stories','terreiros') and public.is_terreiro_admin((storage.foldername(name))[1]));
create policy ile_media_admin_update on storage.objects for update to authenticated
  using(bucket_id in ('posts','stories','terreiros') and public.is_terreiro_admin((storage.foldername(name))[1]))
  with check(bucket_id in ('posts','stories','terreiros') and public.is_terreiro_admin((storage.foldername(name))[1]));
create policy ile_media_admin_delete on storage.objects for delete to authenticated
  using(bucket_id in ('posts','stories','terreiros') and public.is_terreiro_admin((storage.foldername(name))[1]));
