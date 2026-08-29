create table if not exists public.members (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.members enable row level security;

create policy "Members can read their own profile"
on public.members
for select
to authenticated
using (auth.uid() = id);

insert into public.members (id, email, full_name)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', '')
from auth.users
where email is not null
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name;
