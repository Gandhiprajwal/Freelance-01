// SEO utility functions for content analysis and keyword extraction
import { siteConfig, urlHelpers } from '../config/siteConfig';

/**
 * Extract keywords from blog content using various methods
 */
export const extractKeywordsFromContent = (content: string, title: string, tags: string[] = []): string[] => {
  const keywords = new Set<string>();
  
  // Add existing tags
  tags.forEach(tag => keywords.add(tag.toLowerCase()));
  
  // Extract from title
  const titleWords = title.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 5);
  titleWords.forEach(word => keywords.add(word));
  
  // Extract from content (remove HTML tags first)
  const cleanContent = content.replace(/<[^>]*>/g, ' ').toLowerCase();
  
  // Common robotics and tech keywords
  const techKeywords = [
    'robotics', 'robot', 'automation', 'ai', 'artificial intelligence', 'machine learning',
    'programming', 'python', 'c++', 'javascript', 'arduino', 'raspberry pi', 'sensors',
    'actuators', 'computer vision', 'deep learning', 'neural networks', 'iot', 'internet of things',
    'drones', 'autonomous', 'navigation', 'pathfinding', 'algorithms', 'data structures',
    'electronics', 'circuits', 'motors', 'servos', 'microcontrollers', 'embedded systems',
    'ros', 'robot operating system', 'simulation', '3d printing', 'cad', 'mechanical design',
    'control systems', 'pid', 'feedback', 'sensors', 'vision', 'lidar', 'gps', 'bluetooth',
    'wifi', 'wireless', 'battery', 'power', 'energy', 'efficiency', 'optimization'
  ];
  
  // Add tech keywords that appear in content
  techKeywords.forEach(keyword => {
    if (cleanContent.includes(keyword)) {
      keywords.add(keyword);
    }
  });
  
  // Extract common words (excluding stop words)
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
  ]);
  
  const words = cleanContent
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !stopWords.has(word) && 
      /^[a-zA-Z]+$/.test(word)
    )
    .slice(0, 10);
  
  words.forEach(word => keywords.add(word));
  
  return Array.from(keywords).slice(0, 15); // Limit to 15 keywords
};

/**
 * Generate SEO-friendly description from content
 */
export const generateSEODescription = (content: string, snippet: string): string => {
  // Use snippet if it's good enough
  if (snippet && snippet.length >= 120 && snippet.length <= 160) {
    return snippet;
  }
  
  // Extract from content
  const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let description = '';
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length >= 50 && trimmed.length <= 160) {
      description = trimmed;
      break;
    }
  }
  
  // If no good sentence found, create one from first few words
  if (!description) {
    const words = cleanContent.split(/\s+/).slice(0, 25);
    description = words.join(' ') + '...';
  }
  
  return description.length > 160 ? description.substring(0, 157) + '...' : description;
};

/**
 * Generate SEO-friendly title
 */
export const generateSEOTitle = (title: string): string => {
  // Remove special characters and limit length
  const cleanTitle = title
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleanTitle.length > 60 ? cleanTitle.substring(0, 57) + '...' : cleanTitle;
};

/**
 * Extract main topics from content
 */
export const extractTopics = (content: string): string[] => {
  const topics = new Set<string>();
  
  // Common robotics topics
  const topicPatterns = [
    { pattern: /robotics?/gi, topic: 'Robotics' },
    { pattern: /artificial intelligence|ai/gi, topic: 'Artificial Intelligence' },
    { pattern: /machine learning/gi, topic: 'Machine Learning' },
    { pattern: /programming/gi, topic: 'Programming' },
    { pattern: /automation/gi, topic: 'Automation' },
    { pattern: /sensors?/gi, topic: 'Sensors' },
    { pattern: /actuators?/gi, topic: 'Actuators' },
    { pattern: /computer vision/gi, topic: 'Computer Vision' },
    { pattern: /deep learning/gi, topic: 'Deep Learning' },
    { pattern: /neural networks?/gi, topic: 'Neural Networks' },
    { pattern: /iot|internet of things/gi, topic: 'IoT' },
    { pattern: /drones?/gi, topic: 'Drones' },
    { pattern: /autonomous/gi, topic: 'Autonomous Systems' },
    { pattern: /navigation/gi, topic: 'Navigation' },
    { pattern: /algorithms?/gi, topic: 'Algorithms' },
    { pattern: /electronics/gi, topic: 'Electronics' },
    { pattern: /circuits?/gi, topic: 'Circuits' },
    { pattern: /motors?/gi, topic: 'Motors' },
    { pattern: /microcontrollers?/gi, topic: 'Microcontrollers' },
    { pattern: /embedded systems?/gi, topic: 'Embedded Systems' },
    { pattern: /ros|robot operating system/gi, topic: 'ROS' },
    { pattern: /simulation/gi, topic: 'Simulation' },
    { pattern: /3d printing/gi, topic: '3D Printing' },
    { pattern: /cad/gi, topic: 'CAD' },
    { pattern: /mechanical design/gi, topic: 'Mechanical Design' },
    { pattern: /control systems?/gi, topic: 'Control Systems' },
    { pattern: /pid/gi, topic: 'PID Control' },
    { pattern: /feedback/gi, topic: 'Feedback Systems' },
    { pattern: /lidar/gi, topic: 'LiDAR' },
    { pattern: /gps/gi, topic: 'GPS' },
    { pattern: /bluetooth/gi, topic: 'Bluetooth' },
    { pattern: /wifi/gi, topic: 'WiFi' },
    { pattern: /wireless/gi, topic: 'Wireless Communication' },
    { pattern: /battery/gi, topic: 'Battery Technology' },
    { pattern: /power/gi, topic: 'Power Systems' },
    { pattern: /energy/gi, topic: 'Energy Management' },
    { pattern: /efficiency/gi, topic: 'Efficiency' },
    { pattern: /optimization/gi, topic: 'Optimization' }
  ];
  
  const cleanContent = content.toLowerCase();
  
  topicPatterns.forEach(({ pattern, topic }) => {
    if (pattern.test(cleanContent)) {
      topics.add(topic);
    }
  });
  
  return Array.from(topics).slice(0, 8); // Limit to 8 topics
};

/**
 * Generate structured data for blog posts
 */
export const generateBlogStructuredData = (blog: {
  id: string;
  title: string;
  content: string;
  snippet: string;
  image: string;
  tags: string[];
  author: string;
  created_at: string;
  updated_at?: string;
  url: string;
}) => {
  const keywords = extractKeywordsFromContent(blog.content, blog.title, blog.tags);
  const topics = extractTopics(blog.content);
  
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.snippet,
    "image": urlHelpers.fullUrl(blog.image),
    "author": {
      "@type": "Person",
      "name": blog.author
    },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.name,
      "logo": {
        "@type": "ImageObject",
        "url": urlHelpers.fullUrl(siteConfig.branding.logo.primary)
      }
    },
    "datePublished": blog.created_at,
    "dateModified": blog.updated_at || blog.created_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": blog.url
    },
    "keywords": keywords.join(', '),
    "articleSection": topics.join(', '),
    "wordCount": blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
    "inLanguage": siteConfig.seo.language,
    "isAccessibleForFree": true
  };
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
}; 