-- =============================================================================
-- NGO Hub — Club Posts & Comments (Community Feed)
-- Paste this entire file into the Supabase SQL Editor and click "Run"
-- =============================================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Club Posts table (supports both global newsfeed and club-specific feed)
CREATE TABLE IF NOT EXISTS public.club_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id      UUID REFERENCES public.clubs(id) ON DELETE CASCADE, -- NULL means global post
  author_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT,
  content      TEXT NOT NULL,
  image_url    TEXT,
  is_pinned    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Club Comments table
CREATE TABLE IF NOT EXISTS public.club_comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL REFERENCES public.club_posts(id) ON DELETE CASCADE,
  author_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.club_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_comments ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------
-- club_posts policies
-- -----------------------------------------------
DROP POLICY IF EXISTS "Club posts: public read" ON public.club_posts;
DROP POLICY IF EXISTS "Club posts: authenticated create" ON public.club_posts;
DROP POLICY IF EXISTS "Club posts: author update" ON public.club_posts;
DROP POLICY IF EXISTS "Club posts: author or admin delete" ON public.club_posts;

-- Allow anyone to read posts
CREATE POLICY "Club posts: public read"
  ON public.club_posts FOR SELECT
  USING (true);

-- Allow authenticated users to create posts
-- If club_id is provided, you might want to restrict it to club members, 
-- but for simplicity we allow any authenticated user or handle it application side
CREATE POLICY "Club posts: authenticated create"
  ON public.club_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "Club posts: author update"
  ON public.club_posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors or Superadmins can delete posts
-- (If it's a club post, club president should also be able to delete, handled similarly if needed)
CREATE POLICY "Club posts: author or admin delete"
  ON public.club_posts FOR DELETE
  USING (
    auth.uid() = author_id
    OR (SELECT is_superadmin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- -----------------------------------------------
-- club_comments policies
-- -----------------------------------------------
DROP POLICY IF EXISTS "Club comments: public read" ON public.club_comments;
DROP POLICY IF EXISTS "Club comments: authenticated create" ON public.club_comments;
DROP POLICY IF EXISTS "Club comments: author or admin delete" ON public.club_comments;

-- Allow anyone to read comments
CREATE POLICY "Club comments: public read"
  ON public.club_comments FOR SELECT
  USING (true);

-- Allow authenticated users to create comments
CREATE POLICY "Club comments: authenticated create"
  ON public.club_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors or Superadmins can delete comments
CREATE POLICY "Club comments: author or admin delete"
  ON public.club_comments FOR DELETE
  USING (
    auth.uid() = author_id
    OR (SELECT is_superadmin FROM public.profiles WHERE id = auth.uid()) = true
  );


-- ============================================================
-- 3. TRIGGERS
-- ============================================================

-- Auto-update updated_at on club_posts
CREATE OR REPLACE FUNCTION public.club_posts_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS club_posts_set_updated_at ON public.club_posts;
CREATE TRIGGER club_posts_set_updated_at
  BEFORE UPDATE ON public.club_posts
  FOR EACH ROW EXECUTE PROCEDURE public.club_posts_set_updated_at();

-- ============================================================
-- 4. REFRESH SCHEMA CACHE
-- ============================================================
NOTIFY pgrst, 'reload schema';
