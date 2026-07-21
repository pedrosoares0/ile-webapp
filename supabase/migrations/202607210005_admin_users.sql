create or replace function public.create_auth_account(
  account_email text, account_password text, account_name text, account_username text
) returns uuid language plpgsql security definer set search_path=public,auth as $$
declare new_id uuid := gen_random_uuid();
begin
  if exists(select 1 from auth.users where lower(email)=lower(trim(account_email))) then
    raise exception 'E-mail already registered';
  end if;
  insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
    raw_app_meta_data,raw_user_meta_data,is_super_admin,created_at,updated_at,
    confirmation_token,recovery_token,email_change_token_new,email_change)
  values('00000000-0000-0000-0000-000000000000',new_id,'authenticated','authenticated',lower(trim(account_email)),
    crypt(account_password,gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nome',trim(account_name),'username',lower(trim(account_username)),'email_verified',true),
    false,now(),now(),'','','','');
  insert into auth.identities(id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
  values(new_id,new_id,jsonb_build_object('sub',new_id::text,'email',lower(trim(account_email)),'email_verified',true),
    'email',lower(trim(account_email)),now(),now(),now());
  return new_id;
end $$;
revoke all on function public.create_auth_account(text,text,text,text) from public,anon,authenticated;

create or replace function public.admin_save_member(
  member_id text, account_uuid uuid, member_name text, member_email text, member_phone text,
  member_role text, member_status text, target_terreiro text, access_role text, access_password text
) returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare
  saved_account uuid := account_uuid;
  saved_user text := coalesce(nullif(member_id,''),'user_'||replace(gen_random_uuid()::text,'-',''));
  generated_username text := split_part(lower(trim(member_email)),'@',1);
begin
  if not public.is_terreiro_admin(target_terreiro) then raise exception 'Access denied'; end if;
  if access_role not in ('terreiro_admin','terreiro_user') then raise exception 'Invalid access role'; end if;
  if member_role not in ('administrador','dirigente','membro','visitante') then raise exception 'Invalid member role'; end if;
  if member_status not in ('ativo','inativo') then raise exception 'Invalid member status'; end if;

  if saved_account is null then
    saved_account := public.create_auth_account(member_email,access_password,member_name,generated_username);
  else
    if not exists(select 1 from public.accounts a where a.id=saved_account and public.is_terreiro_admin(a.terreiro_id)) then
      raise exception 'Access denied';
    end if;
    update auth.users set email=lower(trim(member_email)),
      encrypted_password=case when nullif(access_password,'') is null then encrypted_password else crypt(access_password,gen_salt('bf')) end,
      updated_at=now() where id=saved_account;
    update auth.identities set provider_id=lower(trim(member_email)),identity_data=identity_data||jsonb_build_object('email',lower(trim(member_email))),updated_at=now()
      where user_id=saved_account and provider='email';
  end if;

  update public.accounts set nome=trim(member_name),email=lower(trim(member_email)),scope='terreiro',role=access_role,
    terreiro_id=target_terreiro,user_id=saved_user,updated_at=now() where id=saved_account;
  insert into public.users(id,nome,email,telefone,role,status,terreiro_id,access_account_id)
  values(saved_user,trim(member_name),lower(trim(member_email)),trim(member_phone),member_role,member_status,target_terreiro,saved_account)
  on conflict(id) do update set nome=excluded.nome,email=excluded.email,telefone=excluded.telefone,role=excluded.role,
    status=excluded.status,terreiro_id=excluded.terreiro_id,access_account_id=excluded.access_account_id,updated_at=now();
  return jsonb_build_object('user_id',saved_user,'account_id',saved_account);
end $$;
revoke all on function public.admin_save_member(text,uuid,text,text,text,text,text,text,text,text) from public;
grant execute on function public.admin_save_member(text,uuid,text,text,text,text,text,text,text,text) to authenticated;

create or replace function public.admin_delete_member(member_id text)
returns void language plpgsql security definer set search_path=public,auth as $$
declare target text; account_uuid uuid;
begin
  select terreiro_id,access_account_id into target,account_uuid from public.users where id=member_id;
  if target is null or not public.is_terreiro_admin(target) or account_uuid=auth.uid() then raise exception 'Access denied'; end if;
  delete from public.users where id=member_id;
  if account_uuid is not null then delete from auth.users where id=account_uuid; end if;
end $$;
revoke all on function public.admin_delete_member(text) from public;
grant execute on function public.admin_delete_member(text) to authenticated;

create or replace function public.global_save_terreiro(
  target_id text, terreiro_nome text, terreiro_sigla text, terreiro_cidade text, terreiro_estado text,
  terreiro_dirigente text, terreiro_contato text, terreiro_observacoes text, terreiro_ativo boolean,
  terreiro_cor text, access_email text, access_password text
) returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare saved_id text := nullif(target_id,''); account_uuid uuid;
begin
  if not public.is_global_admin() then raise exception 'Access denied'; end if;
  if saved_id is null then
    loop saved_id:='T'||(1000+floor(random()*9000))::int::text; exit when not exists(select 1 from public.terreiros where id=saved_id); end loop;
    account_uuid:=public.create_auth_account(access_email,access_password,terreiro_dirigente,split_part(access_email,'@',1));
    insert into public.terreiros(id,nome,sigla,cidade,estado,dirigente,contato,observacoes,ativo,access_account_id,cor_tema,publicado)
    values(saved_id,trim(terreiro_nome),upper(trim(terreiro_sigla)),trim(terreiro_cidade),upper(trim(terreiro_estado)),trim(terreiro_dirigente),trim(terreiro_contato),terreiro_observacoes,terreiro_ativo,account_uuid,terreiro_cor,true);
  else
    select access_account_id into account_uuid from public.terreiros where id=saved_id;
    if account_uuid is null then account_uuid:=public.create_auth_account(access_email,access_password,terreiro_dirigente,split_part(access_email,'@',1)); end if;
    update public.terreiros set nome=trim(terreiro_nome),sigla=upper(trim(terreiro_sigla)),cidade=trim(terreiro_cidade),estado=upper(trim(terreiro_estado)),
      dirigente=trim(terreiro_dirigente),contato=trim(terreiro_contato),observacoes=terreiro_observacoes,ativo=terreiro_ativo,
      access_account_id=account_uuid,cor_tema=terreiro_cor,updated_at=now() where id=saved_id;
    update auth.users set email=lower(trim(access_email)),encrypted_password=case when nullif(access_password,'') is null then encrypted_password else crypt(access_password,gen_salt('bf')) end,updated_at=now() where id=account_uuid;
  end if;
  update public.accounts set nome=trim(terreiro_dirigente),email=lower(trim(access_email)),scope='terreiro',role='terreiro_admin',terreiro_id=saved_id,updated_at=now() where id=account_uuid;
  return jsonb_build_object('terreiro_id',saved_id,'account_id',account_uuid);
end $$;
revoke all on function public.global_save_terreiro(text,text,text,text,text,text,text,text,boolean,text,text,text) from public;
grant execute on function public.global_save_terreiro(text,text,text,text,text,text,text,text,boolean,text,text,text) to authenticated;
