import React from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Edit, Trash2, ExternalLink, Code, Calendar, TrendingDown } from 'lucide-react';
import { Project } from '../../pages/Projects';

interface ProjectCardProps {
  project: Project;
  onDownload?: (project: Project) => void;
  onView?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDownload,
  onView,
  onEdit,
  onDelete
}) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      'Web Development': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'Mobile App': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'IoT': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      'AI/ML': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      'Robotics': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
      'Game Development': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
  };

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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
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
        {/* Category Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(project.category)}`}>
          {project.category}
        </div>
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
      <div className="p-6">
        {/* Title and Tagline */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {project.title}
        </h3>
        <p className="text-orange-500 font-medium mb-3">
          {project.tagline}
        </p>
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {project.description}
        </p>
        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
              +{project.technologies.length - 3} more
            </span>
          )}
        </div>
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <TrendingDown className="w-4 h-4" />
            <span>{project.downloads?.toLocaleString?.() ?? 0} downloads</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(project.created_at)}</span>
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
          {onView && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onView(project)}
              className="flex items-center justify-center space-x-2 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
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