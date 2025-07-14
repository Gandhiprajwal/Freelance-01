import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SEOHead from '../components/SEO/SEOHead';
import { siteConfig, urlHelpers } from '../config/siteConfig';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects } = useApp();
  const project = projects.find(p => p.id === id || p.slug === id);

  if (!project) return null;

  // Generate structured data for this project
  const projectStructuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "headline": project.title,
    "description": project.description,
    "image": urlHelpers.fullUrl(project.image),
    "author": {
      "@type": "Person",
      "name": project.author || 'Robostaan Team'
    },
    "datePublished": project.created_at,
    "keywords": Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies,
    "url": urlHelpers.fullUrl(`/projects/${project.slug || project.id}`)
  };

  return (
    <>
      <SEOHead
        title={`${project.title} | Projects | ${siteConfig.name}`}
        description={project.description}
        keywords={[...(Array.isArray(project.technologies) ? project.technologies : []), 'robotics', 'AI', 'automation', 'open source', 'project']}
        image={project.image}
        url={urlHelpers.fullUrl(`/projects/${project.slug || project.id}`)}
        type="article"
        structuredData={projectStructuredData}
        canonicalUrl={urlHelpers.fullUrl(`/projects/${project.slug || project.id}`)}
      />
      {/* ... existing code ... */}
    </>
  );
};

export default ProjectDetail; 