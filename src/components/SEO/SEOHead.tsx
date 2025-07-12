import React from 'react';
import { Helmet } from 'react-helmet-async';
import { siteConfig, urlHelpers } from '../../config/siteConfig';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'course';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  structuredData?: object;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

const SEOHead: React.FC<SEOProps> = ({
  title = siteConfig.fullName,
  description = siteConfig.description,
  keywords = siteConfig.seo.defaultKeywords,
  image = siteConfig.seo.defaultImage,
  url = window.location.href,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  tags = [],
  structuredData,
  canonicalUrl,
  noIndex = false,
  noFollow = false
}) => {
  const fullTitle = title === siteConfig.fullName ? title : `${title} | ${siteConfig.name}`;
  const keywordsString = [...keywords, ...tags].join(', ');
  
  // Default structured data for the website
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.name,
    "description": description,
    "url": siteConfig.baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteConfig.baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  // Article structured data for blog posts
  const articleStructuredData = type === 'article' ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": urlHelpers.fullUrl(image),
    "author": {
      "@type": "Person",
      "name": author || siteConfig.seo.defaultAuthor
    },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.name,
      "logo": {
        "@type": "ImageObject",
        "url": urlHelpers.fullUrl(siteConfig.branding.logo.primary)
      }
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime || publishedTime,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "keywords": keywordsString
  } : null;

  // Course structured data
  const courseStructuredData = type === 'course' ? {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": title,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": siteConfig.name,
      "sameAs": siteConfig.baseUrl
    },
    "courseMode": "online",
    "educationalLevel": "beginner to advanced",
    "inLanguage": siteConfig.seo.language
  } : null;

  const finalStructuredData = structuredData || articleStructuredData || courseStructuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content={author || siteConfig.seo.defaultAuthor} />
      
      {/* Robots Meta */}
      {noIndex && <meta name="robots" content="noindex" />}
      {noFollow && <meta name="robots" content="nofollow" />}
      {!noIndex && !noFollow && <meta name="robots" content="index, follow" />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={urlHelpers.fullUrl(image)} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content={siteConfig.seo.locale} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={urlHelpers.fullUrl(image)} />
      <meta name="twitter:site" content="@robostaan" />
      <meta name="twitter:creator" content="@robostaan" />
      
      {/* Additional Meta Tags for Articles */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && tags.length > 0 && (
        tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))
      )}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
      
      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content={siteConfig.branding.theme.primary} />
      <meta name="msapplication-TileColor" content={siteConfig.branding.theme.tileColor} />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Favicon and App Icons */}
      <link rel="icon" type="image/svg+xml" href={siteConfig.branding.logo.favicon} />
      <link rel="apple-touch-icon" sizes="180x180" href={siteConfig.branding.logo.appleTouchIcon} />
      <link rel="icon" type="image/png" sizes="32x32" href={siteConfig.branding.logo.favicon32} />
      <link rel="icon" type="image/png" sizes="16x16" href={siteConfig.branding.logo.favicon16} />
      <link rel="manifest" href="/site.webmanifest" />
    </Helmet>
  );
};

export default SEOHead; 