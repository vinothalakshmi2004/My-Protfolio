/**
 * Seo — writes <head> tags from settings.seo via react-helmet-async:
 * title, description, keywords, Open Graph + Twitter card, favicon and theme colour.
 * Everything is editable in /admin/seo (no redeploy needed).
 */
import { Helmet } from 'react-helmet-async';
import { fileUrl } from '../lib/apiClient';

export const Seo = ({ settings }) => {
  const { fullName = '', headline = '', summary = '', seo = {}, favicon = {}, theme = {} } = settings || {};

  const title = seo.title || [fullName, headline].filter(Boolean).join(' | ') || 'Portfolio';
  const description = seo.description || summary || headline || '';
  const ogImage = seo.ogImage?.url ? fileUrl(seo.ogImage.url) : '';
  const faviconUrl = favicon?.url ? fileUrl(favicon.url) : '/favicon.svg';
  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : '/';

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}
      {fullName && <meta name="author" content={fullName} />}
      {theme.primaryColor && <meta name="theme-color" content={theme.primaryColor} />}

      {/* Open Graph (LinkedIn, Facebook, WhatsApp previews) */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={pageUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter / X card */}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Favicon uploaded in the admin (falls back to the bundled /favicon.svg) */}
      <link rel="icon" href={faviconUrl} {...(!favicon?.url && { type: 'image/svg+xml' })} />
      <link rel="apple-touch-icon" href={faviconUrl} />
    </Helmet>
  );
};

export default Seo;
