import { useEffect } from 'react';
import { siteConfig } from '../../config/siteConfig';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

const GoogleAnalytics = () => {
  useEffect(() => {
    const gaId = siteConfig.services.analytics.googleAnalytics;
    if (!gaId) return;
    // Inject GA script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    const gtag = (...args: any[]) => { window.dataLayer.push(args); };
    gtag('js', new Date());
    gtag('config', gaId);
  }, []);
  return null;
};

export default GoogleAnalytics; 