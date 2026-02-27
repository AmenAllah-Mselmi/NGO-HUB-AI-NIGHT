-- =============================================================================
-- NGO Hub — Complete Database Schema (Auto-Migration)
-- Run this file against your Supabase project to create or update all tables.
-- All statements use IF NOT EXISTS / DO-NOTHING guards so it is safe to re-run.
-- =============================================================================

-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. ORGANIZATIONS (Multi-tenant root)
-- ============================================================
create table if not exists organizations (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  slug        text unique not null,
  logo_url    text,
  description text,
  website     text,
  country     text,
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

alter table organizations enable row level security;

drop policy if exists "Orgs: authenticated read" on organizations;
create policy "Orgs: authenticated read" on organizations
  for select using (auth.role() = 'authenticated');

drop policy if exists "Orgs: owner manage" on organizations;
create policy "Orgs: owner manage" on organizations
  for all using (auth.role() = 'authenticated');

-- ============================================================
-- 2. PROFILES (Members)
-- ============================================================
create table if not exists profiles (
  id                uuid references auth.users on delete cascade primary key,
  fullname          text,
  email             text,
  phone             text,
  birth_date        date,
  gender            text,
  avatar_url        text,
  points            integer default 0,
  cotisation_status text check (cotisation_status in ('paid', 'unpaid', 'exempt')) default 'unpaid',
  is_validated      boolean default false,
  advisor_id        uuid references profiles(id) on delete set null,
  organization_id   uuid references organizations(id) on delete set null,
  created_at        timestamp with time zone default timezone('utc', now()) not null
);

do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='organization_id') then
    alter table profiles add column organization_id uuid references organizations(id) on delete set null;
  end if;
end $$;

alter table profiles enable row level security;

drop policy if exists "Profiles: authenticated read" on profiles;
create policy "Profiles: authenticated read" on profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "Profiles: self update" on profiles;
create policy "Profiles: self update" on profiles
  for update using (auth.uid() = id);

-- ============================================================
-- 3. ROLES & POSTES
-- ============================================================
create table if not exists roles (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  member_id   uuid references profiles(id) on delete cascade,
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

create table if not exists postes (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  member_id   uuid references profiles(id) on delete cascade,
  start_date  date,
  end_date    date,
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

alter table roles  enable row level security;
alter table postes enable row level security;

drop policy if exists "Roles: authenticated" on roles;
create policy "Roles: authenticated" on roles for all using (auth.role() = 'authenticated');

drop policy if exists "Postes: authenticated" on postes;
create policy "Postes: authenticated" on postes for all using (auth.role() = 'authenticated');

-- ============================================================
-- 4. POINTS HISTORY
-- ============================================================
create table if not exists points_history (
  id          uuid default gen_random_uuid() primary key,
  member_id   uuid references profiles(id) on delete cascade not null,
  points      integer not null,
  source_type text,
  source_id   uuid,
  description text,
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

alter table points_history enable row level security;

drop policy if exists "Points history: authenticated" on points_history;
create policy "Points history: authenticated" on points_history for all using (auth.role() = 'authenticated');

-- ============================================================
-- 5. OBJECTIVES
-- ============================================================
create table if not exists objectives (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  description text,
  pillar      text,
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

create table if not exists member_objectives (
  id           uuid default gen_random_uuid() primary key,
  member_id    uuid references profiles(id) on delete cascade not null,
  objective_id uuid references objectives(id) on delete cascade not null,
  status       text check (status in ('not_started','in_progress','completed')) default 'not_started',
  progress     integer default 0,
  created_at   timestamp with time zone default timezone('utc', now()) not null,
  unique(member_id, objective_id)
);

alter table objectives        enable row level security;
alter table member_objectives enable row level security;

drop policy if exists "Objectives: authenticated" on objectives;
create policy "Objectives: authenticated" on objectives for all using (auth.role() = 'authenticated');

drop policy if exists "Member objectives: authenticated" on member_objectives;
create policy "Member objectives: authenticated" on member_objectives for all using (auth.role() = 'authenticated');

-- ============================================================
-- 6. COMPLAINTS
-- ============================================================
create table if not exists complaints (
  id          uuid default gen_random_uuid() primary key,
  member_id   uuid references profiles(id) on delete cascade not null,
  subject     text not null,
  description text,
  status      text check (status in ('open','in_review','resolved')) default 'open',
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

alter table complaints enable row level security;

drop policy if exists "Complaints: authenticated" on complaints;
create policy "Complaints: authenticated" on complaints for all using (auth.role() = 'authenticated');

-- ============================================================
-- 7. JPS SNAPSHOTS
-- ============================================================
create table if not exists jps_snapshots (
  id          uuid default gen_random_uuid() primary key,
  member_id   uuid references profiles(id) on delete cascade not null,
  year        integer not null,
  month       integer not null,
  trimester   integer not null,
  score       numeric(5,2) default 0,
  category    text,
  created_at  timestamp with time zone default timezone('utc', now()) not null,
  unique(member_id, year, month)
);

alter table jps_snapshots enable row level security;

drop policy if exists "JPS snapshots: authenticated" on jps_snapshots;
create policy "JPS snapshots: authenticated" on jps_snapshots for all using (auth.role() = 'authenticated');

-- ============================================================
-- 8. ACTIVITIES + SUB-TYPES
-- ============================================================
create table if not exists activities (
  id                  uuid default gen_random_uuid() primary key,
  title               text not null,
  description         text,
  activity_type       text check (activity_type in ('event','meeting','formation','general_assembly')) not null,
  activity_begin_date date,
  activity_end_date   date,
  activity_address    text,
  image_url           text,
  video_url           text,
  recap_videos        text[],
  pillar              text,
  organization_id     uuid references organizations(id) on delete set null,
  created_by          uuid references profiles(id) on delete set null,
  created_at          timestamp with time zone default timezone('utc', now()) not null
);

do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='activities' and column_name='organization_id') then
    alter table activities add column organization_id uuid references organizations(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='activities' and column_name='video_url') then
    alter table activities add column video_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='activities' and column_name='recap_videos') then
    alter table activities add column recap_videos text[];
  end if;
end $$;

create table if not exists events (
  id                    uuid default gen_random_uuid() primary key,
  activity_id           uuid references activities(id) on delete cascade unique,
  registration_deadline date
);

create table if not exists meetings (
  id          uuid default gen_random_uuid() primary key,
  activity_id uuid references activities(id) on delete cascade unique,
  agenda      text
);

create table if not exists formations (
  id          uuid default gen_random_uuid() primary key,
  activity_id uuid references activities(id) on delete cascade unique,
  trainer     text,
  duration_h  numeric(5,2)
);

create table if not exists general_assemblies (
  id            uuid default gen_random_uuid() primary key,
  activity_id   uuid references activities(id) on delete cascade unique,
  assembly_type text
);

create table if not exists activity_participants (
  id          uuid default gen_random_uuid() primary key,
  activity_id uuid references activities(id) on delete cascade not null,
  member_id   uuid references profiles(id) on delete cascade not null,
  role        text default 'participant',
  joined_at   timestamp with time zone default timezone('utc', now()) not null,
  unique(activity_id, member_id)
);

create table if not exists categories (
  id   uuid default gen_random_uuid() primary key,
  name text not null unique
);

create table if not exists activity_categories (
  id          uuid default gen_random_uuid() primary key,
  activity_id uuid references activities(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  unique(activity_id, category_id)
);

alter table activities           enable row level security;
alter table activity_participants enable row level security;
alter table categories           enable row level security;
alter table activity_categories  enable row level security;

drop policy if exists "Activities: authenticated" on activities;
create policy "Activities: authenticated" on activities for all using (auth.role() = 'authenticated');

drop policy if exists "Participants: authenticated" on activity_participants;
create policy "Participants: authenticated" on activity_participants for all using (auth.role() = 'authenticated');

drop policy if exists "Categories: authenticated" on categories;
create policy "Categories: authenticated" on categories for all using (auth.role() = 'authenticated');

drop policy if exists "Activity categories: authenticated" on activity_categories;
create policy "Activity categories: authenticated" on activity_categories for all using (auth.role() = 'authenticated');

-- ============================================================
-- 9. RECRUITMENT (Candidates)
-- ============================================================
create table if not exists candidates (
  id              uuid default gen_random_uuid() primary key,
  fullname        text not null,
  email           text,
  phone           text,
  status          text check (status in ('new','in_review','accepted','rejected')) default 'new',
  score           numeric(5,2),
  notes           text,
  organization_id uuid references organizations(id) on delete set null,
  created_at      timestamp with time zone default timezone('utc', now()) not null
);

do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='candidates' and column_name='organization_id') then
    alter table candidates add column organization_id uuid references organizations(id) on delete set null;
  end if;
end $$;

alter table candidates enable row level security;

drop policy if exists "Candidates: authenticated" on candidates;
create policy "Candidates: authenticated" on candidates for all using (auth.role() = 'authenticated');

-- ============================================================
-- 10. PROJECTS & TEAMS
-- ============================================================
create table if not exists projects (
  id              uuid default gen_random_uuid() primary key,
  name            text not null,
  description     text,
  leader_id       uuid references profiles(id) on delete set null,
  organization_id uuid references organizations(id) on delete set null,
  created_at      timestamp with time zone default timezone('utc', now()) not null
);

do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='projects' and column_name='organization_id') then
    alter table projects add column organization_id uuid references organizations(id) on delete set null;
  end if;
end $$;

create table if not exists project_members (
  id         uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  member_id  uuid references profiles(id) on delete cascade not null,
  role       text check (role in ('member','admin')) default 'member',
  joined_at  timestamp with time zone default timezone('utc', now()) not null,
  unique(project_id, member_id)
);

create table if not exists teams (
  id              uuid default gen_random_uuid() primary key,
  name            text not null,
  description     text,
  activity_id     uuid references activities(id) on delete set null,
  project_id      uuid references projects(id) on delete cascade,
  is_public       boolean default false,
  strategy        text,
  resources       jsonb default '[]'::jsonb,
  organization_id uuid references organizations(id) on delete set null,
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamp with time zone default timezone('utc', now()) not null
);

do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='teams' and column_name='organization_id') then
    alter table teams add column organization_id uuid references organizations(id) on delete set null;
  end if;
end $$;

create table if not exists team_members (
  id        uuid default gen_random_uuid() primary key,
  team_id   uuid references teams(id) on delete cascade not null,
  member_id uuid references profiles(id) on delete cascade not null,
  role      text check (role in ('member','admin','lead')) default 'member',
  joined_at timestamp with time zone default timezone('utc', now()) not null,
  unique(team_id, member_id)
);

-- Helper functions (Security Definer) to break RLS recursion
create or replace function public.is_team_public(t_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  return exists (select 1 from teams where id = t_id and is_public = true);
end; $$;

create or replace function public.is_team_member(t_id uuid, u_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  return exists (select 1 from team_members where team_id = t_id and member_id = u_id);
end; $$;

create or replace function public.can_admin_team(t_id uuid, u_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  return exists (select 1 from teams where id = t_id and created_by = u_id)
      or exists (select 1 from team_members where team_id = t_id and member_id = u_id and role in ('admin','lead'));
end; $$;

create or replace function public.is_project_admin(p_id uuid, u_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  return exists (select 1 from project_members where project_id = p_id and member_id = u_id and role = 'admin');
end; $$;

alter table projects        enable row level security;
alter table project_members enable row level security;
alter table teams           enable row level security;
alter table team_members    enable row level security;

drop policy if exists "Projects: authenticated" on projects;
create policy "Projects: authenticated" on projects for all using (auth.role() = 'authenticated');

drop policy if exists "Project members: authenticated" on project_members;
create policy "Project members: authenticated" on project_members for all using (auth.role() = 'authenticated');

drop policy if exists "View teams" on teams;
create policy "View teams" on teams for select using (
  is_public = true or created_by = auth.uid() or public.is_team_member(id, auth.uid())
);

drop policy if exists "Update teams" on teams;
create policy "Update teams" on teams for update using (public.can_admin_team(id, auth.uid()));

drop policy if exists "View team members" on team_members;
create policy "View team members" on team_members for select using (auth.role() = 'authenticated');

drop policy if exists "Add team members" on team_members;
create policy "Add team members" on team_members for insert with check (
  (auth.uid() = member_id and public.is_team_public(team_id))
  or public.can_admin_team(team_id, auth.uid())
);

drop policy if exists "Remove team members" on team_members;
create policy "Remove team members" on team_members for delete using (
  auth.uid() = member_id or public.can_admin_team(team_id, auth.uid())
);

-- ============================================================
-- 11. TASKS
-- ============================================================
create table if not exists tasks (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  description text,
  points      integer default 0,
  subtasks    jsonb default '[]'::jsonb,
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='tasks' and column_name='points') then
    alter table tasks add column points integer default 0;
  end if;
end $$;

create table if not exists member_tasks (
  id                    uuid default gen_random_uuid() primary key,
  task_id               uuid references tasks(id) on delete cascade not null,
  member_id             uuid references profiles(id) on delete cascade not null,
  status                text check (status in ('todo','in_progress','completed')) default 'todo',
  tracking_type         text check (tracking_type in ('manual','subtasks')) default 'subtasks',
  progress_percentage   integer default 0,
  completed_subtask_ids jsonb default '[]'::jsonb,
  assigned_at           timestamp with time zone default timezone('utc', now()) not null,
  updated_at            timestamp with time zone default timezone('utc', now()) not null
);

alter table tasks        enable row level security;
alter table member_tasks enable row level security;

drop policy if exists "Enable all access for authenticated users" on tasks;
create policy "Enable all access for authenticated users" on tasks for all using (auth.role() = 'authenticated');

drop policy if exists "Enable all access for authenticated users" on member_tasks;
create policy "Enable all access for authenticated users" on member_tasks for all using (auth.role() = 'authenticated');

-- Trigger: Award / return points on task completion
create or replace function handle_task_completion()
returns trigger as $$
declare
  task_points integer;
  task_title  text;
begin
  if new.status = 'completed' and (old.status is null or old.status != 'completed') then
    select points, title into task_points, task_title from tasks where id = new.task_id;
    if task_points > 0 then
      update profiles set points = coalesce(points, 0) + task_points where id = new.member_id;
      insert into points_history (member_id, points, source_type, source_id, description)
        values (new.member_id, task_points, 'task', new.task_id, 'Completed Task: ' || task_title);
    end if;
  elsif old.status = 'completed' and new.status != 'completed' then
    select points, title into task_points, task_title from tasks where id = new.task_id;
    if task_points > 0 then
      update profiles set points = coalesce(points, 0) - task_points where id = new.member_id;
      insert into points_history (member_id, points, source_type, source_id, description)
        values (new.member_id, -task_points, 'task', new.task_id, 'Task Reopened: ' || task_title || ' (Points Returned)');
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_task_completion on member_tasks;
create trigger on_task_completion
  after update on member_tasks
  for each row execute function handle_task_completion();

-- Trigger: Return points when assignment is deleted
create or replace function handle_task_deletion()
returns trigger as $$
declare
  task_points integer;
  task_title  text;
begin
  if old.status = 'completed' then
    select points, title into task_points, task_title from tasks where id = old.task_id;
    if task_points > 0 then
      update profiles set points = coalesce(points, 0) - task_points where id = old.member_id;
      insert into points_history (member_id, points, source_type, source_id, description)
        values (old.member_id, -task_points, 'task', old.task_id, 'Assignment Deleted: ' || task_title || ' (Points Returned)');
    end if;
  end if;
  return old;
end;
$$ language plpgsql;

drop trigger if exists on_task_deletion on member_tasks;
create trigger on_task_deletion
  after delete on member_tasks
  for each row execute function handle_task_deletion();

-- Trigger: Block direct delete of completed assignments
create or replace function prevent_completed_task_modification()
returns trigger as $$
begin
  if TG_OP = 'DELETE' and old.status = 'completed' then
    raise exception 'Cannot delete a completed task assignment. Reopen it first.';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists check_completed_task_lock on member_tasks;
create trigger check_completed_task_lock
  before update or delete on member_tasks
  for each row execute function prevent_completed_task_modification();

-- ============================================================
-- END OF SCHEMA
-- ============================================================
