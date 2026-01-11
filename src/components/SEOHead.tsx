import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'campaign';
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

export default function SEOHead({
  title,
  description,
  image,
  url,
  type = 'website',
  author,
  publishedDate,
  modifiedDate,
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = `${title} | Build Bright Fund`;

    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const updatePropertyTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    updateMetaTag('theme-color', '#1a1a1a');

    // Open Graph tags
    updatePropertyTag('og:title', title);
    updatePropertyTag('og:description', description);
    updatePropertyTag('og:type', type);
    if (image) updatePropertyTag('og:image', image);
    if (url) updatePropertyTag('og:url', url);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    if (image) updateMetaTag('twitter:image', image);

    // Article specific tags
    if (type === 'article') {
      if (author) updatePropertyTag('article:author', author);
      if (publishedDate) updatePropertyTag('article:published_time', publishedDate);
      if (modifiedDate) updatePropertyTag('article:modified_time', modifiedDate);
    }

    // Canonical URL
    if (url) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }

    // JSON-LD Schema
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (schemaScript) {
      schemaScript.remove();
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': type === 'campaign' ? 'Event' : type === 'article' ? 'Article' : 'Organization',
      name: title,
      description: description,
      ...(image && { image: image }),
      ...(url && { url: url }),
      ...(author && { author: { '@type': 'Person', name: author } }),
      ...(publishedDate && { datePublished: publishedDate }),
      ...(modifiedDate && { dateModified: modifiedDate }),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      // Cleanup is handled by React
    };
  }, [title, description, image, url, type, author, publishedDate, modifiedDate]);

  return null;
}
