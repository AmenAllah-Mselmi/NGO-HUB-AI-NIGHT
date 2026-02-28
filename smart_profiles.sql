-- ============================================================
-- PROFIL INTELLIGENT (SMART PROFILES) SCHEMA
-- ============================================================

-- 1. Updates to the main profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS supported_causes text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS total_volunteering_hours integer DEFAULT 0;

-- ============================================================
-- 2. MEMBER EXPERIENCES (CV Associatif)
-- ============================================================
create table if not exists member_experiences (
  id           uuid default gen_random_uuid() primary key,
  member_id    uuid references profiles(id) on delete cascade not null,
  title        text not null,                 -- e.g., 'Project Manager', 'Volunteer'
  organization text not null,                 -- e.g., 'Red Cross', 'Local Food Bank'
  description  text,                          -- Details about what they did
  start_date   date,
  end_date     date,
  is_current   boolean default false,
  created_at   timestamp with time zone default timezone('utc', now()) not null
);

alter table member_experiences enable row level security;

drop policy if exists "Experiences: everyone can read" on member_experiences;
create policy "Experiences: everyone can read" 
on member_experiences for select using (auth.role() = 'authenticated');

drop policy if exists "Experiences: members can insert their own" on member_experiences;
create policy "Experiences: members can insert their own" 
on member_experiences for insert with check (auth.uid() = member_id);

drop policy if exists "Experiences: members can update their own" on member_experiences;
create policy "Experiences: members can update their own" 
on member_experiences for update using (auth.uid() = member_id);

drop policy if exists "Experiences: members can delete their own" on member_experiences;
create policy "Experiences: members can delete their own" 
on member_experiences for delete using (auth.uid() = member_id);


-- ============================================================
-- 3. MEMBER PROJECTS (Portfolio de projets)
-- ============================================================
create table if not exists member_projects (
  id              uuid default gen_random_uuid() primary key,
  member_id       uuid references profiles(id) on delete cascade not null,
  title           text not null,
  description     text,
  url             text,                      -- Link to the project or report
  image_url       text,                      -- Cover image for the project
  completion_date date,
  created_at      timestamp with time zone default timezone('utc', now()) not null
);

alter table member_projects enable row level security;

drop policy if exists "Projects: everyone can read" on member_projects;
create policy "Projects: everyone can read" 
on member_projects for select using (auth.role() = 'authenticated');

drop policy if exists "Projects: members can insert their own" on member_projects;
create policy "Projects: members can insert their own" 
on member_projects for insert with check (auth.uid() = member_id);

drop policy if exists "Projects: members can update their own" on member_projects;
create policy "Projects: members can update their own" 
on member_projects for update using (auth.uid() = member_id);

drop policy if exists "Projects: members can delete their own" on member_projects;
create policy "Projects: members can delete their own" 
on member_projects for delete using (auth.uid() = member_id);
