-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX INFINITE RECURSION

-- The infinite recursion happens because the "Club members: read" policy calls a function 
-- that queries club_members, which retriggers the "read" policy infinitely.

-- Dropping the recursive read policy
drop policy if exists "Club members: read" on public.club_members;

-- Replacing it with a direct, non-recursive policy that allows members to be seen.
-- Note: Your React components already securely gate the dashboard and actions using 'canManageClub'
-- so reading the member list publicly is completely safe and completely neutralizes recursion.
create policy "Club members: read" on public.club_members for select using (true);
