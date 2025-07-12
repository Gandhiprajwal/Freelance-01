-- Blog Views Table for Public View Tracking and Admin Analytics

CREATE TABLE IF NOT EXISTS blog_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid REFERENCES blogs(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  viewer_ip inet,
  viewer_user_agent text,
  user_id uuid REFERENCES auth.users(id),
  -- Optionally, store session or anonymous id for deduplication
  session_id text,
  CONSTRAINT fk_blog FOREIGN KEY(blog_id) REFERENCES blogs(id)
);

-- Enable RLS
ALTER TABLE blog_views ENABLE ROW LEVEL SECURITY;

-- Public can insert/select (for view tracking)
CREATE POLICY "public_insert_blog_views" ON blog_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Public can see all view counts (for display)
CREATE POLICY "public_select_blog_views" ON blog_views
  FOR SELECT TO anon, authenticated
  USING (true);

-- Admin can only see analytics for their own blogs
CREATE POLICY "admin_own_blog_analytics" ON blog_views
  FOR SELECT TO authenticated
  USING (
    -- Allow blog author to see their own blog's views
    blog_id IN (
      SELECT id FROM blogs WHERE author = (
        SELECT full_name FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_blog_views_blog_id ON blog_views(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_user_id ON blog_views(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_viewed_at ON blog_views(viewed_at DESC); 
