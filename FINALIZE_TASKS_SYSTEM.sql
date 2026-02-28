-- ============================================================
-- FINALIZE TEAMS & TASKS SYSTEM (CONSOLIDATED & SELF-CONTAINED)
-- ============================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FIX TEAMS RLS POLICIES
-- ------------------------------------------------------------
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teams: authenticated create" ON public.teams;
CREATE POLICY "Teams: authenticated create" ON public.teams
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

DROP POLICY IF EXISTS "Teams: admin delete" ON public.teams;
CREATE POLICY "Teams: admin delete" ON public.teams
  FOR DELETE USING (public.can_admin_team(id, auth.uid()));

DROP POLICY IF EXISTS "View teams" ON public.teams;
CREATE POLICY "View teams" ON public.teams FOR SELECT USING (
  is_public = true OR created_by = auth.uid() OR public.is_team_member(id, auth.uid())
);

DROP POLICY IF EXISTS "Update teams" ON public.teams;
CREATE POLICY "Update teams" ON public.teams FOR UPDATE USING (public.can_admin_team(id, auth.uid()));

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Add team members" ON public.team_members;
CREATE POLICY "Add team members" ON public.team_members FOR INSERT WITH CHECK (
  (auth.uid() = member_id AND public.is_team_public(team_id))
  OR public.can_admin_team(team_id, auth.uid())
);

-- 2. CREATE TEAM MILESTONES (Required for Tasks)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.team_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view milestones" ON public.team_milestones;
CREATE POLICY "Team members can view milestones" ON public.team_milestones
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.team_members WHERE team_id = team_milestones.team_id AND member_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.teams WHERE id = team_milestones.team_id AND is_public = true)
    );

DROP POLICY IF EXISTS "Admins/Leads can manage milestones" ON public.team_milestones;
CREATE POLICY "Admins/Leads can manage milestones" ON public.team_milestones
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.team_members WHERE team_id = team_milestones.team_id AND member_id = auth.uid() AND role IN ('admin', 'lead'))
    );

-- 3. CREATE TEAM DOCUMENTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'document',
    file_size_bytes BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view documents" ON public.team_documents;
CREATE POLICY "Team members can view documents" ON public.team_documents
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.team_members WHERE team_id = team_documents.team_id AND member_id = auth.uid())
    );

DROP POLICY IF EXISTS "Team members can upload documents" ON public.team_documents;
CREATE POLICY "Team members can upload documents" ON public.team_documents
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.team_members WHERE team_id = team_documents.team_id AND member_id = auth.uid())
    );

-- 4. ENHANCE TASKS TABLE
-- ------------------------------------------------------------
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS complexity TEXT CHECK (complexity IN ('lead', 'major', 'minor')) DEFAULT 'minor',
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES public.team_milestones(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS header_color TEXT,
ADD COLUMN IF NOT EXISTS logged_hours NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tasks: authenticated read" ON public.tasks;
CREATE POLICY "Tasks: authenticated read" ON public.tasks FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Tasks: authenticated create" ON public.tasks;
CREATE POLICY "Tasks: authenticated create" ON public.tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Tasks: owner/lead update" ON public.tasks;
CREATE POLICY "Tasks: owner/lead update" ON public.tasks FOR UPDATE USING (
    auth.uid() = created_by OR (team_id IS NOT NULL AND public.can_admin_team(team_id, auth.uid()))
);

-- 5. MEMBER TASKS (ASSIGNMENTS)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.member_tasks (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id               UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  member_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status                TEXT CHECK (status IN ('todo','in_progress','completed')) DEFAULT 'todo',
  tracking_type         TEXT CHECK (tracking_type IN ('manual','subtasks')) DEFAULT 'subtasks',
  progress_percentage   INTEGER DEFAULT 0,
  completed_subtask_ids JSONB DEFAULT '[]'::jsonb,
  star_rating           INTEGER,
  assigned_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Note: We also alter in case it exists but is missing the star_rating.
ALTER TABLE public.member_tasks ADD COLUMN IF NOT EXISTS star_rating INTEGER;

ALTER TABLE public.member_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Assignments: authenticated read" ON public.member_tasks;
CREATE POLICY "Assignments: authenticated read" ON public.member_tasks FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Assignments: authenticated insert" ON public.member_tasks;
CREATE POLICY "Assignments: authenticated insert" ON public.member_tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Assignments: owner update" ON public.member_tasks;
CREATE POLICY "Assignments: owner update" ON public.member_tasks FOR UPDATE USING (
    auth.uid() = member_id OR EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE tasks.id = member_tasks.task_id AND (tasks.created_by = auth.uid() OR public.can_admin_team(tasks.team_id, auth.uid()))
    )
);

-- Trigger: Award / return points on task completion
CREATE OR REPLACE FUNCTION handle_task_completion()
RETURNS TRIGGER AS $$
DECLARE
  task_points INTEGER;
  task_title  TEXT;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    SELECT points, title INTO task_points, task_title FROM tasks WHERE id = NEW.task_id;
    IF task_points > 0 THEN
      UPDATE profiles SET points = COALESCE(points, 0) + task_points WHERE id = NEW.member_id;
      INSERT INTO points_history (member_id, points, source_type, source_id, description)
        VALUES (NEW.member_id, task_points, 'task', NEW.task_id, 'Completed Task: ' || COALESCE(task_title, 'Unknown'));
    END IF;
  ELSIF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    SELECT points, title INTO task_points, task_title FROM tasks WHERE id = NEW.task_id;
    IF task_points > 0 THEN
      UPDATE profiles SET points = COALESCE(points, 0) - task_points WHERE id = NEW.member_id;
      INSERT INTO points_history (member_id, points, source_type, source_id, description)
        VALUES (NEW.member_id, -task_points, 'task', NEW.task_id, 'Task Reopened: ' || COALESCE(task_title, 'Unknown') || ' (Points Returned)');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_completion ON public.member_tasks;
CREATE TRIGGER on_task_completion AFTER UPDATE ON public.member_tasks FOR EACH ROW EXECUTE FUNCTION handle_task_completion();

-- Trigger: Return points when assignment is deleted
CREATE OR REPLACE FUNCTION handle_task_deletion()
RETURNS TRIGGER AS $$
DECLARE
  task_points INTEGER;
  task_title  TEXT;
BEGIN
  IF OLD.status = 'completed' THEN
    SELECT points, title INTO task_points, task_title FROM tasks WHERE id = OLD.task_id;
    IF task_points > 0 THEN
      UPDATE profiles SET points = COALESCE(points, 0) - task_points WHERE id = OLD.member_id;
      INSERT INTO points_history (member_id, points, source_type, source_id, description)
        VALUES (OLD.member_id, -task_points, 'task', OLD.task_id, 'Assignment Deleted: ' || COALESCE(task_title, 'Unknown') || ' (Points Returned)');
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_deletion ON public.member_tasks;
CREATE TRIGGER on_task_deletion AFTER DELETE ON public.member_tasks FOR EACH ROW EXECUTE FUNCTION handle_task_deletion();

-- Trigger: Block direct delete of completed assignments
CREATE OR REPLACE FUNCTION prevent_completed_task_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.status = 'completed' THEN
    RAISE EXCEPTION 'Cannot delete a completed task assignment. Reopen it first.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_completed_task_lock ON public.member_tasks;
CREATE TRIGGER check_completed_task_lock BEFORE UPDATE OR DELETE ON public.member_tasks FOR EACH ROW EXECUTE FUNCTION prevent_completed_task_modification();

-- 6. TASK TIME LOGS & VOLUNTEERING HOURS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    hours_logged NUMERIC NOT NULL,
    description TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.task_time_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can log their own time" ON public.task_time_logs;
CREATE POLICY "Members can log their own time" ON public.task_time_logs FOR INSERT WITH CHECK ( member_id = auth.uid() );

DROP POLICY IF EXISTS "Members can view task logs" ON public.task_time_logs;
CREATE POLICY "Members can view task logs" ON public.task_time_logs FOR SELECT USING ( true );

-- Trigger for profile hours
CREATE OR REPLACE FUNCTION add_logged_hours_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET total_volunteering_hours = COALESCE(total_volunteering_hours, 0) + NEW.hours_logged
    WHERE id = NEW.member_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_time_log_insert ON public.task_time_logs;
CREATE TRIGGER on_time_log_insert AFTER INSERT ON public.task_time_logs FOR EACH ROW EXECUTE FUNCTION add_logged_hours_to_profile();

-- 7. STORAGE BUCKETS
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('team-documents', 'team-documents', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public task attachments access" ON storage.objects;
CREATE POLICY "Public task attachments access" ON storage.objects FOR SELECT USING (bucket_id IN ('task-attachments', 'team-documents'));

DROP POLICY IF EXISTS "Auth task attachments upload" ON storage.objects;
CREATE POLICY "Auth task attachments upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('task-attachments', 'team-documents') AND auth.role() = 'authenticated');
