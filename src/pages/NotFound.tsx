import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEO/SEOHead';
import { siteConfig, urlHelpers } from '../config/siteConfig';

const NotFound: React.FC = () => {
  return (
    <>
      <SEOHead
        title={`404 Not Found | ${siteConfig.name}`}
        description="The page you are looking for does not exist."
        url={urlHelpers.fullUrl('/404')}
        image={siteConfig.branding.logo.primary}
        type="website"
        canonicalUrl={urlHelpers.fullUrl('/404')}
      />
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
        <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-md">
          Sorry, the page you are looking for does not exist or has been moved.<br />
          Please check the URL or return to the homepage.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </>
  );
};

export default NotFound; 