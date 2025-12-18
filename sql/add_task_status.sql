
-- Add status column to tasks table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN
        ALTER TABLE tasks ADD COLUMN status TEXT CHECK (status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo';
    END IF;
END $$;

-- Update existing tasks to have 'todo' status if null
UPDATE tasks SET status = 'todo' WHERE status IS NULL;
