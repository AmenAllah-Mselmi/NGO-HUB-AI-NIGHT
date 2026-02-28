-- ============================================================
-- STATIC CHALLENGES & POINTS LOGGING
-- ============================================================

-- Create points history table if not exists
create table if not exists points_history (
  id              uuid default gen_random_uuid() primary key,
  member_id       uuid references profiles(id) on delete cascade not null,
  points          integer not null,
  source_type     text not null, -- 'challenge', 'task', 'event', 'admin'
  source_id       uuid,
  description     text,
  created_at      timestamp with time zone default timezone('utc', now()) not null
);

alter table points_history enable row level security;
create policy "Users can view their own point history" on points_history
  for select using (auth.uid() = member_id);

-- Insert Standard Challenges
-- Note: 'INTERNAL_BIO' etc are types used by our auto-check logic
delete from challenges where title in ('Warm Welcome', 'Profile Guru', 'Social Initiator', 'Team Collaborator', 'Task Associate');

insert into challenges (title, description, points_reward, condition_type, condition_count)
values 
  ('Warm Welcome', 'Get started on the platform by creating your citizen account.', 10, 'signup', 1),
  ('Profile Guru', 'Complete your profile by adding a full name and a personal bio.', 30, 'profile_complete', 1),
  ('Social Initiator', 'Take the first step in joining a local or national club.', 50, 'join_club', 1),
  ('Team Collaborator', 'Become part of a team to start working on concrete projects.', 50, 'join_team', 1),
  ('Task Associate', 'Prove your effectiveness by completing at least 3 assigned tasks.', 100, 'complete_tasks', 3);
