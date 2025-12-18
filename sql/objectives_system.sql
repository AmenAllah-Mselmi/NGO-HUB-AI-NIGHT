-- ========================================
-- OBJECTIVES SYSTEM
-- ========================================

-- Create ENUM types
-- Check if types exist before creating to avoid errors on repeated runs
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'objectif_difficulty') THEN
        CREATE TYPE objectif_difficulty AS ENUM ('Extreme', 'Hard', 'Medium', 'Basic');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'features_type') THEN
        CREATE TYPE features_type AS ENUM (
            'Events', 'Meetings', 'Trainings', 'teams', 'Votes', 'Tasks', 'Projects', 
            'Strategies', 'Subtasks', 'Comments', 'Replys', 'Emojis', 'Activities', 
            'Board', 'Culture', 'Pv', 'Objectif', 'Members', 'Guests', 'PastPresident'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'group_objectif_type') THEN
        CREATE TYPE group_objectif_type AS ENUM (
            'AttendanceCheck', 'Modification', 'Interaction', 'Decision', 'Contribution', 'Exploration'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'objectif_action_type') THEN
        CREATE TYPE objectif_action_type AS ENUM (
            'CheckIn', 'Create', 'Update', 'Delete', 'Attend', 'Join', 'VoteIn', 
            'Send', 'ReplyTo', 'ReactTo', 'Discover'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'privacy_type') THEN
        CREATE TYPE privacy_type AS ENUM ('Public', 'Private');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cible_type') THEN
        CREATE TYPE cible_type AS ENUM (
            'President', 'VPs', 'Members', 'newMembers', 'Advisors', 'Secretary', 'CommittedMember', 'Guests'
        );
    END IF;
END $$;

-- Ensure profiles table has points column (Safeguard)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Objectives table
CREATE TABLE IF NOT EXISTS public.objectives (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    
    -- Core Classification
    group_objectif group_objectif_type NOT NULL,
    objectif_action_type objectif_action_type NOT NULL,
    feature features_type NOT NULL,
    
    -- Details
    title VARCHAR(255), -- Optional based on Dart model, but usually good to have as a fallback or generated
    
    -- Targeting & Constraints
    privacy privacy_type, -- Can be null based on PrivacyType?
    cible cible_type[] NOT NULL DEFAULT '{}', -- Array of target roles
    difficulty objectif_difficulty, -- Can be null
    
    -- Values
    target INTEGER, -- Was target in Dart (int?), mapped to target (count/threshold)
    points INTEGER NOT NULL DEFAULT 0,
    
    -- System fields
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT objectives_pkey PRIMARY KEY (id)
);

-- Member objectives progress
CREATE TABLE IF NOT EXISTS public.member_objectives (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    objective_id UUID NOT NULL,
    
    -- Progress
    current_progress INTEGER DEFAULT 0, -- renamed from current_count to match UserObjectif.currentProgress
    is_completed BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- renamed from started_at to match UserObjectif.assignedAt
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Points awarded (denormalized for history/speed)
    points_earned INTEGER DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT member_objectives_pkey PRIMARY KEY (id),
    CONSTRAINT member_objectives_member_fkey FOREIGN KEY (member_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT member_objectives_objective_fkey FOREIGN KEY (objective_id) REFERENCES objectives(id) ON DELETE CASCADE,
    CONSTRAINT member_objectives_unique UNIQUE (member_id, objective_id)
);

-- Points history for tracking
CREATE TABLE IF NOT EXISTS public.points_history (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    points INTEGER NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'activity', 'objective', 'bonus', 'manual'
    source_id UUID,                    -- activity_id or objective_id
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT points_history_pkey PRIMARY KEY (id),
    CONSTRAINT points_history_member_fkey FOREIGN KEY (member_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_objectives_feature ON public.objectives(feature);
CREATE INDEX IF NOT EXISTS idx_objectives_group ON public.objectives(group_objectif);
CREATE INDEX IF NOT EXISTS idx_member_objectives_member ON public.member_objectives(member_id);
CREATE INDEX IF NOT EXISTS idx_member_objectives_completed ON public.member_objectives(is_completed);
CREATE INDEX IF NOT EXISTS idx_points_history_member ON public.points_history(member_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS objectives_updated_at ON objectives;
CREATE TRIGGER objectives_updated_at BEFORE UPDATE ON objectives FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS member_objectives_updated_at ON member_objectives;
CREATE TRIGGER member_objectives_updated_at BEFORE UPDATE ON member_objectives FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================================
-- TRIGGER: Auto-add points when objective is completed
-- =========================================================================

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

DROP TRIGGER IF EXISTS on_objective_completion ON member_objectives;
CREATE TRIGGER on_objective_completion
BEFORE UPDATE ON member_objectives
FOR EACH ROW
EXECUTE FUNCTION handle_objective_completion();
