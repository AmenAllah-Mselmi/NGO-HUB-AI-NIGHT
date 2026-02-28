-- ============================================================
-- ENSURE ALL PROFILES EXIST
-- ============================================================

-- 1. Create missing profiles for existing auth users
insert into public.profiles (id, email, fullname)
select id, email, raw_user_meta_data->>'fullname'
from auth.users
on conflict (id) do nothing;

-- 2. Grant necessary permissions (if missed)
grant usage on schema public to anon, authenticated;
grant all on public.profiles to service_role;
grant select, update, insert on public.profiles to authenticated;

-- 3. Trigger function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, fullname, phone, birth_date)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'fullname',
    new.raw_user_meta_data->>'phone',
    (new.raw_user_meta_data->>'birth_date')::date
  ) on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 4. Re-enable the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Ensure RLS allows users to see their own profile at minimum
alter table public.profiles enable row level security;

drop policy if exists "Profiles: users can read own" on public.profiles;
create policy "Profiles: users can read own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Profiles: users can update own" on public.profiles;
create policy "Profiles: users can update own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Profiles: authenticated users can read all" on public.profiles;
create policy "Profiles: authenticated users can read all" on public.profiles
  for select using (auth.role() = 'authenticated');
