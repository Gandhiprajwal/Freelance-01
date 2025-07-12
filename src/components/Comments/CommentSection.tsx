import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Reply, Trash2, Edit3, X, Wifi, WifiOff } from 'lucide-react';
import { getSupabaseConnection } from '../../lib/supabaseConnection';
import { useAuth } from '../Auth/AuthProvider';
import { useCommentQueue } from '../../lib/useRequestQueue';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  blog_id?: string;
  course_id?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user_profiles: {
    full_name: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  blogId?: string;
  courseId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ blogId, courseId, isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingComments, setFetchingComments] = useState(false);
  const { 
    queueComment, 
    queueReply, 
    queueEditComment, 
    queueDeleteComment, 
    status: queueStatus, 
    isConnected 
  } = useCommentQueue();

  useEffect(() => {
    if (isOpen && (blogId || courseId)) {
      fetchComments();
    }
  }, [isOpen, blogId, courseId]);

  const fetchComments = async () => {
    if (!blogId && !courseId) return;
    
    setFetchingComments(true);
    try {
      
      const supabase = await getSupabaseConnection().getClient();
      
      // First, fetch top-level comments (no parent_id)
      let query = supabase
        .from('comments')
        .select(`
          *,
          user_profiles (
            full_name,
            avatar_url
          )
        `)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (blogId) {
        query = query.eq('blog_id', blogId);
      } else if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data: topLevelComments, error } = await query;

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      if (!topLevelComments || topLevelComments.length === 0) {
        setComments([]);
        return;
      }

      // Fetch replies for each top-level comment
      const commentsWithReplies = await Promise.all(
        topLevelComments.map(async (comment: Comment) => {
          try {
            const { data: replies, error: repliesError } = await supabase
              .from('comments')
              .select(`
                *,
                user_profiles (
                  full_name,
                  avatar_url
                )
              `)
              .eq('parent_id', comment.id)
              .order('created_at', { ascending: true });

            if (repliesError) {
              console.error('Error fetching replies for comment:', comment.id, repliesError);
              return { ...comment, replies: [] };
            }

            return { ...comment, replies: replies || [] };
          } catch (error) {
            console.error('Error processing comment:', comment.id, error);
            return { ...comment, replies: [] };
          }
        })
      );

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setFetchingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || loading) return;

    setLoading(true);
    try {
      
      await queueComment(
        newComment.trim(),
        user.id,
        blogId,
        courseId
      );

      setNewComment('');
      
      // Fetch comments after a short delay to allow queue processing
      setTimeout(() => {
        fetchComments();
      }, 1000);
    } catch (error) {
      alert('Failed to queue comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim() || loading) return;

    setLoading(true);
    try {
      
      await queueReply(
        replyContent.trim(),
        user.id,
        parentId,
        blogId,
        courseId
      );

      setReplyTo(null);
      setReplyContent('');
      
      // Fetch comments after a short delay to allow queue processing
      setTimeout(() => {
        fetchComments();
      }, 1000);
    } catch (error) {
      alert('Failed to queue reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || loading) return;

    setLoading(true);
    try {
      
      await queueEditComment(commentId, editContent.trim());

      setEditingComment(null);
      setEditContent('');
      
      // Fetch comments after a short delay to allow queue processing
      setTimeout(() => {
        fetchComments();
      }, 1000);
    } catch (error) {
      alert('Failed to queue comment edit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setLoading(true);
    try {
      
      await queueDeleteComment(commentId);
      
      // Fetch comments after a short delay to allow queue processing
      setTimeout(() => {
        fetchComments();
      }, 1000);
    } catch (error) {
      alert('Failed to queue comment deletion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

  const renderComment = (comment: Comment, isReply = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''} mb-4`}
    >
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {comment.user_profiles?.avatar_url ? (
              <img
                src={comment.user_profiles.avatar_url}
                alt={comment.user_profiles.full_name || 'User'}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <span className={`text-white text-sm font-medium ${comment.user_profiles?.avatar_url ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
              {getInitials(comment.user_profiles?.full_name || 'User')}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {comment.user_profiles?.full_name || 'Anonymous User'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.created_at)}
                  {comment.updated_at !== comment.created_at && ' (edited)'}
                </p>
              </div>

              {user?.id === comment.user_id && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {editingComment === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditComment(comment.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap">
                  {comment.content}
                </p>

                {!isReply && user && (
                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="flex items-center space-x-1 text-sm text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {replyTo === comment.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 ml-11"
          >
            <div className="flex space-x-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={2}
              />
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={loading || !replyContent.trim()}
                  className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setReplyTo(null);
                    setReplyContent('');
                  }}
                  className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Comments ({comments.length})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comment Form */}
            {user ? (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    required
                  />
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading || !newComment.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Post Comment</span>
                    </motion.button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 text-center flex-shrink-0">
                <p className="text-gray-600 dark:text-gray-400">
                  Please sign in to leave a comment.
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto">
              {fetchingComments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading comments...</span>
                </div>
              ) : comments.length > 0 ? (
                <div className="p-6 space-y-4">
                  {comments.map(comment => renderComment(comment))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentSection;