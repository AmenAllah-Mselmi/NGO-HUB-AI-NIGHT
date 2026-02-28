-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Create a profile for ALL users missing one
-- (The SQL Editor runs as admin, so auth.uid() doesn't work here. This fixes everyone safely.)
INSERT INTO public.profiles (id, email, fullname)
SELECT id, email, raw_user_meta_data->>'fullname' 
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Verify and recreate the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, fullname, phone, birth_date)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'fullname',
    new.raw_user_meta_data->>'phone',
    (new.raw_user_meta_data->>'birth_date')::date
  ) ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
