-- Development-only real account used by the visible quick-login button.
do $$
declare
  demo_id uuid;
begin
  select id into demo_id from auth.users where lower(email)='hub@ile.app';
  if demo_id is null then
    demo_id := gen_random_uuid();
    insert into auth.users(
      instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
      raw_app_meta_data,raw_user_meta_data,is_super_admin,created_at,updated_at,
      confirmation_token,recovery_token,email_change_token_new,email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',demo_id,'authenticated','authenticated','hub@ile.app',
      crypt('123456',gen_salt('bf')),now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nome":"Membro do Hub","username":"membro.hub","demo":true,"email_verified":true}'::jsonb,
      false,now(),now(),'','','',''
    );
    insert into auth.identities(id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
    values(demo_id,demo_id,jsonb_build_object('sub',demo_id::text,'email','hub@ile.app','email_verified',true),'email','hub@ile.app',now(),now(),now());
  end if;
  update public.accounts set nome='Membro do Hub',email='hub@ile.app',username='membro.hub',scope='global',role='terreiro_user',terreiro_id=null,updated_at=now()
  where id=demo_id;
  insert into public.users(id,nome,email,role,status,terreiro_id,access_account_id)
  values('user_demo_hub','Membro do Hub','hub@ile.app','visitante','ativo',null,demo_id)
  on conflict(id) do update set access_account_id=excluded.access_account_id,updated_at=now();
  update public.accounts set user_id='user_demo_hub' where id=demo_id;
end $$;
