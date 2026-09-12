-- Run in the Supabase SQL editor. All fixtures are rolled back.
begin;
do $$
declare e uuid;
begin
  if has_table_privilege('anon', 'public.attendances', 'INSERT')
     or has_table_privilege('authenticated', 'public.attendances', 'INSERT')
     or has_table_privilege('authenticated', 'public.events', 'SELECT')
     or has_table_privilege('anon', 'public.members', 'SELECT') then
    raise exception 'Unexpected browser privileges';
  end if;
  if not has_table_privilege('authenticated', 'public.members', 'SELECT')
     or not has_table_privilege('service_role', 'public.attendances', 'INSERT') then
    raise exception 'Required access missing';
  end if;
  insert into public.events(title, checkin_opens_at, checkin_closes_at)
  values ('ROLLBACK ONLY integrity test', now() - interval '1 minute', now() + interval '1 minute')
  returning id into e;
  insert into public.attendances(event_id, email, name)
  values (e, 'integrity-a@example.invalid', 'Same name'),
         (e, 'integrity-b@example.invalid', 'Same name');
  begin
    insert into public.attendances(event_id, email, name)
    values (e, 'INTEGRITY-A@example.invalid', 'Changed name');
    raise exception 'Duplicate was not blocked';
  exception when unique_violation then null;
  end;
end $$;
select 'PASS: same names allowed, duplicate emails blocked, browser writes denied, server access retained' as result;
rollback;
