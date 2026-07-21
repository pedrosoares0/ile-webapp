create table if not exists public.posts (
  id text primary key,
  terreiro_id text not null references public.terreiros(id) on delete cascade,
  author_account_id uuid references public.accounts(id) on delete set null,
  caption text not null,
  image_url text,
  location text,
  hashtags text[] not null default '{}',
  visibility text not null default 'public' check (visibility in ('public','members','admin')),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.stories (
  id text primary key,
  terreiro_id text not null references public.terreiros(id) on delete cascade,
  author_account_id uuid references public.accounts(id) on delete set null,
  title text not null,
  activity_description text,
  media_url text not null,
  published_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '24 hours'),
  created_at timestamptz not null default now()
);
create table if not exists public.post_reactions (
  post_id text not null references public.posts(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('coracao','concha','folha')),
  created_at timestamptz not null default now(),
  primary key(post_id,account_id)
);
create table if not exists public.favorite_terreiros (
  account_id uuid not null references public.accounts(id) on delete cascade,
  terreiro_id text not null references public.terreiros(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(account_id,terreiro_id)
);
create table if not exists public.saved_posts (
  account_id uuid not null references public.accounts(id) on delete cascade,
  post_id text not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(account_id,post_id)
);

create index if not exists posts_published_idx on public.posts(published_at desc);
create index if not exists posts_terreiro_idx on public.posts(terreiro_id,published_at desc);
create index if not exists stories_expiry_idx on public.stories(expires_at);
create index if not exists reactions_post_idx on public.post_reactions(post_id);

alter table public.posts enable row level security;
alter table public.stories enable row level security;
alter table public.post_reactions enable row level security;
alter table public.favorite_terreiros enable row level security;
alter table public.saved_posts enable row level security;

create policy posts_read on public.posts for select to anon,authenticated using (
  visibility='public' or public.is_terreiro_admin(terreiro_id) or (visibility='members' and terreiro_id=public.current_terreiro_id())
);
create policy posts_admin_write on public.posts for all to authenticated using (public.is_terreiro_admin(terreiro_id)) with check (public.is_terreiro_admin(terreiro_id));
create policy stories_read on public.stories for select to anon,authenticated using (
  expires_at>now() and exists(select 1 from public.terreiros t where t.id=terreiro_id and t.publicado=true)
);
create policy stories_admin_write on public.stories for all to authenticated using (public.is_terreiro_admin(terreiro_id)) with check (public.is_terreiro_admin(terreiro_id));
create policy reactions_read on public.post_reactions for select to anon,authenticated using (true);
create policy reactions_own_write on public.post_reactions for all to authenticated using (account_id=auth.uid()) with check (account_id=auth.uid());
create policy favorites_own on public.favorite_terreiros for all to authenticated using (account_id=auth.uid()) with check (account_id=auth.uid());
create policy saved_own on public.saved_posts for all to authenticated using (account_id=auth.uid()) with check (account_id=auth.uid());

grant select on public.posts,public.stories,public.post_reactions to anon;
grant select,insert,update,delete on public.posts,public.stories,public.post_reactions,public.favorite_terreiros,public.saved_posts to authenticated;

-- Existing visual demo content becomes real persisted database content.
insert into public.posts(id,terreiro_id,author_account_id,caption,image_url,location,hashtags,visibility,published_at)
select 'post_baianos','terreiro_t7ca',a.id,
  'Preparação a todo vapor para a nossa grande Gira de Baianos! Ervas selecionadas, terreiro limpo e aroma de alfazema no ar. Venham com fé e de coração aberto para receber o axé dos nossos baianos. 🕊️✨',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDyiPfE85MG4_7MptuepDfcOhZZ6dtithSCSpCBsE4qkKE1CUWdNr9Ad4&s=10',
  'Salvador, BA',array['#Baianos','#Umbanda','#Axé','#T7CA','#Caridade'],'public',now()-interval '2 hours'
from public.accounts a where a.username='erick'
on conflict(id) do nothing;

insert into public.stories(id,terreiro_id,author_account_id,title,activity_description,media_url,published_at,expires_at)
select 'story_t7ca','terreiro_t7ca',a.id,'GIRA DE BAIANOS',
  'Preparação para a Gira de Baianos com rezas, cânticos e defumação de ervas. Venha receber essa energia alegre!',
  'https://acdn-us.mitiendanube.com/stores/001/743/445/products/whatsapp-image-2023-10-19-at-19-28-36-0a2774e1b6724078cb16977551547981-1024-1024.webp',
  now(),now()+interval '30 days'
from public.accounts a where a.username='erick'
on conflict(id) do nothing;
