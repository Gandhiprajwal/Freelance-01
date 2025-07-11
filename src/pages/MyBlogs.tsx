import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, X, BookOpen, GraduationCap } from "lucide-react";
import BlogCard from "../components/BlogCard/BlogCard";
import RichTextEditor from "../components/RichTextEditor/RichTextEditor";
import { useApp } from "../context/AppContext";
import { useAuth } from "../components/Auth/AuthProvider";

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

const MyBlogs: React.FC = () => {
  const { userBlogs, addBlog, updateBlog, deleteBlog, refreshUserContent } =
    useApp();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    snippet: "",
    image: "",
    tags: "",
    author: "",
    featured: false,
  });

  // Restore draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("myBlogDraft");
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);
  // Save draft on change
  useEffect(() => {
    localStorage.setItem("myBlogDraft", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    refreshUserContent();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        author: profile.full_name || profile.email,
      }));
    }
  }, [profile]);

  const filteredBlogs = userBlogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.snippet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const blogData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        author: profile?.full_name || profile?.email || formData.author,
      };

      if (editingBlog) {
        await updateBlog(editingBlog.id, blogData);
      } else {
        await addBlog(blogData);
      }

      // Clear draft on successful submit
      localStorage.removeItem("myBlogDraft");
      setFormData({
        title: "",
        content: "",
        snippet: "",
        image: "",
        tags: "",
        author: profile?.full_name || profile?.email || "",
        featured: false,
      });
      setShowModal(false);
      setEditingBlog(null);
      await refreshUserContent();
    } catch (error) {
      console.error("Error saving blog:", error);
      alert("Error saving blog. Please try again.");
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      snippet: blog.snippet,
      image: blog.image,
      tags: blog.tags.join(", "),
      author: blog.author,
      featured: blog.featured,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteBlog(id);
        await refreshUserContent();
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert("Error deleting blog. Please try again.");
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Only administrators can manage blogs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              My Blogs
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage your blog posts and share your robotics insights with the
            community
          </p>
        </motion.div>

        {/* Search and Add */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {profile?.role === "admin" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Blog</span>
            </motion.button>
          )}
        </div>

        {/* Blog Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <BlogCard
                  blog={blog}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No blogs yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start sharing your robotics knowledge by creating your first blog
              post.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Blog</span>
            </motion.button>
          </motion.div>
        )}

        {/* Modal */}
        {profile?.role === "admin" && showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingBlog ? "Edit Blog Post" : "Add New Blog Post"}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingBlog(null);
                    setFormData({
                      title: "",
                      content: "",
                      snippet: "",
                      image: "",
                      tags: "",
                      author: profile?.full_name || profile?.email || "",
                      featured: false,
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Snippet
                  </label>
                  <input
                    type="text"
                    value={formData.snippet}
                    onChange={(e) =>
                      setFormData({ ...formData, snippet: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brief description of the blog post"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) =>
                      setFormData({ ...formData, content: value })
                    }
                    placeholder="Write your blog content here..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Programming, AI, Robotics"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor="featured"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Featured Post
                  </label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {editingBlog ? "Update" : "Create"} Blog Post
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBlog(null);
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBlogs;
