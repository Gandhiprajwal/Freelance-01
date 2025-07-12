import { useEffect, useState, useCallback, useRef } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase, getSupabaseConnection } from './supabaseConnection';
import supabaseService, {
  Blog,
  Course,
  UserProfile,
  Comment,
  BlogLike,
  CourseEnrollment,
  BlogView,
  recordBlogView,
  getBlogViewCount,
  getBlogViews,
  getAllBlogViews,
} from './supabaseService';

// Types for the hook
interface UseSupabaseOptions {
  autoConnect?: boolean;
  enableRealtime?: boolean;
  cleanupOnUnmount?: boolean;
}

interface ConnectionStatus {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  isConnected: boolean;
  lastActivity: number;
  activeChannels: number;
  isPageVisible: boolean;
}

// Main hook for Supabase connection management
export function useSupabase(options: UseSupabaseOptions = {}) {
  const {
    autoConnect = true,
    enableRealtime = true,
    cleanupOnUnmount = true
  } = options;

  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected',
    isConnected: false,
    lastActivity: 0,
    activeChannels: 0,
    isPageVisible: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connectionRef = useRef(getSupabaseConnection());
  const cleanupRef = useRef<(() => void) | null>(null);

  // Initialize connection
  const initializeConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabaseClient = await getSupabase();
      setClient(supabaseClient);

      // Update connection status
      const status = connectionRef.current.getConnectionStatus();
      const healthStatus = connectionRef.current.getHealthStatus();

      setConnectionStatus({
        status,
        isConnected: connectionRef.current.isConnected(),
        lastActivity: healthStatus.lastHealthCheck,
        activeChannels: healthStatus.activeChannels,
        isPageVisible: healthStatus.isPageVisible
      });

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Supabase');
      setIsLoading(false);
    }
  }, []);

  // Monitor connection status
  const monitorConnection = useCallback(() => {
    const interval = setInterval(() => {
      const status = connectionRef.current.getConnectionStatus();
      const healthStatus = connectionRef.current.getHealthStatus();

      setConnectionStatus({
        status,
        isConnected: connectionRef.current.isConnected(),
        lastActivity: healthStatus.lastHealthCheck,
        activeChannels: healthStatus.activeChannels,
        isPageVisible: healthStatus.isPageVisible
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (cleanupOnUnmount) {
      connectionRef.current.cleanup();
    }
  }, [cleanupOnUnmount]);

  // Initialize on mount
  useEffect(() => {
    if (autoConnect) {
      initializeConnection();
    }

    const statusMonitor = monitorConnection();

    // Cleanup on unmount
    cleanupRef.current = cleanup;

    return () => {
      statusMonitor();
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [autoConnect, initializeConnection, monitorConnection, cleanup]);

  // Reconnect function
  const reconnect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await connectionRef.current.reconnect();
      await initializeConnection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reconnect');
      setIsLoading(false);
    }
  }, [initializeConnection]);

  return {
    client,
    connectionStatus,
    isLoading,
    error,
    reconnect,
    isConnected: connectionStatus.isConnected
  };
}

// Hook for blog operations
export function useBlogs(options: {
  limit?: number;
  offset?: number;
  featured?: boolean;
  tags?: string[];
  search?: string;
  autoFetch?: boolean;
} = {}) {
  const { autoFetch = true, ...queryOptions } = options;
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabaseService.getBlogs(queryOptions);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setBlogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
    } finally {
      setIsLoading(false);
    }
  }, [queryOptions]);

  const createBlog = useCallback(async (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: createError } = await supabaseService.createBlog(blog);

      if (createError) {
        throw new Error(createError.message);
      }

      if (data) {
        setBlogs(prev => [data, ...prev]);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blog');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBlog = useCallback(async (id: string, updates: Partial<Blog>) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: updateError } = await supabaseService.updateBlog(id, updates);

      if (updateError) {
        throw new Error(updateError.message);
      }

      if (data) {
        setBlogs(prev => prev.map(blog => blog.id === id ? data : blog));
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blog');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBlog = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: deleteError } = await supabaseService.deleteBlog(id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      setBlogs(prev => prev.filter(blog => blog.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    if (autoFetch) {
      fetchBlogs();
    }

    // Subscribe to blog updates
    const handleBlogUpdate = (payload: any) => {
      if (payload.eventType === 'INSERT') {
        setBlogs(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setBlogs(prev => prev.map(blog => blog.id === payload.new.id ? payload.new : blog));
      } else if (payload.eventType === 'DELETE') {
        setBlogs(prev => prev.filter(blog => blog.id !== payload.old.id));
      }
    };

    supabaseService.subscribeToBlogUpdates(handleBlogUpdate);

    return () => {
      // Cleanup is handled by the connection manager
    };
  }, [autoFetch, fetchBlogs]);

  return {
    blogs,
    isLoading,
    error,
    fetchBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    refetch: fetchBlogs
  };
}

// Hook for single blog
export function useBlog(id: string, autoFetch = true) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlog = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabaseService.getBlogById(id);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setBlog(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (autoFetch && id) {
      fetchBlog();
    }
  }, [autoFetch, id, fetchBlog]);

  return {
    blog,
    isLoading,
    error,
    fetchBlog,
    refetch: fetchBlog
  };
}

// Hook for courses
export function useCourses(options: {
  limit?: number;
  offset?: number;
  featured?: boolean;
  category?: string;
  search?: string;
  autoFetch?: boolean;
} = {}) {
  const { autoFetch = true, ...queryOptions } = options;
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabaseService.getCourses(queryOptions);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setCourses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  }, [queryOptions]);

  useEffect(() => {
    if (autoFetch) {
      fetchCourses();
    }

    // Subscribe to course updates
    const handleCourseUpdate = (payload: any) => {
      if (payload.eventType === 'INSERT') {
        setCourses(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setCourses(prev => prev.map(course => course.id === payload.new.id ? payload.new : course));
      } else if (payload.eventType === 'DELETE') {
        setCourses(prev => prev.filter(course => course.id !== payload.old.id));
      }
    };

    supabaseService.subscribeToCourseUpdates(handleCourseUpdate);

    return () => {
      // Cleanup is handled by the connection manager
    };
  }, [autoFetch, fetchCourses]);

  return {
    courses,
    isLoading,
    error,
    fetchCourses,
    refetch: fetchCourses
  };
}

// Hook for comments
export function useComments(options: {
  blog_id?: string;
  course_id?: string;
  parent_id?: string;
  limit?: number;
  offset?: number;
  autoFetch?: boolean;
} = {}) {
  const { autoFetch = true, ...queryOptions } = options;
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabaseService.getComments(queryOptions);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setComments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  }, [queryOptions]);

  const createComment = useCallback(async (comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: createError } = await supabaseService.createComment(comment);

      if (createError) {
        throw new Error(createError.message);
      }

      if (data) {
        setComments(prev => [...prev, data]);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchComments();
    }

    // Subscribe to comment updates
    const handleCommentUpdate = (payload: any) => {
      if (payload.eventType === 'INSERT') {
        setComments(prev => [...prev, payload.new]);
      } else if (payload.eventType === 'UPDATE') {
        setComments(prev => prev.map(comment => comment.id === payload.new.id ? payload.new : comment));
      } else if (payload.eventType === 'DELETE') {
        setComments(prev => prev.filter(comment => comment.id !== payload.old.id));
      }
    };

    supabaseService.subscribeToComments(handleCommentUpdate);

    return () => {
      // Cleanup is handled by the connection manager
    };
  }, [autoFetch, fetchComments]);

  return {
    comments,
    isLoading,
    error,
    fetchComments,
    createComment,
    refetch: fetchComments
  };
}

// Hook for blog likes
export function useBlogLikes(blogId: string, autoFetch = true) {
  const [likes, setLikes] = useState<BlogLike[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLikes = useCallback(async () => {
    if (!blogId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabaseService.getBlogLikes(blogId);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setLikes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch likes');
    } finally {
      setIsLoading(false);
    }
  }, [blogId]);

  const toggleLike = useCallback(async (userId: string) => {
    if (!blogId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: toggleError } = await supabaseService.toggleBlogLike(blogId, userId);

      if (toggleError) {
        throw new Error(toggleError.message);
      }

      // Refresh likes after toggle
      await fetchLikes();

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle like');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [blogId, fetchLikes]);

  useEffect(() => {
    if (autoFetch && blogId) {
      fetchLikes();
    }

    // Subscribe to like updates
    const handleLikeUpdate = (payload: any) => {
      if (payload.eventType === 'INSERT' && payload.new.blog_id === blogId) {
        setLikes(prev => [...prev, payload.new]);
      } else if (payload.eventType === 'DELETE' && payload.old.blog_id === blogId) {
        setLikes(prev => prev.filter(like => like.id !== payload.old.id));
      }
    };

    supabaseService.subscribeToLikes(handleLikeUpdate);

    return () => {
      // Cleanup is handled by the connection manager
    };
  }, [autoFetch, blogId, fetchLikes]);

  return {
    likes,
    isLoading,
    error,
    fetchLikes,
    toggleLike,
    refetch: fetchLikes
  };
}

// Hook for user profile
export function useUserProfile(userId: string, autoFetch = true) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabaseService.getUserProfile(userId);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: updateError } = await supabaseService.updateUserProfile(userId, updates);

      if (updateError) {
        throw new Error(updateError.message);
      }

      if (data) {
        setProfile(data);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoFetch && userId) {
      fetchProfile();
    }
  }, [autoFetch, userId, fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    refetch: fetchProfile
  };
}

// Hook for blog views (per blog)
export function useBlogViews(blogId: string, autoFetch = true) {
  const [views, setViews] = useState<BlogView[]>([]);
  const [viewCount, setViewCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchViews = useCallback(async () => {
    if (!blogId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [{ data: viewList, error: listError }, { count, error: countError }] = await Promise.all([
        supabaseService.getBlogViews(blogId),
        supabaseService.getBlogViewCount(blogId),
      ]);
      if (listError) throw listError;
      if (countError) throw countError;
      setViews(viewList);
      setViewCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch views');
    } finally {
      setIsLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    if (autoFetch && blogId) fetchViews();
  }, [autoFetch, blogId, fetchViews]);

  return {
    views,
    viewCount,
    isLoading,
    error,
    fetchViews,
    refetch: fetchViews,
  };
}

// Hook for admin blog reach analytics (only their owned blogs' view counts)
export function useBlogReach(autoFetch = true) {
  const [reach, setReach] = useState<{ blog_id: string; views: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReach = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabaseService.getAllBlogViews();
      if (fetchError) throw fetchError;
      setReach(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reach analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchReach();
  }, [autoFetch, fetchReach]);

  return {
    reach,
    isLoading,
    error,
    fetchReach,
    refetch: fetchReach,
  };
}

// Hook for public blog view counts (all blogs)
export function usePublicBlogViews(autoFetch = true) {
  const [publicViews, setPublicViews] = useState<{ blog_id: string; views: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicViews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabaseService.getPublicBlogViewCounts();
      if (fetchError) throw fetchError;
      setPublicViews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch public view counts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchPublicViews();
    }

    // Subscribe to blog_views table changes to update view counts in real-time
    const handleViewUpdate = (payload: any) => {
      if (payload.eventType === 'INSERT') {
        // A new view was recorded, refetch the public view counts
        fetchPublicViews();
      }
    };

    supabaseService.subscribeToViews(handleViewUpdate);

    return () => {
      // Cleanup is handled by the connection manager
    };
  }, [autoFetch, fetchPublicViews]);

  return {
    publicViews,
    isLoading,
    error,
    fetchPublicViews,
    refetch: fetchPublicViews,
  };
}

// Export the service for direct use
export { supabaseService }; 