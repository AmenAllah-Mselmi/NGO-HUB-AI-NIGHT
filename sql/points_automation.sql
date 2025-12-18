-- ========================================
-- POINTS HISTORY & AUTOMATION
-- ========================================

-- 1. Create points_history table
CREATE TABLE IF NOT EXISTS public.points_history (
  id uuid not null default gen_random_uuid (),
  member_id uuid not null,
  points integer not null,
  source_type character varying(50) not null, -- 'activity', 'objective', 'manual', 'bonus'
  source_id uuid null, -- ID of the activity or objective
  description text null,
  created_at timestamp with time zone null default now(),
  CONSTRAINT points_history_pkey PRIMARY KEY (id),
  CONSTRAINT points_history_member_fkey FOREIGN KEY (member_id) REFERENCES profiles (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_points_history_member ON public.points_history USING btree (member_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_points_history_created ON public.points_history USING btree (created_at) TABLESPACE pg_default;


-- 2. Trigger for ACTIVITY PARTICIPATION
-- When a user is added to activity_participants, if it's not temporary, award points.
CREATE OR REPLACE FUNCTION handle_activity_participation_points()
RETURNS TRIGGER AS $$
DECLARE
    earned_points INTEGER;
    activity_name_val VARCHAR;
BEGIN
    -- Only process if NOT temporary registration
    -- Assuming is_temp column exists based on service code
    IF (NEW.is_temp IS TRUE) THEN
        RETURN NEW;
    END IF;

    -- Fetch points and name from activity
    SELECT activity_points, name INTO earned_points, activity_name_val
    FROM public.activities
    WHERE id = NEW.activity_id;

    -- If points exist and > 0
    IF earned_points IS NOT NULL AND earned_points > 0 THEN
        -- 1. Insert into history
        INSERT INTO public.points_history (
            member_id,
            points,
            source_type,
            source_id,
            description
        ) VALUES (
            NEW.user_id,
            earned_points,
            'activity',
            NEW.activity_id,
            'Attended activity: ' || COALESCE(activity_name_val, 'Unknown')
        );

        -- 2. Update Profile Points
        UPDATE public.profiles
        SET points = COALESCE(points, 0) + earned_points
        WHERE id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to ensure clean state
DROP TRIGGER IF EXISTS on_activity_participation_points ON public.activity_participants;

-- Create trigger
CREATE TRIGGER on_activity_participation_points
AFTER INSERT ON public.activity_participants
FOR EACH ROW
EXECUTE FUNCTION handle_activity_participation_points();


-- 3. Trigger for MANUAL/DIRECT POINTS UPDATE on Profiles
-- Catches admin bonuses or manual edits that are NOT caused by other triggers
CREATE OR REPLACE FUNCTION handle_profile_points_update()
RETURNS TRIGGER AS $$
DECLARE
    diff INTEGER;
BEGIN
    -- Check trigger depth to avoid identifying automated system updates (from objectives/activities) as manual
    -- Depth 1 = Direct SQL call/API call
    -- Depth > 1 = Trigger called by another trigger/function
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    -- Check if points actually changed
    IF NEW.points IS DISTINCT FROM OLD.points THEN
        diff := COALESCE(NEW.points, 0) - COALESCE(OLD.points, 0);
        
        -- Insert into history as 'manual'
        INSERT INTO public.points_history (
            member_id,
            points,
            source_type,
            source_id,
            description
        ) VALUES (
            NEW.id,
            diff,
            'manual',
            NULL, -- No source ID for manual edit
            'Manual adjustment by administrator'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_points_change ON public.profiles;

CREATE TRIGGER on_profile_points_change
AFTER UPDATE OF points ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION handle_profile_points_update();


-- 4. Trigger for OBJECTIVE COMPLETION
-- When an objective is marked as completed, award points and log to history
CREATE OR REPLACE FUNCTION handle_objective_completion()
RETURNS TRIGGER AS $$
DECLARE
    objective_points INTEGER;
    objective_title VARCHAR;
BEGIN
    -- Only proceed if transitioning to completed status
    -- Check if OLD.is_completed IS NULL or False, and NEW.is_completed is True
    IF NEW.is_completed = true AND (OLD.is_completed IS DISTINCT FROM true) THEN
        
        -- Get points and title from the objective definition
        SELECT points, title INTO objective_points, objective_title 
        FROM public.objectives 
        WHERE id = NEW.objective_id;
        
        -- Default points to 0 if not found
        objective_points := COALESCE(objective_points, 0);

        -- 1. Set timestamp if not set
        IF NEW.completed_at IS NULL THEN
            NEW.completed_at = NOW();
        END IF;

        -- 2. Set points earned on the record itself
        NEW.points_earned = objective_points;

        -- 3. Update Member's total points 
        -- Note: This will trigger 'handle_profile_points_update' but it will be skipped due to trigger depth check
        UPDATE public.profiles 
        SET points = COALESCE(points, 0) + objective_points 
        WHERE id = NEW.member_id;

        -- 4. Add entry to points history
        INSERT INTO public.points_history (
            member_id, 
            points, 
            source_type, 
            source_id, 
            description
        ) VALUES (
            NEW.member_id,
            objective_points,
            'objective',
            NEW.objective_id,
            'Completed objective: ' || COALESCE(objective_title, 'Untitled')
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_objective_completion ON public.member_objectives;

CREATE TRIGGER on_objective_completion
BEFORE UPDATE ON public.member_objectives
FOR EACH ROW
EXECUTE FUNCTION handle_objective_completion();
