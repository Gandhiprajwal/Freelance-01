import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, X, ToggleLeft, ToggleRight } from 'lucide-react';
import CourseCard from '../components/CourseCard/CourseCard';
import RichTextEditor from '../components/RichTextEditor/RichTextEditor';
import { useApp } from '../context/AppContext';
import { Course } from '../lib/supabaseConnection';

const Courses: React.FC = () => {
  const { courses, isAdmin, loading, addCourse, updateCourse, deleteCourse, refreshData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    image: '',
    duration: '',
    category: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    video_url: '',
    materials: '',
    featured: false,
    coming_soon: false
  });

  const categories = ['Beginner', 'Intermediate', 'Advanced'];

  // Refresh data when component mounts or when navigating to this page
  useEffect(() => {
    refreshData();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Separate coming soon and available courses
  const comingSoonCourses = filteredCourses.filter(course => 
    course.title.toLowerCase().includes('coming soon') || 
    course.description.toLowerCase().includes('coming soon')
  );
  
  const availableCourses = filteredCourses.filter(course => 
    !course.title.toLowerCase().includes('coming soon') && 
    !course.description.toLowerCase().includes('coming soon')
  );

  // Show coming soon placeholder if no courses exist
  const showComingSoonPlaceholder = courses.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const courseData = {
        ...formData,
        materials: formData.materials.split(',').map(material => material.trim()).filter(material => material),
        // Add "Coming Soon" to title if marked as coming soon
        title: formData.coming_soon && !formData.title.toLowerCase().includes('coming soon') 
          ? `${formData.title} (Coming Soon)` 
          : formData.title
      };

      if (editingCourse) {
        await updateCourse(editingCourse.id, courseData);
      } else {
        await addCourse(courseData);
      }

      setFormData({
        title: '',
        description: '',
        content: '',
        image: '',
        duration: '',
        category: 'Beginner',
        video_url: '',
        materials: '',
        featured: false,
        coming_soon: false
      });
      setShowModal(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course. Please try again.');
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    const isComingSoon = course.title.toLowerCase().includes('coming soon');
    setFormData({
      title: isComingSoon ? course.title.replace(/\s*\(coming soon\)/i, '') : course.title,
      description: course.description,
      content: course.content,
      image: course.image,
      duration: course.duration,
      category: course.category,
      video_url: course.video_url || '',
      materials: course.materials?.join(', ') || '',
      featured: course.featured,
      coming_soon: isComingSoon
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id);
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Error deleting course. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Robotics Courses
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Master robotics with our comprehensive courses designed for all skill levels
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Levels</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </motion.button>
          )}
        </div>

        {/* Coming Soon Placeholder */}
        {(showComingSoonPlaceholder || availableCourses.length === 0) && (
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-12 text-center text-white"
            >
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Exciting Courses Coming Soon!</h2>
                <p className="text-lg mb-6 opacity-90">
                  We're working hard to bring you amazing robotics courses. Our expert instructors are preparing comprehensive content that will take your robotics skills to the next level.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm opacity-75">
                  <span>🤖 Advanced Programming</span>
                  <span>•</span>
                  <span>🔧 Hardware Integration</span>
                  <span>•</span>
                  <span>🧠 AI & Machine Learning</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Available Courses */}
        {availableCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Available Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CourseCard
                    course={course}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Coming Soon Courses */}
        {comingSoonCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Coming Soon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {comingSoonCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CourseCard
                    course={course}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!showComingSoonPlaceholder && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No courses found matching your criteria.
            </p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingCourse(null);
                    setFormData({
                      title: '',
                      description: '',
                      content: '',
                      image: '',
                      duration: '',
                      category: 'Beginner',
                      video_url: '',
                      materials: '',
                      featured: false,
                      coming_soon: false
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
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 8 weeks"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder="Write detailed course content here..."
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
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Video URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Materials (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.materials}
                      onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Course Handbook, Arduino Kit"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">
                      Featured Course
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Coming Soon
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, coming_soon: !formData.coming_soon })}
                      className="focus:outline-none"
                    >
                      {formData.coming_soon ? (
                        <ToggleRight className="w-6 h-6 text-purple-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {editingCourse ? 'Update' : 'Create'} Course
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingCourse(null);
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

export default Courses;