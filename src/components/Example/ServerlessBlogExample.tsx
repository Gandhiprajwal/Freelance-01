import React, { useState, useEffect } from 'react';
import { useBlogs, useSupabase, useComments, useBlogLikes, useBlogViews, useBlogReach, usePublicBlogViews } from '../../lib/useSupabase';
import { Blog, Comment } from '../../lib/supabaseService';

// Example component demonstrating serverless-optimized Supabase usage
export const ServerlessBlogExample: React.FC = () => {
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  // Connection management
  const { connectionStatus, isConnected, reconnect } = useSupabase({
    autoConnect: true,
    enableRealtime: true,
    cleanupOnUnmount: true
  });

  // Blog operations with realtime updates
  const { 
    blogs, 
    isLoading: blogsLoading, 
    error: blogsError, 
    createBlog, 
    updateBlog, 
    deleteBlog,
    refetch: refetchBlogs 
  } = useBlogs({
    limit: 10,
    featured: false,
    autoFetch: true
  });

  // Views for selected blog
  const { viewCount, views, isLoading: viewsLoading, error: viewsError, fetchViews } = useBlogViews(selectedBlogId || '', !!selectedBlogId);

  // Admin reach analytics (only their owned blogs)
  const { reach, isLoading: reachLoading, error: reachError, fetchReach } = useBlogReach();

  // Public view counts for all blogs
  const { publicViews, isLoading: publicViewsLoading, error: publicViewsError } = usePublicBlogViews();

  // Comments for selected blog
  const { 
    comments, 
    isLoading: commentsLoading, 
    error: commentsError, 
    createComment 
  } = useComments({
    blog_id: selectedBlogId || undefined,
    autoFetch: !!selectedBlogId
  });

  // Likes for selected blog
  const { 
    likes, 
    isLoading: likesLoading, 
    error: likesError, 
    toggleLike 
  } = useBlogLikes(selectedBlogId || '', !!selectedBlogId);

  // Handle blog creation
  const handleCreateBlog = async () => {
    try {
      const result = await createBlog({
        title: 'New Blog Post',
        content: 'This is a new blog post created with the serverless-optimized setup.',
        snippet: 'A brief snippet about the new blog post.',
        image: 'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg',
        tags: ['example', 'serverless'],
        author: 'Example User',
        featured: false
      });
      
      console.log('Blog created successfully:', result);
    } catch (error) {
      console.error('Failed to create blog:', error);
    }
  };

  // Handle comment creation
  const handleCreateComment = async () => {
    if (!selectedBlogId || !newComment.trim()) return;

    try {
      const result = await createComment({
        user_id: 'example-user-id', // In real app, get from auth
        blog_id: selectedBlogId,
        content: newComment.trim()
      });
      
      setNewComment('');
      console.log('Comment created successfully:', result);
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  // Handle like toggle
  const handleToggleLike = async () => {
    if (!selectedBlogId) return;

    try {
      const userId = 'example-user-id'; // In real app, get from auth
      const result = await toggleLike(userId);
      
      console.log('Like toggled successfully:', result);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  // When a blog is selected, record a view
  useEffect(() => {
    if (selectedBlogId) {
      // Record a view (public, no user info for demo)
      import('../../lib/supabaseService').then(({ recordBlogView }) => {
        recordBlogView(selectedBlogId, {
          // Optionally pass userId/sessionId if available
          viewerUserAgent: navigator.userAgent
        });
      });
      // Fetch views for this blog
      fetchViews();
    }
  }, [selectedBlogId, fetchViews]);

  // Connection status indicator
  const ConnectionStatus: React.FC = () => (
    <div className="mb-4 p-3 rounded-lg border">
      <h3 className="font-semibold mb-2">Connection Status</h3>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span>Status: {connectionStatus.status}</span>
        </div>
        <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
        {!isConnected && (
          <button
            onClick={reconnect}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Reconnect
          </button>
        )}
      </div>
    </div>
  );

  // Error display component
  const ErrorDisplay: React.FC<{ error: string | null; title: string }> = ({ error, title }) => {
    if (!error) return null;
    
    return (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-semibold text-red-800 mb-1">{title}</h4>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  };

  // Loading component
  const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2" />
      <span className="text-gray-600">{message}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Serverless-Optimized Supabase Example
      </h1>

      {/* Connection Status */}
      <ConnectionStatus />

      {/* Error Displays */}
      <ErrorDisplay error={blogsError} title="Blogs Error" />
      <ErrorDisplay error={commentsError} title="Comments Error" />
      <ErrorDisplay error={likesError} title="Likes Error" />
      <ErrorDisplay error={viewsError} title="Views Error" />
      <ErrorDisplay error={reachError} title="Reach Analytics Error" />

      {/* Blog Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Blog Management</h2>
          <button
            onClick={handleCreateBlog}
            disabled={blogsLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {blogsLoading ? 'Creating...' : 'Create Blog'}
          </button>
        </div>

        {blogsLoading ? (
          <LoadingSpinner message="Loading blogs..." />
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedBlogId(blog.id)}
              >
                <h3 className="font-semibold">{blog.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{blog.snippet}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>By: {blog.author}</span>
                  <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                  <span>Tags: {blog.tags.join(', ')}</span>
                  <span className="ml-auto font-semibold text-blue-600">
                    Views: <PublicBlogViewCount blogId={blog.id} publicViews={publicViews} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Blog Details */}
      {selectedBlogId && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Blog Details & Interactions</h2>
          
          {/* Likes Section */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Likes</h3>
            {likesLoading ? (
              <LoadingSpinner message="Loading likes..." />
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {likes.length} like{likes.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleToggleLike}
                  disabled={likesLoading}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  {likesLoading ? 'Toggling...' : 'Toggle Like'}
                </button>
              </div>
            )}
          </div>

          {/* Views Section */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Views</h3>
            {viewsLoading ? (
              <LoadingSpinner message="Loading views..." />
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {viewCount} view{viewCount !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-gray-400">(This blog)</span>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="font-medium mb-2">Comments</h3>
            
            {/* Add Comment */}
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-2 border rounded-lg resize-none"
                rows={3}
              />
              <button
                onClick={handleCreateComment}
                disabled={!newComment.trim() || commentsLoading}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {commentsLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>

            {/* Comments List */}
            {commentsLoading ? (
              <LoadingSpinner message="Loading comments..." />
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-800">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>User: {comment.user_id}</span>
                      <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance Monitoring */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Performance Info</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Total Blogs: {blogs.length}</div>
          <div>Selected Blog Comments: {comments.length}</div>
          <div>Selected Blog Likes: {likes.length}</div>
          <div>Selected Blog Views: {viewCount}</div>
          <div>Connection Status: {connectionStatus.status}</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2 text-blue-800">How This Works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Serverless Connection:</strong> Connections are created on-demand and cleaned up automatically</li>
          <li>• <strong>Realtime Updates:</strong> Blog changes, comments, and likes update in real-time</li>
          <li>• <strong>Error Handling:</strong> Comprehensive error handling with retry logic</li>
          <li>• <strong>Loading States:</strong> Proper loading indicators for all operations</li>
          <li>• <strong>Resource Management:</strong> Channels are only active when needed</li>
          <li>• <strong>Security:</strong> All operations respect RLS policies</li>
        </ul>
      </div>

      {/* Admin Reach Analytics */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2 text-yellow-800">Admin: Your Blog Reach Analytics</h3>
        <p className="text-xs text-yellow-700 mb-2">(Only shows views for blogs you own)</p>
        {reachLoading ? (
          <LoadingSpinner message="Loading reach analytics..." />
        ) : reachError ? (
          <ErrorDisplay error={reachError} title="Reach Analytics Error" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-yellow-100">
                  <th className="px-2 py-1 text-left">Blog ID</th>
                  <th className="px-2 py-1 text-left">Views</th>
                </tr>
              </thead>
              <tbody>
                {reach.map(({ blog_id, views }) => (
                  <tr key={blog_id}>
                    <td className="px-2 py-1 font-mono">{blog_id}</td>
                    <td className="px-2 py-1">{views}</td>
                  </tr>
                ))}
                {reach.length === 0 && (
                  <tr><td colSpan={2} className="text-center text-gray-500 py-2">No blogs owned by you</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component to show public view count for a blog
const PublicBlogViewCount: React.FC<{ blogId: string; publicViews: { blog_id: string; views: number }[] }> = ({ blogId, publicViews }) => {
  const viewData = publicViews.find(v => v.blog_id === blogId);
  return viewData ? <>{viewData.views}</> : <span className="text-gray-400">0</span>;
};

// Helper component to show view count for a blog (legacy, for selected blog details)
const BlogViewCount: React.FC<{ blogId: string }> = ({ blogId }) => {
  const { viewCount, isLoading } = useBlogViews(blogId, true);
  return isLoading ? <span className="text-gray-400">...</span> : <>{viewCount}</>;
};

export default ServerlessBlogExample; 