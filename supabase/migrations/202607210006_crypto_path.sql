alter function public.create_auth_account(text,text,text,text) set search_path=public,auth,extensions;
alter function public.admin_save_member(text,uuid,text,text,text,text,text,text,text,text) set search_path=public,auth,extensions;
alter function public.global_save_terreiro(text,text,text,text,text,text,text,text,boolean,text,text,text) set search_path=public,auth,extensions;
