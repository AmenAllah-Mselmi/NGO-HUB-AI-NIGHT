-- ============================================================
-- GAMIFICATION & REWARDS SCHEMA
-- ============================================================

-- ============================================================
-- 1. CHALLENGES
-- ============================================================
create table if not exists challenges (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  description     text,
  points_reward   integer not null default 0,
  condition_type  text not null, -- e.g., 'attend_events', 'complete_tasks', 'refer_members'
  condition_count integer not null default 1,
  start_date      timestamptz,
  end_date        timestamptz,
  created_at      timestamp with time zone default timezone('utc', now()) not null
);

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

alter table challenges enable row level security;
alter table member_challenges enable row level security;

drop policy if exists "Challenges: authenticated read" on challenges;
create policy "Challenges: authenticated read" on challenges for select using (auth.role() = 'authenticated');

drop policy if exists "Member challenges: authenticated read/update" on member_challenges;
create policy "Member challenges: authenticated read/update" on member_challenges for all using (auth.role() = 'authenticated');

-- ============================================================
-- 2. VIRTUAL REWARDS (Badges & Items)
-- ============================================================
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

alter table virtual_rewards enable row level security;
alter table member_rewards enable row level security;

drop policy if exists "Virtual rewards: authenticated read" on virtual_rewards;
create policy "Virtual rewards: authenticated read" on virtual_rewards for select using (auth.role() = 'authenticated');

drop policy if exists "Member rewards: authenticated read" on member_rewards;
create policy "Member rewards: authenticated read" on member_rewards for select using (auth.role() = 'authenticated');

-- ============================================================
-- 3. AUTOMATION TRIGGERS (Auto-Award Points)
-- ============================================================
create or replace function handle_challenge_completion()
returns trigger as $$
declare
  reward_pts integer;
  challenge_name text;
begin
  -- Only execute if the challenge was JUST updated to "completed" status
  if new.status = 'completed' and old.status != 'completed' then
    -- Fetch the points reward for this specific challenge
    select points_reward, title into reward_pts, challenge_name 
    from challenges 
    where id = new.challenge_id;

    if reward_pts > 0 then
      -- Add points to the user's profile
      update profiles 
      set points = coalesce(points, 0) + reward_pts 
      where id = new.member_id;

      -- Log the transaction in the history table
      insert into points_history (member_id, points, source_type, source_id, description)
      values (new.member_id, reward_pts, 'challenge', new.challenge_id, 'Completed Daily Challenge: ' || challenge_name);
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_challenge_completion on member_challenges;
create trigger on_challenge_completion
  after update on member_challenges
  for each row execute function handle_challenge_completion();

-- Optional: Seed some default Challenges to test with
insert into challenges (title, description, points_reward, condition_type, condition_count)
values 
  ('First Steps', 'Attend your first 2 NGO activities.', 50, 'attend_events', 2),
  ('Task Master', 'Complete 5 assigned tasks.', 100, 'complete_tasks', 5),
  ('Social Butterfly', 'Join 3 different clubs.', 75, 'join_clubs', 3)
on conflict do nothing;

-- Optional: Seed some default Rewards (Badges) to test with
insert into virtual_rewards (name, description, icon_url, reward_type)
values
  ('Newbie', 'Joined the platform.', '🐣', 'badge'),
  ('Active Member', 'Consistently active.', '🔥', 'badge'),
  ('Leader', 'Created or led a project.', '👑', 'badge')
on conflict do nothing;
