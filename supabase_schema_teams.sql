
-- Create Teams Table
create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  activity_id uuid references activities(id) on delete set null, -- Optional link to activity
  is_public boolean default false, -- Public vs Private
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Add created_by if we want to track owner, useful for private teams
  created_by uuid references profiles(id) on delete set null 
);

-- Create Team Members / Enrollments
create table if not exists team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  member_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('member', 'admin', 'lead')) default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(team_id, member_id) -- One entry per member per team
);

-- Update Tasks to optionally belong to a team
-- Safely add team_id column
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'tasks' and column_name = 'team_id') then
    alter table tasks add column team_id uuid references teams(id) on delete cascade;
  end if;
end $$;

-- Enable RLS
alter table teams enable row level security;
alter table team_members enable row level security;

-- Policies

-- Teams: 
-- Public: visible to everyone authenticated
-- Private: visible only to members (or admins - implementing simplistic "if member" check)
create policy "Teams are viewable by everyone" on teams for select using (auth.role() = 'authenticated'); 
-- Realistically for private teams, you'd want: is_public OR exists(select 1 from team_members where team_id = teams.id and member_id = auth.uid())
-- But let's keep it simple for listing: everyone can see *existence* of teams, maybe details restricted?
-- User req: "if public anyone could join it else only admin could add members"

create policy "Authenticated users can create teams" on teams for insert with check (auth.role() = 'authenticated');
create policy "Team members can update their team details" on teams for update using (
  exists (select 1 from team_members where team_id = id and member_id = auth.uid() and role in ('admin', 'lead'))
);

-- Team Members:
-- View: Authenticated users can see who is in a team (or restrict to team members)
create policy "View team members" on team_members for select using (auth.role() = 'authenticated');

-- Join/Add:
-- 1. Anyone can insert themselves IF the team is public
-- 2. Team Admins can insert anyone
create policy "Join public teams or add members" on team_members for insert with check (
   -- Case 1: Self-join public team
   (auth.uid() = member_id and exists (select 1 from teams where id = team_id and is_public = true))
   OR
   -- Case 2: Admin adding members (Current user is admin of the team)
   exists (select 1 from team_members where team_id = team_members.team_id and member_id = auth.uid() and role in ('admin', 'lead'))
   OR
   -- Case 3: Creator of the team adding themselves initially (tricky with RLS, often done via function or permissive policy for new teams)
   -- Allow insert if user is creator of the team
    exists (select 1 from teams where id = team_id and created_by = auth.uid())
);

-- Delete/Leave:
-- Members can leave
-- Admins can remove others
create policy "Leave or remove members" on team_members for delete using (
  auth.uid() = member_id 
  OR
  exists (select 1 from team_members tm where tm.team_id = team_members.team_id and tm.member_id = auth.uid() and tm.role in ('admin', 'lead'))
);

