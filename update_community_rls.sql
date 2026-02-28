-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- Posts: SELECT (Allows all authenticated users to read posts in the Community Hub)
drop policy if exists "Club posts: public read if global or club member" on club_posts;
drop policy if exists "Club posts: read" on club_posts;
create policy "Club posts: read" on club_posts for select using (
  auth.role() = 'authenticated'
);

-- Comments: SELECT (Allows all authenticated users to read comments)
drop policy if exists "Club comments: public read if global or club member" on club_comments;
drop policy if exists "Club comments: read" on club_comments;
create policy "Club comments: read" on club_comments for select using (
  auth.role() = 'authenticated'
);

-- Comments: INSERT (Allows all authenticated users to comment on any post)
drop policy if exists "Club comments: authenticated create" on club_comments;
drop policy if exists "Club comments: create" on club_comments;
create policy "Club comments: create" on club_comments for insert with check (
  author_id = auth.uid()
);
