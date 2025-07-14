import React from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Edit, Trash2, ExternalLink, Code, Calendar, TrendingDown } from 'lucide-react';
import { Project } from '../../pages/Projects';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
  onDownload?: (project: Project) => void;
  onView?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
}

// Replace getCategoryColor with a hash-based color picker
const categoryColors = [
  'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
  'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200',
  'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
  'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
];

function hashStringToColorIndex(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % categoryColors.length;
}

const getCategoryColor = (category: string) => {
  return categoryColors[hashStringToColorIndex(category)];
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDownload,
  onView,
  onEdit,
  onDelete
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative h-full flex flex-col"
    >
      {/* Project Image */}
      <div className="relative">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-48 object-cover"
        />
        {/* Featured Badge */}
        {project.featured && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </div>
        )}
        {/* Admin Controls */}
        {(onEdit || onDelete) && (
          <div className="absolute bottom-4 right-4 flex space-x-2">
            {onEdit && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(project)}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(project.id)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        )}
      </div>
      {/* Project Content */}
      <div className="p-6 flex flex-col h-full">
        {onView ? (
          <h3
            className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 h-8 overflow-hidden hover:text-orange-500 transition-colors cursor-pointer"
            onClick={() => onView(project)}
          >
            {project.title}
          </h3>
        ) : (
          <Link to={`/projects/${project.id}`}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 h-8 overflow-hidden hover:text-orange-500 transition-colors cursor-pointer">{project.title}</h3>
          </Link>
        )}
        <p className="text-orange-500 font-medium mb-2 line-clamp-1 h-6 overflow-hidden">{project.tagline}</p>
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 h-10 overflow-hidden">{project.description}</p>
        {/* Technologies */}
        <div className="flex-1"></div>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-4 h-4" />
            <span>{project.downloads?.toLocaleString?.() ?? 0} downloads</span>
          </div>
          <div className="flex items-center space-x-1 text-orange-500">
            <span className="font-medium">{project.technologies?.length || 0} techs</span>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex space-x-2">
          {onDownload && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDownload(project)}
              className="flex-1 flex items-center justify-center space-x-2 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </motion.button>
          )}
          {project.demoUrl && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(project.demoUrl, '_blank')}
              className="flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard; 