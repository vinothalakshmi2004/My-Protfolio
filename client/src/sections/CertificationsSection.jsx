/**
 * CertificationsSection — certificate cards. If the uploaded certificate is an
 * image it is shown as a preview; if it is a PDF a "View PDF" button opens it in
 * a new tab. A credential URL adds a "Verify credential" link.
 */
import { motion } from 'framer-motion';
import { FiCalendar, FiExternalLink, FiFileText, FiShield } from 'react-icons/fi';
import Section from '../components/Section';
import SafeImage from '../components/SafeImage';
import { fileUrl } from '../lib/apiClient';
import { formatMonth } from '../utils/format';

const linkClass =
  'inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-colors';

export const CertificationsSection = ({ certifications = [], content, muted }) => (
  <Section id="certifications" content={content} muted={muted}>
    {/* Mobile: 1 col, md: 2 cols, lg: 3 cols */}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {certifications.map((cert, idx) => {
        const type = cert.file?.contentType || '';
        const hasFile = Boolean(cert.file?.url);
        const isImage = hasFile && type.startsWith('image/');
        const isPdf = hasFile && type === 'application/pdf';
        const issued = formatMonth(cert.issueDate);

        return (
          <motion.article
            key={cert._id || `${cert.title}-${idx}`}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: (idx % 3) * 0.06 }}
            className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900"
          >
            {isImage && (
              <a href={fileUrl(cert.file.url)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${cert.title} certificate`}>
                <SafeImage
                  src={cert.file.url}
                  alt={`${cert.title} certificate`}
                  width={800}
                  height={600}
                  aspect="aspect-[4/3]"
                  fit="contain"
                  fallbackText={cert.title}
                  className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50"
                />
              </a>
            )}

            <div className="flex flex-1 flex-col p-5 sm:p-6">
              {!isImage && (
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand dark:text-brand-light">
                  {isPdf ? <FiFileText className="h-5 w-5" aria-hidden="true" /> : <FiShield className="h-5 w-5" aria-hidden="true" />}
                </div>
              )}
              <h3 className="mb-1 break-words font-bold leading-snug text-slate-800 dark:text-slate-100">{cert.title}</h3>
              <p className="break-words text-sm font-semibold text-brand dark:text-brand-light">{cert.issuer}</p>
              {issued && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {issued}
                </p>
              )}

              {(isPdf || cert.credentialUrl) && (
                // Buttons wrap under each other on very narrow cards
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {isPdf && (
                    <a
                      href={fileUrl(cert.file.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${linkClass} bg-gradient-brand text-white shadow-sm`}
                    >
                      <FiFileText className="h-3.5 w-3.5" aria-hidden="true" />
                      View PDF
                    </a>
                  )}
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${linkClass} bg-slate-100 text-slate-700 hover:text-brand dark:bg-slate-800 dark:text-slate-200 dark:hover:text-brand-light`}
                    >
                      <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      Verify credential
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.article>
        );
      })}
    </div>
  </Section>
);

export default CertificationsSection;
