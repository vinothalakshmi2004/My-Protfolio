/**
 * SafeImage — the one image component used across the landing page.
 *
 *  - Takes a STORED url ("/api/files/<id>") and resolves it with fileUrl()
 *  - Native lazy loading + async decoding + explicit width/height (no layout shift)
 *  - Optional aspect-ratio wrapper via `aspect` (e.g. "aspect-video", "aspect-square")
 *  - When the url is empty OR the image fails to load, renders a neat placeholder:
 *    initials of `fallbackText` (if given) or a generic image icon.
 */
import { useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { fileUrl } from '../lib/apiClient';
import { getInitials } from '../utils/format';

export const SafeImage = ({
  src,
  alt = '',
  width = 800,
  height = 600,
  aspect = '', // Tailwind aspect class; when empty the wrapper's own size classes decide the box
  className = '', // classes for the wrapper (size, rounding, borders...)
  imgClassName = '',
  fallbackText = '', // e.g. a name/title -> placeholder shows its initials
  initialsClassName = 'text-2xl sm:text-3xl', // size of the placeholder initials
  fit = 'cover', // 'cover' | 'contain'
  eager = false, // true for above-the-fold images (hero photo)
}) => {
  const url = fileUrl(src);
  // Remember WHICH url failed, so switching to another src (gallery) retries automatically
  const [failedUrl, setFailedUrl] = useState(null);
  const showPlaceholder = !url || failedUrl === url;
  const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <div className={`relative max-w-full overflow-hidden ${aspect} ${className}`}>
      {showPlaceholder ? (
        <div
          role="img"
          aria-label={alt || 'Image unavailable'}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand/15 via-slate-100 to-accent/15 dark:via-slate-800/80"
        >
          {fallbackText ? (
            <span className={`text-gradient-brand select-none font-black tracking-tight ${initialsClassName}`}>
              {getInitials(fallbackText)}
            </span>
          ) : (
            <FiImage className="h-8 w-8 text-slate-400 dark:text-slate-500" aria-hidden="true" />
          )}
        </div>
      ) : (
        <img
          src={url}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailedUrl(url)}
          className={`absolute inset-0 h-full w-full max-w-full ${fitClass} ${imgClassName}`}
        />
      )}
    </div>
  );
};

export default SafeImage;
