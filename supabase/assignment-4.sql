-- Assignment 4: AI captions + voting, and strict RLS on every table.
-- Safe to re-run: everything is idempotent.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  storage_path text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists images_created_at_idx on public.images (created_at desc);
create index if not exists images_user_id_idx on public.images (user_id);

create table if not exists public.captions (
  id uuid primary key default gen_random_uuid(),
  image_id uuid not null references public.images (id) on delete cascade,
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 300),
  style text not null,
  prompt text not null,
  model text not null,
  score integer not null default 0,
  vote_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists captions_image_id_idx on public.captions (image_id);
create index if not exists captions_score_idx on public.captions (score desc, created_at desc);

create table if not exists public.votes (
  id bigint generated always as identity primary key,
  caption_id uuid not null references public.captions (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (caption_id, user_id)
);
create index if not exists votes_user_id_idx on public.votes (user_id);

-- ---------------------------------------------------------------------------
-- Keep captions.score / vote_count in sync with votes.
-- Clients never write those columns; only this trigger does.
-- ---------------------------------------------------------------------------

create or replace function public.recompute_caption_score(p_caption_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.captions c
  set score = coalesce((select sum(v.value) from public.votes v where v.caption_id = p_caption_id), 0),
      vote_count = (select count(*) from public.votes v where v.caption_id = p_caption_id)
  where c.id = p_caption_id;
$$;

revoke all on function public.recompute_caption_score(uuid) from public, anon, authenticated;

create or replace function public.votes_after_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public.recompute_caption_score(old.caption_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    perform public.recompute_caption_score(new.caption_id);
  end if;
  return null;
end;
$$;

drop trigger if exists votes_refresh_score on public.votes;
create trigger votes_refresh_score
  after insert or update or delete on public.votes
  for each row execute function public.votes_after_change();

-- ---------------------------------------------------------------------------
-- Row level security: ON for every table in public.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.jokes enable row level security;
alter table public.images enable row level security;
alter table public.captions enable row level security;
alter table public.votes enable row level security;

-- profiles: you can see and edit only your own row. Rows are created by the
-- on_auth_user_created trigger (security definer), so there is no insert policy.
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- jokes (assignment 2): read-only for everyone, including signed-in users.
drop policy if exists "Public can read jokes" on public.jokes;
create policy "Public can read jokes"
  on public.jokes for select to anon, authenticated
  using (true);

-- images: public to read; you can only add images as yourself.
drop policy if exists "Anyone can read images" on public.images;
create policy "Anyone can read images"
  on public.images for select to anon, authenticated
  using (true);

drop policy if exists "Users can add their own images" on public.images;
create policy "Users can add their own images"
  on public.images for insert to authenticated
  with check (user_id = (select auth.uid()));

-- captions: public to read; you can only add captions to your own images, as
-- yourself, with a zeroed score. No update/delete policies, so scores can only
-- move through the votes trigger.
drop policy if exists "Anyone can read captions" on public.captions;
create policy "Anyone can read captions"
  on public.captions for select to anon, authenticated
  using (true);

drop policy if exists "Users can add captions to their own images" on public.captions;
create policy "Users can add captions to their own images"
  on public.captions for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and score = 0
    and vote_count = 0
    and exists (
      select 1 from public.images i
      where i.id = image_id and i.user_id = (select auth.uid())
    )
  );

-- votes: signed-in users only, and only their own rows. Nobody can read other
-- people's votes; the public only sees the aggregate stored on captions.
drop policy if exists "Users can read their own votes" on public.votes;
create policy "Users can read their own votes"
  on public.votes for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can cast their own votes" on public.votes;
create policy "Users can cast their own votes"
  on public.votes for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can change their own votes" on public.votes;
create policy "Users can change their own votes"
  on public.votes for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can remove their own votes" on public.votes;
create policy "Users can remove their own votes"
  on public.votes for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage: photos bucket + tightened avatars bucket.
-- Both buckets are public (served by public URL, which bypasses RLS), so the
-- policies below only govern who may upload, and only into their own folder.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

update storage.buckets
set file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'avatars';

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Anyone can upload an avatar" on storage.objects;
drop policy if exists "Anyone can update an avatar" on storage.objects;
drop policy if exists "Users upload avatars to their own folder" on storage.objects;
drop policy if exists "Users upload photos to their own folder" on storage.objects;

create policy "Users upload avatars to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users upload photos to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
