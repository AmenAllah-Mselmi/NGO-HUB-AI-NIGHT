-- Add rate and notes columns to activity_participants
ALTER TABLE public.activity_participants
ADD COLUMN IF NOT EXISTS rate integer CHECK (rate >= 1 AND rate <= 5),
ADD COLUMN IF NOT EXISTS notes text;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_participants_rate ON public.activity_participants(rate) WHERE rate IS NOT NULL;
