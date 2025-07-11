import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Blog } from '../../lib/supabaseConnection';
import BlogInteractions from './BlogInteractions';
import CommentSection from '../Comments/CommentSection';
import { useAuth } from '../../components/Auth/AuthProvider';

interface BlogCardProps {
  blog: Blog;
  onEdit?: (blog: Blog) => void;
  onDelete?: (id: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, onEdit, onDelete }) => {
  const { isAdmin } = useApp();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
      >
        <div className="relative">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-48 object-cover"
          />
          {blog.featured && (
            <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Featured
            </div>
          )}
          {user && blog.user_id === user.id && (
            <div className="absolute top-4 right-4 flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit?.(blog)}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete?.(blog.id)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {blog.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {blog.snippet}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <Link to={`/blog/${blog.id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Read More</span>
              </motion.button>
            </Link>
          </div>
          
          <BlogInteractions 
            blogId={blog.id} 
            onCommentClick={() => setShowComments(true)} 
          />
        </div>
      </motion.div>
      
      <CommentSection
        blogId={blog.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  );
};

export default BlogCard;