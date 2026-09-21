create table if not exists public.jokes (
  id bigint generated always as identity primary key,
  joke text not null,
  author text not null default 'anonymous',
  created_at timestamptz not null default now()
);

alter table public.jokes enable row level security;

create policy "Public can read jokes"
  on public.jokes for select
  to anon
  using (true);

insert into public.jokes (joke, author) values
  ('Why do programmers prefer dark mode? Because light attracts bugs.', 'annie'),
  ('There are 10 kinds of people: those who understand binary and those who do not.', 'annie'),
  ('A SQL query walks into a bar, walks up to two tables and asks: can I join you?', 'annie');
