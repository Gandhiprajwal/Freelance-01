import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, Share2, Heart } from 'lucide-react';
import { getSupabase } from '../lib/supabaseConnection';
import BlogInteractions from '../components/BlogCard/BlogInteractions';
import CommentSection from '../components/Comments/CommentSection';

type Blog = {
  id: string;
  title: string;
  content: string;
  snippet: string;
  image: string;
  tags: string[];
  author: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
};

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;

      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setBlog(data);
      } catch (err) {
        setError('Failed to load blog post');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Blog post not found
          </h1>
          <Link
            to="/blogs"
            className="text-orange-500 hover:text-orange-600 transition-colors"
          >
            ← Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            to="/blogs"
            className="inline-flex items-center space-x-2 text-orange-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blogs</span>
          </Link>
        </motion.div>

        {/* Blog Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {blog.featured && (
            <div className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
              Featured Post
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(blog.created_at ?? '').toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm rounded-full"
              >
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg"
          />
        </motion.div>

        {/* Blog Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="prose prose-lg max-w-none dark:prose-invert mb-8"
        >
          <div
            className="blog-content text-gray-800 dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-8"
        >
          <BlogInteractions 
            blogId={blog.id} 
            onCommentClick={() => setShowComments(true)} 
          />
        </motion.div>
      </div>

      <CommentSection
        blogId={blog.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />

      <style>{`
        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          color: inherit;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .blog-content h1 { font-size: 2.25rem; }
        .blog-content h2 { font-size: 1.875rem; }
        .blog-content h3 { font-size: 1.5rem; }
        .blog-content h4 { font-size: 1.25rem; }

        .blog-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }

        .blog-content ul,
        .blog-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .blog-content li {
          margin-bottom: 0.5rem;
        }

        .blog-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .dark .blog-content pre {
          background-color: #374151;
        }

        .blog-content code {
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
        }

        .dark .blog-content code {
          background-color: #374151;
        }

        .blog-content blockquote {
          border-left: 4px solid #C45215;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
        }

        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
};

export default BlogDetail;