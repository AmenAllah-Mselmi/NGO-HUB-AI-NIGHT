-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- If the previous command failed, it's because Row Level Security (RLS) silently blocked it.

-- 1. Temporarily disable security to force the insert
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Insert all missing users
INSERT INTO public.profiles (id, email, fullname)
SELECT id, email, raw_user_meta_data->>'fullname' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 3. IMMEDIATELY Re-enable security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
