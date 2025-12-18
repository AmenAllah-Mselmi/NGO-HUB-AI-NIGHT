
-- 1. Create Tables if they don't exist

-- Tasks Definition
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  points integer default 0,
  subtasks jsonb default '[]'::jsonb, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Member Assignments
create table if not exists member_tasks (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  member_id uuid references profiles(id) on delete cascade not null, -- Assuming 'profiles' is the members table
  
  status text check (status in ('todo', 'in_progress', 'completed')) default 'todo',
  tracking_type text check (tracking_type in ('manual', 'subtasks')) default 'subtasks',
  
  progress_percentage integer default 0,
  completed_subtask_ids jsonb default '[]'::jsonb, 
  
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add 'points' column to tasks if it was missing (safe migration)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'tasks' and column_name = 'points') then
    alter table tasks add column points integer default 0;
  end if;
end $$;

-- 3. Enable RLS
alter table tasks enable row level security;
alter table member_tasks enable row level security;

-- Policies (Drop first to avoid errors if re-running)
drop policy if exists "Enable all access for authenticated users" on tasks;
drop policy if exists "Enable all access for authenticated users" on member_tasks;

create policy "Enable all access for authenticated users" on tasks for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on member_tasks for all using (auth.role() = 'authenticated');

-- 4. Triggers for Points Logic

-- Function: Handle Task Completion (Award Points)
create or replace function handle_task_completion()
returns trigger as $$
declare
  task_points integer;
  task_title text;
begin
  -- Trigger only when status changes TO 'completed'
  if new.status = 'completed' and (old.status is null or old.status != 'completed') then
    
    -- Get points and title from task definition
    select points, title into task_points, task_title from tasks where id = new.task_id;
    
    if task_points > 0 then
      -- Update member points
      update profiles 
      set points = coalesce(points, 0) + task_points 
      where id = new.member_id;
      
      -- Log in points_history
      insert into points_history (member_id, points, source_type, source_id, description)
      values (
        new.member_id, 
        task_points, 
        'task', 
        new.task_id, 
        'Completed Task: ' || task_title
      );
    end if;
    
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger: On Completion
drop trigger if exists on_task_completion on member_tasks;
create trigger on_task_completion
after update on member_tasks
for each row
execute function handle_task_completion();


-- 5. Triggers for Locking Logic

-- Function: Prevent Modification of Completed Tasks
create or replace function prevent_completed_task_modification()
returns trigger as $$
begin
  -- If the OLD record was already completed, deny any change
  if old.status = 'completed' then
     raise exception 'This task is completed and cannot be modified or deleted.';
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger: Lock Completed Tasks
drop trigger if exists check_completed_task_lock on member_tasks;
create trigger check_completed_task_lock
before update or delete on member_tasks
for each row
execute function prevent_completed_task_modification();
