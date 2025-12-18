
-- =========================================================================
-- RLS POLICIES FOR TEAMS, OBJECTIVES, MEETINGS, FORMATIONS, EVENTS, CATEGORIES
-- =========================================================================

-- 1. Enable RLS on all target tables
ALTER TABLE IF EXISTS teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_categories ENABLE ROW LEVEL SECURITY;

-- 2. Define standard Roles check function (to avoid repeating the subquery)
CREATE OR REPLACE FUNCTION is_exclusive_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND LOWER(r.name) IN ('vp', 'conseiller', 'president', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- POLICIES FOR TEAMS
-- =========================================================================
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
CREATE POLICY "Teams are viewable by everyone" ON teams FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Exclusive roles can manage teams" ON teams;
CREATE POLICY "Exclusive roles can manage teams" ON teams FOR ALL TO authenticated 
USING (is_exclusive_role()) WITH CHECK (is_exclusive_role());

-- =========================================================================
-- POLICIES FOR OBJECTIVES
-- =========================================================================
DROP POLICY IF EXISTS "Objectives are viewable by everyone" ON objectives;
CREATE POLICY "Objectives are viewable by everyone" ON objectives FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Exclusive roles can manage objectives" ON objectives;
CREATE POLICY "Exclusive roles can manage objectives" ON objectives FOR ALL TO authenticated 
USING (is_exclusive_role()) WITH CHECK (is_exclusive_role());

-- =========================================================================
-- POLICIES FOR MEETINGS, FORMATIONS, EVENTS (Activity Extensions)
-- =========================================================================
-- SELECT
DROP POLICY IF EXISTS "Meetings are viewable by everyone" ON meetings;
CREATE POLICY "Meetings are viewable by everyone" ON meetings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Formations are viewable by everyone" ON formations;
CREATE POLICY "Formations are viewable by everyone" ON formations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT TO authenticated USING (true);

-- MANAGEMENT
DROP POLICY IF EXISTS "Exclusive roles can manage meetings" ON meetings;
CREATE POLICY "Exclusive roles can manage meetings" ON meetings FOR ALL TO authenticated 
USING (is_exclusive_role()) WITH CHECK (is_exclusive_role());

DROP POLICY IF EXISTS "Exclusive roles can manage formations" ON formations;
CREATE POLICY "Exclusive roles can manage formations" ON formations FOR ALL TO authenticated 
USING (is_exclusive_role()) WITH CHECK (is_exclusive_role());

DROP POLICY IF EXISTS "Exclusive roles can manage events" ON events;
CREATE POLICY "Exclusive roles can manage events" ON events FOR ALL TO authenticated 
USING (is_exclusive_role()) WITH CHECK (is_exclusive_role());

-- =========================================================================
-- POLICIES FOR CATEGORIES & JUNCTION
-- =========================================================================
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Exclusive roles can manage categories" ON categories;
CREATE POLICY "Exclusive roles can manage categories" ON categories FOR ALL TO authenticated 
USING (is_exclusive_role()) WITH CHECK (is_exclusive_role());

DROP POLICY IF EXISTS "Activity categories are viewable by everyone" ON activity_categories;
CREATE POLICY "Activity categories are viewable by everyone" ON activity_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Exclusive roles can manage activity categories" ON activity_categories;
CREATE POLICY "Exclusive roles can manage activity categories" ON activity_categories FOR ALL TO authenticated 
USING (is_exclusive_role()) WITH CHECK (is_exclusive_role());
