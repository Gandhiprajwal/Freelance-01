import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, BookOpen } from 'lucide-react';
import ProjectCard from '../components/ProjectCard/ProjectCard';
import ProjectModal from '../components/ProjectCard/ProjectModal';
import { useAuth } from '../components/Auth/AuthProvider';
import { useApp } from '../context/AppContext';
import { getSupabase } from '../lib/supabaseConnection';

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  category: string;
  technologies: string[];
  demoUrl?: string;
  sourceFiles: any[];
  featured: boolean;
  downloads: number;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

const MyProjects: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { projects, refreshProjects, loading, setProjects, addProject, updateProject, deleteProject } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Move fetchProjects above useEffect hooks
  const fetchProjects = async (append = false) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000));
    try {
      const supabase = await getSupabase();
      const fetchPromise = supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      const { data, error } = await Promise.race([fetchPromise, timeout]) as any;
      if (error) {
        setError('Failed to load projects.');
        setProjects([]);
      } else if (data) {
        setProjects((prev) => append ? [...prev, ...(data || [])] : (data || []).map((p: any) => ({
          ...p,
          demoUrl: p.demo_url,
          sourceFiles: p.source_files || [],
        })));
      }
    } catch (err) {
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !loading &&
        projects.length > 0
      ) {
        fetchProjects(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, projects]);

  useEffect(() => {
    if (isAdmin) {
      refreshProjects();
    } else {
      fetchProjects();
    }
    // eslint-disable-next-line
  }, [user]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Only administrators can manage projects.
          </p>
        </div>
      </div>
    );
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Add/Edit/Delete logic (owner only)
  const handleAddProject = async (projectData: Partial<Project>) => {
    if (!isAdmin || !user) return;
    setIsLoading(true);
    try {
      await addProject({
        ...projectData,
        owner_id: user.id,
        downloads: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setShowModal(false);
      setSelectedProject(null);
      setEditingProject(null);
      await refreshProjects();
    } catch (error) {
      setError('Failed to add project.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProject = async (projectData: Partial<Project>) => {
    if (!editingProject || !user) return;
    if (editingProject.owner_id !== user.id) return;
    setIsLoading(true);
    try {
      await updateProject(editingProject.id, {
        ...projectData,
        updated_at: new Date().toISOString(),
      });
      setShowModal(false);
      setSelectedProject(null);
      setEditingProject(null);
      await refreshProjects();
    } catch (error) {
      setError('Failed to update project.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project || !user) return;
    if (project.owner_id !== user.id) return;
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setIsLoading(true);
    try {
      await deleteProject(id);
      await refreshProjects();
    } catch (error) {
      setError('Failed to delete project.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || project.category.toLowerCase().includes(selectedCategory.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-6 px-2 sm:py-8 sm:px-4">
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
            <BookOpen className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              My Projects
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage your own projects and share your work with the community.
          </p>
        </motion.div>

        {/* Search and Add */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 sm:mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search my projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Category..."
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
            />
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingProject(null);
                  setSelectedProject({
                    id: '',
                    title: '',
                    tagline: '',
                    description: '',
                    image: '',
                    category: '',
                    technologies: [],
                    demoUrl: '',
                    sourceFiles: [],
                    featured: false,
                    downloads: 0,
                    created_at: '',
                    updated_at: '',
                    owner_id: user?.id || ''
                  });
                  setShowModal(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="overflow-hidden rounded-lg shadow-sm bg-white dark:bg-gray-800"
            >
              <ProjectCard
                project={project}
                onDownload={undefined}
                onView={() => {
                  setSelectedProject(project);
                  setShowModal(true);
                }}
                onEdit={user && project.owner_id === user.id ? () => {
                  setEditingProject(project);
                  setShowModal(true);
                } : undefined}
                onDelete={user && project.owner_id === user.id ? handleDeleteProject : undefined}
              />
            </motion.div>
          ))}
        </div>

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search criteria or add a new project.
            </p>
          </div>
        )}

        {/* Project Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2 sm:px-0">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-8">
              <ProjectModal
                project={selectedProject}
                editingProject={editingProject}
                onClose={() => {
                  setShowModal(false);
                  setSelectedProject(null);
                  setEditingProject(null);
                }}
                onSave={editingProject ? handleEditProject : handleAddProject}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjects; 