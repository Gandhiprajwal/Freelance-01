/*
  # Enhanced RLS Policies for ROBOSTAAN

  This migration enhances the existing RLS policies with:
  1. More granular access controls
  2. Role-based permissions
  3. Owner-based access control
  4. Audit logging capabilities
  5. Better security for sensitive operations
*/

-- Drop existing policies to recreate them with enhanced security
DROP POLICY IF EXISTS "Blogs are viewable by everyone" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can insert blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can update blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can delete blogs" ON blogs;

DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Authenticated users can insert courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can update courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can delete courses" ON courses;

DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view all likes" ON blog_likes;
DROP POLICY IF EXISTS "Users can manage own likes" ON blog_likes;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Anyone can view newsletter subscriptions" ON newsletter_subscriptions;

DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can enroll in courses" ON course_enrollments;
DROP POLICY IF EXISTS "Users can update own enrollment progress" ON course_enrollments;

-- ========== ENHANCED BLOG POLICIES ==========

-- View blogs (public read access)
CREATE POLICY "blogs_select_policy" ON blogs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert blogs (authenticated users only)
CREATE POLICY "blogs_insert_policy" ON blogs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Users can create blogs
    auth.role() = 'authenticated'
  );

-- Update blogs (owner or admin/instructor)
CREATE POLICY "blogs_update_policy" ON blogs
  FOR UPDATE
  TO authenticated
  USING (
    -- Owner can update their own blogs
    author = (
      SELECT full_name 
      FROM user_profiles 
      WHERE user_id = auth.uid()
    )
    OR
    -- Admin/instructor can update any blog
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  )
  WITH CHECK (
    -- Same conditions for WITH CHECK
    author = (
      SELECT full_name 
      FROM user_profiles 
      WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

-- Delete blogs (owner or admin only)
CREATE POLICY "blogs_delete_policy" ON blogs
  FOR DELETE
  TO authenticated
  USING (
    -- Owner can delete their own blogs
    author = (
      SELECT full_name 
      FROM user_profiles 
      WHERE user_id = auth.uid()
    )
    OR
    -- Admin can delete any blog
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ========== ENHANCED COURSE POLICIES ==========

-- View courses (public read access)
CREATE POLICY "courses_select_policy" ON courses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert courses (admin/instructor only)
CREATE POLICY "courses_insert_policy" ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

-- Update courses (admin/instructor only)
CREATE POLICY "courses_update_policy" ON courses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

-- Delete courses (admin only)
CREATE POLICY "courses_delete_policy" ON courses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ========== ENHANCED USER PROFILE POLICIES ==========

-- View profiles (authenticated users can view all profiles)
CREATE POLICY "user_profiles_select_policy" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert profile (users can create their own profile)
CREATE POLICY "user_profiles_insert_policy" ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Update profile (users can update their own profile, admin can update any)
CREATE POLICY "user_profiles_update_policy" ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Delete profile (admin only)
CREATE POLICY "user_profiles_delete_policy" ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ========== ENHANCED BLOG LIKES POLICIES ==========

-- View likes (authenticated users can view all likes)
CREATE POLICY "blog_likes_select_policy" ON blog_likes
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert like (users can like blogs)
CREATE POLICY "blog_likes_insert_policy" ON blog_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Update like (users can update their own likes)
CREATE POLICY "blog_likes_update_policy" ON blog_likes
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- Delete like (users can unlike their own likes)
CREATE POLICY "blog_likes_delete_policy" ON blog_likes
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- ========== ENHANCED COMMENT POLICIES ==========

-- View comments (public read access)
CREATE POLICY "comments_select_policy" ON comments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert comment (authenticated users can comment)
CREATE POLICY "comments_insert_policy" ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Update comment (users can update their own comments, admin can update any)
CREATE POLICY "comments_update_policy" ON comments
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Delete comment (users can delete their own comments, admin can delete any)
CREATE POLICY "comments_delete_policy" ON comments
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ========== ENHANCED NEWSLETTER POLICIES ==========

-- View subscriptions (admin only)
CREATE POLICY "newsletter_subscriptions_select_policy" ON newsletter_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Insert subscription (anyone can subscribe)
CREATE POLICY "newsletter_subscriptions_insert_policy" ON newsletter_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update subscription (admin only)
CREATE POLICY "newsletter_subscriptions_update_policy" ON newsletter_subscriptions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Delete subscription (admin only)
CREATE POLICY "newsletter_subscriptions_delete_policy" ON newsletter_subscriptions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ========== ENHANCED COURSE ENROLLMENT POLICIES ==========

-- View enrollments (users can view their own enrollments, admin can view all)
CREATE POLICY "course_enrollments_select_policy" ON course_enrollments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Insert enrollment (users can enroll in courses)
CREATE POLICY "course_enrollments_insert_policy" ON course_enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Update enrollment (users can update their own progress, admin can update any)
CREATE POLICY "course_enrollments_update_policy" ON course_enrollments
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Delete enrollment (users can unenroll from their courses, admin can delete any)
CREATE POLICY "course_enrollments_delete_policy" ON course_enrollments
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ========== ENHANCED USER PREFERENCES POLICIES ==========

-- View preferences (users can view their own preferences)
CREATE POLICY "user_preferences_select_policy" ON user_preferences
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- Insert preferences (users can create their own preferences)
CREATE POLICY "user_preferences_insert_policy" ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Update preferences (users can update their own preferences)
CREATE POLICY "user_preferences_update_policy" ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- Delete preferences (users can delete their own preferences)
CREATE POLICY "user_preferences_delete_policy" ON user_preferences
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- ========== ADDITIONAL SECURITY MEASURES ==========

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is instructor
CREATE OR REPLACE FUNCTION is_instructor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'instructor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM user_profiles 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to audit user actions
CREATE OR REPLACE FUNCTION audit_user_action(
  action_type TEXT,
  table_name TEXT,
  record_id UUID,
  old_data JSONB DEFAULT NULL,
  new_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- This function can be used to log user actions for audit purposes
  -- You can implement actual logging logic here
  RAISE NOTICE 'User % performed % on % table, record: %, old: %, new: %', 
    auth.uid(), action_type, table_name, record_id, old_data, new_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== PERFORMANCE INDEXES ==========

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(featured);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_tags ON blogs USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

CREATE INDEX IF NOT EXISTS idx_comments_blog_id ON comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_comments_course_id ON comments(course_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_id ON blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_id ON blog_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);

-- ========== CONSTRAINTS AND VALIDATIONS ==========

-- Add check constraints for data integrity
ALTER TABLE blogs ADD CONSTRAINT check_blog_title_length 
  CHECK (char_length(title) >= 3 AND char_length(title) <= 200);

ALTER TABLE blogs ADD CONSTRAINT check_blog_content_length 
  CHECK (char_length(content) >= 10);

ALTER TABLE courses ADD CONSTRAINT check_course_title_length 
  CHECK (char_length(title) >= 3 AND char_length(title) <= 200);

ALTER TABLE courses ADD CONSTRAINT check_course_duration_format 
  CHECK (duration ~ '^[0-9]+ (weeks?|days?|hours?)$');

ALTER TABLE comments ADD CONSTRAINT check_comment_content_length 
  CHECK (char_length(content) >= 1 AND char_length(content) <= 1000);

ALTER TABLE user_profiles ADD CONSTRAINT check_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- ========== TRIGGERS FOR AUDIT LOGGING ==========

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_logs_select_policy" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_blogs_trigger
  AFTER INSERT OR UPDATE OR DELETE ON blogs
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_courses_trigger
  AFTER INSERT OR UPDATE OR DELETE ON courses
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ========== FINAL COMMENTS ==========

COMMENT ON TABLE blogs IS 'Blog posts with enhanced RLS policies for role-based access control';
COMMENT ON TABLE courses IS 'Educational courses with instructor/admin-only write access';
COMMENT ON TABLE user_profiles IS 'User profiles with owner-based access control';
COMMENT ON TABLE comments IS 'Comments with owner and admin access controls';
COMMENT ON TABLE blog_likes IS 'Blog likes with user-specific access';
COMMENT ON TABLE course_enrollments IS 'Course enrollments with user and admin access';
COMMENT ON TABLE audit_logs IS 'Audit trail for security monitoring';

COMMENT ON FUNCTION is_admin() IS 'Check if current user has admin role';
COMMENT ON FUNCTION is_instructor() IS 'Check if current user has instructor or admin role';
COMMENT ON FUNCTION get_user_role() IS 'Get current user role';
COMMENT ON FUNCTION audit_user_action() IS 'Log user actions for audit purposes'; 