import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle,
  Calendar,
  Activity,
  Shield,
  Settings
} from 'lucide-react';
import { getSupabase } from '../lib/supabaseConnection';
import { useAuth } from '../components/Auth/AuthProvider';
import { Navigate } from 'react-router-dom';

interface AnalyticsData {
  totalUsers: number;
  totalBlogs: number;
  totalCourses: number;
  totalLikes: number;
  totalComments: number;
  recentActivity: any[];
  popularBlogs: any[];
  userGrowth: any[];
  usersChange: number;
  blogsChange: number;
  coursesChange: number;
  likesChange: number;
  commentsChange: number;
}

const AdminPanel: React.FC = () => {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalBlogs: 0,
    totalCourses: 0,
    totalLikes: 0,
    totalComments: 0,
    recentActivity: [],
    popularBlogs: [],
    userGrowth: [],
    usersChange: 0,
    blogsChange: 0,
    coursesChange: 0,
    likesChange: 0,
    commentsChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const getDateNDaysAgo = (n: number): string => {
        const d = new Date();
        d.setDate(d.getDate() - n);
        return d.toISOString();
      };
      const supabase = await getSupabase();
      // Current and previous periods (last 7 days, 7-14 days ago)
      const [
        { count: totalUsers },
        { count: totalBlogs },
        { count: totalCourses },
        { count: totalLikes },
        { count: totalComments },
        { count: usersCurrent },
        { count: usersPrevious },
        { count: blogsCurrent },
        { count: blogsPrevious },
        { count: coursesCurrent },
        { count: coursesPrevious },
        { count: likesCurrent },
        { count: likesPrevious },
        { count: commentsCurrent },
        { count: commentsPrevious }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('blog_likes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        // Users: current and previous week
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).gte('created_at', getDateNDaysAgo(7)),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).gte('created_at', getDateNDaysAgo(14)).lt('created_at', getDateNDaysAgo(7)),
        // Blogs: current and previous week
        supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', getDateNDaysAgo(7)),
        supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', getDateNDaysAgo(14)).lt('created_at', getDateNDaysAgo(7)),
        // Courses: current and previous week
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', getDateNDaysAgo(7)),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', getDateNDaysAgo(14)).lt('created_at', getDateNDaysAgo(7)),
        // Likes: current and previous week
        supabase.from('blog_likes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', getDateNDaysAgo(7)),
        supabase.from('blog_likes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', getDateNDaysAgo(14)).lt('created_at', getDateNDaysAgo(7)),
        // Comments: current and previous week
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', getDateNDaysAgo(7)),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', getDateNDaysAgo(14)).lt('created_at', getDateNDaysAgo(7)),
      ]);
      // Calculate changes
      const calcChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };
      const usersChange = calcChange(usersCurrent ?? 0, usersPrevious ?? 0);
      const blogsChange = calcChange(blogsCurrent ?? 0, blogsPrevious ?? 0);
      const coursesChange = calcChange(coursesCurrent ?? 0, coursesPrevious ?? 0);
      const likesChange = calcChange(likesCurrent ?? 0, likesPrevious ?? 0);
      const commentsChange = calcChange(commentsCurrent ?? 0, commentsPrevious ?? 0);
      // Fetch popular blogs for this admin
      const { data: popularBlogs } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          author,
          created_at,
          blog_likes (count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      // Fetch recent activity (comments and likes from last 7 days) for this admin
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: recentComments } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .gte('created_at', getDateNDaysAgo(7))
        .order('created_at', { ascending: false })
        .limit(10);
      const { data: recentLikes } = await supabase
        .from('blog_likes')
        .select(`
          id,
          created_at,
          user_profiles (full_name),
          blogs (title)
        `)
        .eq('user_id', user.id)
        .gte('created_at', getDateNDaysAgo(7))
        .order('created_at', { ascending: false })
        .limit(10);
      // Combine and sort recent activity
      const recentActivity = [
        ...(recentComments || []).map(comment => ({
          type: 'comment',
          ...comment
        })),
        ...(recentLikes || []).map(like => ({
          type: 'like',
          ...like
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      // Fetch user growth data (all users, or filter if needed)
      const { data: userGrowthData } = await supabase
        .from('user_profiles')
        .select('created_at')
        .order('created_at', { ascending: true });
      const userGrowth = processUserGrowthData(userGrowthData || []);
      setAnalytics({
        totalUsers: totalUsers || 0,
        totalBlogs: totalBlogs || 0,
        totalCourses: totalCourses || 0,
        totalLikes: totalLikes || 0,
        totalComments: totalComments || 0,
        recentActivity: recentActivity.slice(0, 10),
        popularBlogs: popularBlogs || [],
        userGrowth,
        usersChange,
        blogsChange,
        coursesChange,
        likesChange,
        commentsChange
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processUserGrowthData = (userData: any[]) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        users: 0
      };
    });

    userData.forEach(user => {
      const userDate = new Date(user.created_at).toISOString().split('T')[0];
      const dayIndex = last30Days.findIndex(day => day.date === userDate);
      if (dayIndex !== -1) {
        last30Days[dayIndex].users += 1;
      }
    });

    return last30Days;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: analytics.usersChange
    },
    {
      title: 'Blog Posts',
      value: analytics.totalBlogs,
      icon: BookOpen,
      color: 'bg-green-500',
      change: analytics.blogsChange
    },
    {
      title: 'Courses',
      value: analytics.totalCourses,
      icon: GraduationCap,
      color: 'bg-purple-500',
      change: analytics.coursesChange
    },
    {
      title: 'Total Likes',
      value: analytics.totalLikes,
      icon: Heart,
      color: 'bg-red-500',
      change: analytics.likesChange
    },
    {
      title: 'Comments',
      value: analytics.totalComments,
      icon: MessageCircle,
      color: 'bg-orange-500',
      change: analytics.commentsChange
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Monitor and manage your ROBOSTAAN platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchAnalytics}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span>Refresh</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value.toLocaleString()}
                      </p>
                      {stat.change !== 0 && (
                        <p className={`text-sm mt-1 ${
                          stat.change > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change).toFixed(0)}%
                        </p>
                      )}
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Popular Blogs */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Popular Blog Posts
                  </h2>
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                
                <div className="space-y-4">
                  {analytics.popularBlogs.map((blog, index) => (
                    <div key={blog.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {blog.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          by {blog.author} • {formatDate(blog.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Heart className="w-4 h-4" />
                        <span>{blog.blog_likes?.length || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Recent Activity
                  </h2>
                  <Activity className="w-5 h-5 text-orange-500" />
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {analytics.recentActivity.map((activity, index) => (
                    <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'like' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.type === 'like' ? (
                          <Heart className="w-4 h-4" />
                        ) : (
                          <MessageCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">
                            {activity.user_profiles?.full_name || 'Anonymous'}
                          </span>
                          {activity.type === 'like' ? ' liked ' : ' commented on '}
                          <span className="font-medium">
                            {activity.blogs?.title || 'a post'}
                          </span>
                        </p>
                        {activity.type === 'comment' && activity.content && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            "{activity.content}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {analytics.recentActivity.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No recent activity
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* User Growth Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  User Growth (Last 30 Days)
                </h2>
                <BarChart3 className="w-5 h-5 text-orange-500" />
              </div>
              
              <div className="h-64 flex items-end justify-between space-x-1">
                {analytics.userGrowth.map((day, index) => (
                  <div
                    key={day.date}
                    className="flex-1 bg-orange-500 rounded-t-sm opacity-70 hover:opacity-100 transition-opacity"
                    style={{
                      height: `${Math.max((day.users / Math.max(...analytics.userGrowth.map(d => d.users))) * 100, 2)}%`
                    }}
                    title={`${day.date}: ${day.users} new users`}
                  />
                ))}
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;