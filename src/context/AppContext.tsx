import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseConnection } from '../lib/supabaseConnection';
import type { Blog, Course } from '../lib/supabaseService';
import { useAuth } from '../components/Auth/AuthProvider';

export type { Blog, Course };

interface AppContextType {
  blogs: Blog[];
  courses: Course[];
  userBlogs: Blog[];
  userCourses: Course[];
  darkMode: boolean;
  loading: boolean;
  isAdmin: boolean;
  addBlog: (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBlog: (id: string, blog: Partial<Blog>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  addCourse: (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  toggleDarkMode: () => void;
  refreshData: () => Promise<void>;
  refreshUserContent: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [userBlogs, setUserBlogs] = useState<Blog[]>([]);
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataCache, setDataCache] = useState<{
    blogs?: Blog[];
    courses?: Course[];
    lastFetch?: number;
  }>({});
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  
  const { isAdmin: authIsAdmin, user, profile } = useAuth();
  const connection = getSupabaseConnection();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    // Initial data fetch with timeout
    fetchDataWithTimeout();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Wait for profile to be loaded before fetching user content
    if (user && profile) {
      fetchUserContent();
    } else {
      setUserBlogs([]);
      setUserCourses([]);
    }
  }, [user, profile]);

  useEffect(() => {
    // Keep-alive ping to prevent Supabase cold starts using the connection manager
    const interval = setInterval(async () => {
      try {
        await connection.executeWithRetry(async (client) => {
          await client.from('blogs').select('id').limit(1);
        });
      } catch (e) {
        // Ignore errors, this is just to keep the backend warm
      }
    }, 30 * 1000); // every 30 seconds
    return () => clearInterval(interval);
  }, [connection]);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      connection.executeWithRetry(async (client) => {
        const { data: { session } } = await client.auth.getSession();
        if (!session) {
          // Session expired or invalid. Optionally: show login modal or redirect to login page.
          // Example: window.location.href = '/login';
        } else {
          // Optionally re-fetch user profile and user content
          refreshUserContent();
        }
        return session;
      });
    }
  }, [connectionStatus, connection]);

  const ensureConnection = async () => {
    if (connectionStatus !== 'connected') {
      setConnectionStatus('connecting');
      try {
        await connection.reconnect();
        setConnectionStatus('connected');
      } catch {
        setConnectionStatus('disconnected');
        throw new Error('Failed to reconnect to Supabase');
      }
    }
  };

  const fetchDataWithTimeout = async (forceRefresh = false) => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Data fetch timeout')), 10000)
    );
    try {
      await Promise.race([fetchData(forceRefresh), timeoutPromise]);
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('Data fetch error or timeout:', error);
      setBlogs([]);
      setCourses([]);
      setLoading(false);
      // If fetch takes longer than 10 seconds, reload the page
      window.location.reload();
    }
  };

  const fetchData = async (forceRefresh = false) => {
    const now = Date.now();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    // Use cache if available and not expired, unless force refresh
    if (!forceRefresh && dataCache.lastFetch && (now - dataCache.lastFetch) < cacheExpiry) {
      if (dataCache.blogs) setBlogs(dataCache.blogs);
      if (dataCache.courses) setCourses(dataCache.courses);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch blogs using the connection manager
      try {
        const blogsResult = await connection.executeWithRetry(async (client) => {
          return await client.from('blogs').select('*').order('created_at', { ascending: false });
        });
        
        const blogsData = blogsResult?.data;
        const blogsError = blogsResult?.error;
        if (blogsError && !blogsError.message.includes('relation "blogs" does not exist')) {
          console.error('Error fetching blogs:', blogsError);
        } else {
          setBlogs(blogsData || []);
        }
      } catch (error) {
        console.error('Blogs fetch timeout or error:', error);
        // Don't clear blogs on timeout, keep existing data
      }

      // Fetch courses using the connection manager
      try {
        const coursesResult = await connection.executeWithRetry(async (client) => {
          return await client.from('courses').select('*').order('created_at', { ascending: false });
        });
        
        const coursesData = coursesResult?.data;
        const coursesError = coursesResult?.error;
        if (coursesError && !coursesError.message.includes('relation "courses" does not exist')) {
          console.error('Error fetching courses:', coursesError);
        } else {
          setCourses(coursesData || []);
        }
      } catch (error) {
        console.error('Courses fetch timeout or error:', error);
        // Don't clear courses on timeout, keep existing data
      }

      // Update cache only if we got some data
      setDataCache({
        blogs: blogs,
        courses: courses,
        lastFetch: now
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't clear data on error, keep existing
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContent = async () => {
    if (!user || !profile) return;
    try {
      // Fetch user's blogs based on user_id using the connection manager
      try {
        const userBlogsResult = await connection.executeWithRetry(async (client) => {
          return await client
            .from('blogs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        });
        
        const userBlogsData = userBlogsResult?.data;
        const userBlogsError = userBlogsResult?.error;
        if (userBlogsError) {
          console.error('Error fetching user blogs:', userBlogsError);
        } else {
          setUserBlogs(userBlogsData || []);
        }
      } catch (error) {
        console.error('User blogs fetch timeout:', error);
        // Keep existing data on timeout
      }
      
      // For courses, admins can see all courses as "their" courses
      if (profile.role === 'admin') {
        try {
          const adminCoursesResult = await connection.executeWithRetry(async (client) => {
            return await client
              .from('courses')
              .select('*')
              .order('created_at', { ascending: false });
          });
          
          const adminCoursesData = adminCoursesResult?.data;
          const adminCoursesError = adminCoursesResult?.error;
          if (adminCoursesError) {
            console.error('Error fetching admin courses:', adminCoursesError);
          } else {
            setUserCourses(adminCoursesData || []);
          }
        } catch (error) {
          console.error('Admin courses fetch timeout:', error);
          // Keep existing data on timeout
        }
      } else {
        // Regular users see their enrolled courses
        try {
          const userCoursesResult = await connection.executeWithRetry(async (client) => {
            return await client
              .from('course_enrollments')
              .select(`
                *,
                courses (*)
              `)
              .eq('user_id', user.id)
              .order('enrolled_at', { ascending: false });
          });
          
          const userCoursesData = userCoursesResult?.data;
          const userCoursesError = userCoursesResult?.error;
          if (userCoursesError) {
            console.error('Error fetching user course enrollments:', userCoursesError);
          } else {
            // Extract course data from enrollments
            const courses = userCoursesData?.map((enrollment: any) => enrollment.courses).filter(Boolean) || [];
            setUserCourses(courses);
          }
        } catch (error) {
          console.error('User course enrollments fetch timeout:', error);
          // Keep existing data on timeout
        }
      }
    } catch (error) {
      console.error('Error fetching user content:', error);
    }
  };

  const refreshData = async () => {
    await fetchDataWithTimeout(true);
  };

  const refreshUserContent = async () => {
    await fetchUserContent();
  };

  const addBlog = async (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at'>) => {
    await ensureConnection();
    try {
      const { data, error } = await connection.executeWithRetry(async (client) => {
        return await client
          .from('blogs')
          .insert([{ ...blog, user_id: user?.id }])
          .select()
          .single();
      });

      if (error) throw error;
      setBlogs(prev => [data, ...prev]);
      
      // Update user blogs if this user created it
      if (user) {
        setUserBlogs(prev => [data, ...prev]);
      }
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        blogs: [data, ...(prev.blogs || [])],
        lastFetch: Date.now()
      }));
    } catch (error) {
      if (String(error).includes('connection') || String(error).includes('timeout')) {
        setConnectionStatus('disconnected');
      }
      console.error('Error adding blog:', error);
      throw error;
    }
  };

  const updateBlog = async (id: string, updatedBlog: Partial<Blog>) => {
    await ensureConnection();
    try {
      const { data, error } = await connection.executeWithRetry(async (client) => {
        return await client
          .from('blogs')
          .update({ ...updatedBlog, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
      });

      if (error) throw error;
      setBlogs(prev => prev.map(blog => blog.id === id ? data : blog));
      setUserBlogs(prev => prev.map(blog => blog.id === id ? data : blog));
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        blogs: prev.blogs?.map(blog => blog.id === id ? data : blog),
        lastFetch: Date.now()
      }));
    } catch (error) {
      if (String(error).includes('connection') || String(error).includes('timeout')) {
        setConnectionStatus('disconnected');
      }
      console.error('Error updating blog:', error);
      throw error;
    }
  };

  const deleteBlog = async (id: string) => {
    await ensureConnection();
    try {
      const { error } = await connection.executeWithRetry(async (client) => {
        return await client
          .from('blogs')
          .delete()
          .eq('id', id);
      });

      if (error) throw error;
      setBlogs(prev => prev.filter(blog => blog.id !== id));
      setUserBlogs(prev => prev.filter(blog => blog.id !== id));
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        blogs: prev.blogs?.filter(blog => blog.id !== id),
        lastFetch: Date.now()
      }));
    } catch (error) {
      if (String(error).includes('connection') || String(error).includes('timeout')) {
        setConnectionStatus('disconnected');
      }
      console.error('Error deleting blog:', error);
      throw error;
    }
  };

  const addCourse = async (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
    await ensureConnection();
    try {
      const { data, error } = await connection.executeWithRetry(async (client) => {
        return await client
          .from('courses')
          .insert([course])
          .select()
          .single();
      });

      if (error) throw error;
      setCourses(prev => [data, ...prev]);
      
      // Update user courses for admins
      if (profile?.role === 'admin') {
        setUserCourses(prev => [data, ...prev]);
      }
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        courses: [data, ...(prev.courses || [])],
        lastFetch: Date.now()
      }));
    } catch (error) {
      if (String(error).includes('connection') || String(error).includes('timeout')) {
        setConnectionStatus('disconnected');
      }
      console.error('Error adding course:', error);
      throw error;
    }
  };

  const updateCourse = async (id: string, updatedCourse: Partial<Course>) => {
    await ensureConnection();
    try {
      const { data, error } = await connection.executeWithRetry(async (client) => {
        return await client
          .from('courses')
          .update({ ...updatedCourse, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
      });

      if (error) throw error;
      setCourses(prev => prev.map(course => course.id === id ? data : course));
      setUserCourses(prev => prev.map(course => course.id === id ? data : course));
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        courses: prev.courses?.map(course => course.id === id ? data : course),
        lastFetch: Date.now()
      }));
    } catch (error) {
      if (String(error).includes('connection') || String(error).includes('timeout')) {
        setConnectionStatus('disconnected');
      }
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const deleteCourse = async (id: string) => {
    await ensureConnection();
    try {
      const { error } = await connection.executeWithRetry(async (client) => {
        return await client
          .from('courses')
          .delete()
          .eq('id', id);
      });

      if (error) throw error;
      setCourses(prev => prev.filter(course => course.id !== id));
      setUserCourses(prev => prev.filter(course => course.id !== id));
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        courses: prev.courses?.filter(course => course.id !== id),
        lastFetch: Date.now()
      }));
    } catch (error) {
      if (String(error).includes('connection') || String(error).includes('timeout')) {
        setConnectionStatus('disconnected');
      }
      console.error('Error deleting course:', error);
      throw error;
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const value: AppContextType = {
    blogs,
    courses,
    userBlogs,
    userCourses,
    darkMode,
    loading,
    isAdmin: authIsAdmin,
    addBlog,
    updateBlog,
    deleteBlog,
    addCourse,
    updateCourse,
    deleteCourse,
    toggleDarkMode,
    refreshData,
    refreshUserContent
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};