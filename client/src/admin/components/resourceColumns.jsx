/**
 * Column configs for the six resource screens (used by ProjectsPage, ExperiencePage, ...). Each page renders
 * <ResourceManager> with the matching config (see ProjectsPage.jsx etc.).
 */
import { FiFileText, FiImage } from 'react-icons/fi';
import { fileUrl } from '../../lib/apiClient';
import { formatMonth, formatMonthRange, formatScore, formatYearRange } from '../../utils/format';
import { StatusBadge } from './Feedback';

/** Small square thumbnail used in list rows (placeholder icon when there's no image). */
export const Thumb = ({ url, alt = '', square = false, pdf = false }) => (
  <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800 ${square ? 'h-10 w-10' : 'h-10 w-16'}`}>
    {pdf ? (
      <FiFileText className="h-5 w-5 text-rose-500" aria-label="PDF" />
    ) : url ? (
      <img src={fileUrl(url)} alt={alt} width="64" height="40" loading="lazy" className="h-full w-full object-cover" />
    ) : (
      <FiImage className="h-4 w-4" aria-hidden="true" />
    )}
  </span>
);

/** Primary cell: thumbnail + title + subtitle (truncates instead of overflowing). */
export const TitleCell = ({ thumb, title, subtitle }) => (
  <div className="flex min-w-0 items-center gap-3">
    {thumb}
    <div className="min-w-0">
      <p className="truncate font-medium text-slate-900 dark:text-white">{title}</p>
      {subtitle && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  </div>
);

export const projectColumns = [
  {
    key: 'title',
    header: 'Project',
    primary: true,
    width: 'minmax(0,2.4fr)',
    render: (p) => <TitleCell thumb={<Thumb url={p.thumbnail?.url} />} title={p.title} subtitle={p.shortDescription} />,
  },
  { key: 'category', header: 'Category', width: 'minmax(0,1fr)', render: (p) => <span className="block truncate">{p.category || '—'}</span> },
  {
    key: 'featured',
    header: 'Featured',
    width: '6.5rem',
    hideOnMobile: true,
    wideOnly: true,
    render: (p) => (p.featured ? <StatusBadge tone="amber">★ Featured</StatusBadge> : <span className="text-slate-400">—</span>),
  },
];

export const experienceColumns = [
  {
    key: 'role',
    header: 'Role',
    primary: true,
    width: 'minmax(0,2fr)',
    render: (e) => <TitleCell thumb={e.companyLogo?.url ? <Thumb url={e.companyLogo.url} square /> : null} title={e.role} subtitle={e.company} />,
  },
  { key: 'dates', header: 'Dates', width: 'minmax(0,1.2fr)', render: (e) => formatMonthRange(e.startDate, e.endDate, e.isCurrent) || '—' },
];

export const educationColumns = [
  { key: 'degree', header: 'Degree', primary: true, width: 'minmax(0,2fr)', render: (e) => <TitleCell title={e.degree} subtitle={e.institution} /> },
  { key: 'years', header: 'Years', width: '9rem', render: (e) => formatYearRange(e.startYear, e.endYear) || '—' },
  { key: 'score', header: 'Score', width: '7rem', wideOnly: true, render: (e) => formatScore(e.scoreType, e.score) || '—' },
];

export const skillColumns = [
  { key: 'category', header: 'Category', primary: true, width: 'minmax(0,1fr)', render: (s) => <TitleCell title={s.category} subtitle={`${s.items?.length || 0} skills`} /> },
  {
    key: 'items',
    header: 'Skills',
    width: 'minmax(0,2fr)',
    hideOnMobile: true,
    render: (s) => <span className="line-clamp-2 text-sm">{(s.items || []).map((i) => i.name).join(', ') || '—'}</span>,
  },
];

export const certificationColumns = [
  {
    key: 'title',
    header: 'Certification',
    primary: true,
    width: 'minmax(0,2fr)',
    render: (c) => (
      <TitleCell
        thumb={<Thumb url={c.file?.contentType?.startsWith('image/') ? c.file.url : ''} pdf={c.file?.contentType === 'application/pdf'} />}
        title={c.title}
        subtitle={c.issuer}
      />
    ),
  },
  { key: 'issueDate', header: 'Issued', width: '7rem', render: (c) => formatMonth(c.issueDate) || '—' },
];

export const achievementColumns = [
  {
    key: 'title',
    header: 'Achievement',
    primary: true,
    width: 'minmax(0,2fr)',
    render: (a) => <TitleCell thumb={a.image?.url ? <Thumb url={a.image.url} /> : null} title={a.title} subtitle={a.description} />,
  },
  { key: 'date', header: 'Date', width: '7rem', render: (a) => formatMonth(a.date) || '—' },
];
