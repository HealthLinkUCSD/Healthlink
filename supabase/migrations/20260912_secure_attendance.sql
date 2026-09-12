begin;
create unique index if not exists attendances_event_email_unique
  on public.attendances (event_id, lower(btrim(email)));
alter table public.attendances drop constraint if exists attendances_user_event_key;
alter table public.events enable row level security;
alter table public.attendances enable row level security;
alter table public.members enable row level security;
revoke all on public.events, public.attendances from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.members from anon, authenticated;
revoke select on public.members from anon;
alter function public.handle_new_user() set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;
commit;

