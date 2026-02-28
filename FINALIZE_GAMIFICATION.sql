-- ============================================================
-- 1. TABLES & SCHEMA
-- ============================================================

-- Challenges Table
create table if not exists challenges (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  description     text,
  points_reward   integer not null default 0,
  condition_type  text not null, 
  condition_count integer not null default 1,
  start_date      timestamptz,
  end_date        timestamptz,
  created_at      timestamp with time zone default timezone('utc', now()) not null
);

-- Member Challenges Progress
create table if not exists member_challenges (
  id            uuid default gen_random_uuid() primary key,
  member_id     uuid references profiles(id) on delete cascade not null,
  challenge_id  uuid references challenges(id) on delete cascade not null,
  progress      integer default 0,
  status        text check (status in ('active', 'completed')) default 'active',
  completed_at  timestamptz,
  created_at    timestamp with time zone default timezone('utc', now()) not null,
  unique(member_id, challenge_id)
);

-- Points History (Tracking transactions)
create table if not exists points_history (
  id              uuid default gen_random_uuid() primary key,
  member_id       uuid references profiles(id) on delete cascade not null,
  points          integer not null,
  source_type     text not null, -- 'challenge', 'task', 'event', 'admin'
  source_id       uuid,
  description     text,
  created_at      timestamp with time zone default timezone('utc', now()) not null
);

-- Virtual Rewards (Badges)
create table if not exists virtual_rewards (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  description text,
  icon_url    text,
  reward_type text check (reward_type in ('badge', 'banner', 'title')) default 'badge',
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

create table if not exists member_rewards (
  id          uuid default gen_random_uuid() primary key,
  member_id   uuid references profiles(id) on delete cascade not null,
  reward_id   uuid references virtual_rewards(id) on delete cascade not null,
  earned_at   timestamp with time zone default timezone('utc', now()) not null,
  unique(member_id, reward_id)
);

-- ============================================================
-- 2. AUTOMATION & RLS
-- ============================================================

alter table challenges enable row level security;
alter table member_challenges enable row level security;
alter table points_history enable row level security;
alter table virtual_rewards enable row level security;
alter table member_rewards enable row level security;

-- Policies
create policy "Public read challenges" on challenges for select using (true);
create policy "Authenticated all member_challenges" on member_challenges for all using (auth.role() = 'authenticated');
create policy "Users read own points_history" on points_history for select using (auth.uid() = member_id);
create policy "Public read rewards" on virtual_rewards for select using (true);
create policy "Public read member_rewards" on member_rewards for select using (true);

-- Trigger to award points on completion
create or replace function handle_challenge_completion()
returns trigger as $$
declare
  reward_pts integer;
  challenge_name text;
begin
  if new.status = 'completed' and old.status != 'completed' then
    select points_reward, title into reward_pts, challenge_name from challenges where id = new.challenge_id;
    if reward_pts > 0 then
      update profiles set points = coalesce(points, 0) + reward_pts where id = new.member_id;
      insert into points_history (member_id, points, source_type, source_id, description)
      values (new.member_id, reward_pts, 'challenge', new.challenge_id, 'Completed Challenge: ' || challenge_name);
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_challenge_completion on member_challenges;
create trigger on_challenge_completion
  after update on member_challenges
  for each row execute function handle_challenge_completion();

-- ============================================================
-- 3. SEED DATA
-- ============================================================

insert into challenges (title, description, points_reward, condition_type, condition_count)
values 
  ('Warm Welcome', 'Get started on the platform by creating your citizen account.', 10, 'signup', 1),
  ('Profile Guru', 'Complete your profile by adding a full name and a personal bio.', 30, 'profile_complete', 1),
  ('Social Initiator', 'Take the first step in joining a local or national club.', 50, 'join_club', 1),
  ('Team Collaborator', 'Become part of a team to start working on concrete projects.', 50, 'join_team', 1),
  ('Task Associate', 'Prove your effectiveness by completing at least 3 assigned tasks.', 100, 'complete_tasks', 3)
on conflict do nothing;

insert into virtual_rewards (name, description, icon_url, reward_type)
values
  ('Newbie', 'Joined the platform.', '🐣', 'badge'),
  ('Active Member', 'Consistently active.', '🔥', 'badge'),
  ('Leader', 'Created or led a project.', '👑', 'badge')
on conflict do nothing;
