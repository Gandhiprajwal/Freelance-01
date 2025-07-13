// Sitemap generator utility for SEO
import { siteConfig, urlHelpers } from '../config/siteConfig';

export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapData {
  staticPages: SitemapUrl[];
  blogs: SitemapUrl[];
  courses: SitemapUrl[];
}

/**
 * Generate sitemap XML content
 */
export const generateSitemapXML = (sitemapData: SitemapData): string => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static pages
  sitemapData.staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${urlHelpers.fullUrl(page.url)}</loc>\n`;
    if (page.lastmod) {
      xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    }
    if (page.changefreq) {
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    }
    if (page.priority) {
      xml += `    <priority>${page.priority}</priority>\n`;
    }
    xml += '  </url>\n';
  });
  
  // Add blog pages
  sitemapData.blogs.forEach(blog => {
    xml += '  <url>\n';
    xml += `    <loc>${urlHelpers.blogUrl(blog.url)}</loc>\n`;
    if (blog.lastmod) {
      xml += `    <lastmod>${blog.lastmod}</lastmod>\n`;
    }
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });
  
  // Add course pages
  sitemapData.courses.forEach(course => {
    xml += '  <url>\n';
    xml += `    <loc>${urlHelpers.courseUrl(course.url)}</loc>\n`;
    if (course.lastmod) {
      xml += `    <lastmod>${course.lastmod}</lastmod>\n`;
    }
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
};

/**
 * Generate robots.txt content
 */
export const generateRobotsTxt = (): string => {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${urlHelpers.fullUrl('/sitemap.xml')}

# Disallow admin and private pages
Disallow: /admin
Disallow: /my-blogs
Disallow: /my-courses
Disallow: /login
Disallow: /signup

# Allow important pages
Allow: /blogs
Allow: /courses
Allow: /about
Allow: /contact

# Crawl delay (optional)
Crawl-delay: 1`;
};

/**
 * Generate default sitemap data
 */
export const getDefaultSitemapData = (): SitemapData => {
  const now = new Date().toISOString().split('T')[0];
  
  return {
    staticPages: [
      {
        url: '/',
        lastmod: now,
        changefreq: 'daily' as const,
        priority: 1.0
      },
      {
        url: '/blogs',
        lastmod: now,
        changefreq: 'daily' as const,
        priority: 0.9
      },
      {
        url: '/courses',
        lastmod: now,
        changefreq: 'weekly' as const,
        priority: 0.9
      },
      {
        url: '/about',
        lastmod: now,
        changefreq: 'monthly' as const,
        priority: 0.6
      },
      {
        url: '/contact',
        lastmod: now,
        changefreq: 'monthly' as const,
        priority: 0.5
      }
    ],
    blogs: [],
    courses: []
  };
};

/**
 * Update sitemap with dynamic content
 */
export const updateSitemapWithContent = async (
  supabase: any,
  sitemapData: SitemapData
): Promise<SitemapData> => {
  try {
    // Fetch blogs
    const { data: blogs } = await supabase
      .from('blogs')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false });
    
    if (blogs) {
      sitemapData.blogs = blogs.map((blog: { slug: string; updated_at?: string }) => ({
        url: blog.slug,
        lastmod: blog.updated_at ? new Date(blog.updated_at).toISOString().split('T')[0] : undefined,
        changefreq: 'weekly' as const,
        priority: 0.8
      }));
    }
    
    // Fetch courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, updated_at')
      .order('updated_at', { ascending: false });
    
    if (courses) {
      sitemapData.courses = courses.map((course: { id: string; updated_at?: string }) => ({
        url: course.id,
        lastmod: course.updated_at ? new Date(course.updated_at).toISOString().split('T')[0] : undefined,
        changefreq: 'monthly' as const,
        priority: 0.7
      }));
    }
    
    return sitemapData;
  } catch (error) {
    console.error('Error updating sitemap with content:', error);
    return sitemapData;
  }
};

/**
 * Generate and save sitemap files
 */
export const generateSitemapFiles = async (supabase: any): Promise<void> => {
  try {
    // Get sitemap data
    let sitemapData = getDefaultSitemapData();
    sitemapData = await updateSitemapWithContent(supabase, sitemapData);
    
    // Generate XML sitemap
    const sitemapXML = generateSitemapXML(sitemapData);
    
    // Generate robots.txt
    const robotsTxt = generateRobotsTxt();
    
    // In a real application, you would save these files to your server
    // For now, we'll just log them
    console.log('Generated sitemap.xml:', sitemapXML);
    console.log('Generated robots.txt:', robotsTxt);
    
    // You could also save these to Supabase Storage or your hosting platform
    // await supabase.storage.from('public').upload('sitemap.xml', sitemapXML);
    // await supabase.storage.from('public').upload('robots.txt', robotsTxt);
    
  } catch (error) {
    console.error('Error generating sitemap files:', error);
  }
}; 