import React from 'react';
import { motion } from 'framer-motion';
import { Eye, TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { useBlogReach, usePublicBlogViews } from '../../lib/useSupabase';
import { useAuth } from '../Auth/AuthProvider';

const BlogAnalytics: React.FC = () => {
  const { isAdmin } = useAuth();
  const { reach, isLoading: reachLoading, error: reachError } = useBlogReach();
  const { publicViews, isLoading: publicViewsLoading } = usePublicBlogViews();

  if (!isAdmin) {
    return null; // Only show for admins
  }

  const totalViews = reach.reduce((sum, blog) => sum + blog.views, 0);
  const averageViews = reach.length > 0 ? Math.round(totalViews / reach.length) : 0;
  const topBlog = reach.reduce((max, blog) => blog.views > max.views ? blog : max, { blog_id: '', views: 0 });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Blog Analytics
        </h2>
      </div>

      {reachError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="text-sm">Error loading analytics: {reachError}</p>
        </div>
      )}

      {reachLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 opacity-80" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Avg Views</p>
                  <p className="text-2xl font-bold">{averageViews.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 opacity-80" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Blogs Tracked</p>
                  <p className="text-2xl font-bold">{reach.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 opacity-80" />
              </div>
            </motion.div>
          </div>

          {/* Blog Performance */}
          {reach.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Blog Performance
              </h3>
              <div className="space-y-3">
                {reach
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 5)
                  .map((blog, index) => (
                    <div
                      key={blog.blog_id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Blog {blog.blog_id.slice(0, 8)}...
                          </p>
                          <p className="text-sm text-gray-500">
                            {blog.views} views
                          </p>
                        </div>
                      </div>
                      {blog.blog_id === topBlog.blog_id && (
                        <div className="flex items-center space-x-1 text-yellow-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm font-medium">Top</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Last updated</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date().toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total blogs in system</span>
                <span className="text-gray-900 dark:text-white">
                  {publicViewsLoading ? '...' : publicViews.length}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BlogAnalytics; 