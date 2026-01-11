/**
 * Sitemap Generator for SEO
 * Generates XML sitemap for search engines
 */

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate XML sitemap content
 */
export function generateXMLSitemap(urls: SitemapUrl[]): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';

  const urlEntries = urls
    .map(url => {
      let entry = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n`;

      if (url.lastmod) {
        entry += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }

      if (url.changefreq) {
        entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
      }

      if (url.priority !== undefined) {
        entry += `    <priority>${url.priority}</priority>\n`;
      }

      entry += `  </url>\n`;
      return entry;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, char => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return char;
    }
  });
}

/**
 * Generate default sitemap URLs for the campaign platform
 */
export function generateDefaultSitemapUrls(campaignIds: string[] = []): SitemapUrl[] {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
  const today = new Date().toISOString().split('T')[0];

  const urls: SitemapUrl[] = [
    {
      loc: `${baseUrl}/`,
      lastmod: today,
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      loc: `${baseUrl}/campaigns`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/gallery`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.7,
    },
  ];

  // Add campaign detail pages
  campaignIds.forEach(campaignId => {
    urls.push({
      loc: `${baseUrl}/campaign/${campaignId}`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.8,
    });
  });

  return urls;
}

/**
 * Download sitemap as XML file
 */
export function downloadSitemap(urls: SitemapUrl[], filename = 'sitemap.xml'): void {
  const xmlContent = generateXMLSitemap(urls);
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
