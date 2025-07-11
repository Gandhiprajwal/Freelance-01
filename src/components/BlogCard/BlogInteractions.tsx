import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabaseConnection';
import { useAuth } from '../Auth/AuthProvider';

interface BlogInteractionsProps {
  blogId: string;
  onCommentClick: () => void;
}

const BlogInteractions: React.FC<BlogInteractionsProps> = ({ blogId, onCommentClick }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInteractionData();
  }, [blogId, user]);

  const fetchInteractionData = async () => {
    try {
      console.log('Fetching interaction data for blog:', blogId);
      
      // Fetch like count
      const { count: likes } = await supabase
        .from('blog_likes')
        .select('*', { count: 'exact', head: true })
        .eq('blog_id', blogId);

      setLikeCount(likes || 0);
      console.log('Like count:', likes);

      // Check if user liked this blog
      if (user) {
        const { data: userLike } = await supabase
          .from('blog_likes')
          .select('id')
          .eq('blog_id', blogId)
          .eq('user_id', user.id)
          .single();

        setLiked(!!userLike);
        console.log('User liked:', !!userLike);
      }

      // Fetch comment count
      const { count: comments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('blog_id', blogId);

      setCommentCount(comments || 0);
      console.log('Comment count:', comments);
    } catch (error) {
      console.error('Error fetching interaction data:', error);
    }
  };

  const handleLike = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      if (liked) {
        // Unlike
        await supabase
          .from('blog_likes')
          .delete()
          .eq('blog_id', blogId)
          .eq('user_id', user.id);

        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        // Like
        await supabase
          .from('blog_likes')
          .insert({ blog_id: blogId, user_id: user.id });

        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${blogId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this blog post',
          url: url
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLike}
          disabled={!user || loading}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
            liked
              ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span className="text-sm">{likeCount}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCommentClick}
          className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{commentCount}</span>
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
        className="flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm">Share</span>
      </motion.button>
    </div>
  );
};

export default BlogInteractions;