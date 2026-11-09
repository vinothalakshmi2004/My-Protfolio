/**
 * Icon registries.
 *  - SOCIAL_PLATFORMS: options for the admin "platform" dropdown + landing icons
 *  - getSkillIcon(): picks a technology logo for a skill (explicit icon key or auto-detected by name)
 */
import {
  FaGithub,
  FaLinkedin,
  FaXTwitter,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaWhatsapp,
  FaGlobe,
  FaEnvelope,
  FaMedium,
  FaDev,
  FaStackOverflow,
  FaDribbble,
  FaBehance,
  FaTelegram,
  FaDiscord,
  FaLink,
  FaJava,
  FaCode,
} from 'react-icons/fa6';
import {
  SiLeetcode,
  SiHackerrank,
  SiCodechef,
  SiGeeksforgeeks,
  SiReact,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiJavascript,
  SiTypescript,
  SiHtml5,
  SiCss,
  SiPython,
  SiMysql,
  SiPostgresql,
  SiPostman,
  SiDocker,
  SiGit,
  SiGithub,
  SiTailwindcss,
  SiSwagger,
  SiRedux,
  SiNextdotjs,
  SiFirebase,
  SiPhp,
  SiBootstrap,
  SiJsonwebtokens,
  SiVercel,
  SiNetlify,
  SiFigma,
  SiJira,
  SiLinux,
  SiClaude,
  SiOpenjdk,
} from 'react-icons/si';

/** Platforms offered in /admin/contact-social (value is stored in settings.socialLinks[].platform). */
export const SOCIAL_PLATFORMS = [
  { value: 'github', label: 'GitHub', icon: FaGithub },
  { value: 'linkedin', label: 'LinkedIn', icon: FaLinkedin },
  { value: 'twitter', label: 'X / Twitter', icon: FaXTwitter },
  { value: 'instagram', label: 'Instagram', icon: FaInstagram },
  { value: 'leetcode', label: 'LeetCode', icon: SiLeetcode },
  { value: 'hackerrank', label: 'HackerRank', icon: SiHackerrank },
  { value: 'codechef', label: 'CodeChef', icon: SiCodechef },
  { value: 'geeksforgeeks', label: 'GeeksforGeeks', icon: SiGeeksforgeeks },
  { value: 'portfolio', label: 'Portfolio / Website', icon: FaGlobe },
  { value: 'youtube', label: 'YouTube', icon: FaYoutube },
  { value: 'facebook', label: 'Facebook', icon: FaFacebook },
  { value: 'medium', label: 'Medium', icon: FaMedium },
  { value: 'devto', label: 'DEV.to', icon: FaDev },
  { value: 'stackoverflow', label: 'Stack Overflow', icon: FaStackOverflow },
  { value: 'dribbble', label: 'Dribbble', icon: FaDribbble },
  { value: 'behance', label: 'Behance', icon: FaBehance },
  { value: 'telegram', label: 'Telegram', icon: FaTelegram },
  { value: 'discord', label: 'Discord', icon: FaDiscord },
  { value: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp },
  { value: 'email', label: 'E-mail', icon: FaEnvelope },
  { value: 'other', label: 'Other link', icon: FaLink },
];

const SOCIAL_BY_VALUE = Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.value, p]));

/** Icon component for a social link ({ platform, icon }) — falls back to a generic link icon. */
export const getSocialIcon = (link) =>
  SOCIAL_BY_VALUE[(link?.icon || '').toLowerCase()]?.icon ||
  SOCIAL_BY_VALUE[(link?.platform || '').toLowerCase()]?.icon ||
  FaLink;

/** Display label for a social link. */
export const getSocialLabel = (link) =>
  link?.label || SOCIAL_BY_VALUE[(link?.platform || '').toLowerCase()]?.label || 'Link';

/** Technology logos available for skills (key = value stored in skill.items[].icon). */
export const SKILL_ICONS = {
  react: { label: 'React', icon: SiReact, match: ['react'] },
  nodejs: { label: 'Node.js', icon: SiNodedotjs, match: ['node'] },
  express: { label: 'Express', icon: SiExpress, match: ['express'] },
  mongodb: { label: 'MongoDB', icon: SiMongodb, match: ['mongo'] },
  javascript: { label: 'JavaScript', icon: SiJavascript, match: ['javascript', 'es6'] },
  typescript: { label: 'TypeScript', icon: SiTypescript, match: ['typescript'] },
  html: { label: 'HTML', icon: SiHtml5, match: ['html'] },
  css: { label: 'CSS', icon: SiCss, match: ['css'] },
  tailwind: { label: 'Tailwind CSS', icon: SiTailwindcss, match: ['tailwind'] },
  bootstrap: { label: 'Bootstrap', icon: SiBootstrap, match: ['bootstrap'] },
  redux: { label: 'Redux', icon: SiRedux, match: ['redux'] },
  nextjs: { label: 'Next.js', icon: SiNextdotjs, match: ['next.js', 'nextjs'] },
  python: { label: 'Python', icon: SiPython, match: ['python'] },
  java: { label: 'Java', icon: FaJava, match: ['java'] },
  openjdk: { label: 'OpenJDK', icon: SiOpenjdk, match: ['jdk'] },
  php: { label: 'PHP', icon: SiPhp, match: ['php'] },
  mysql: { label: 'MySQL', icon: SiMysql, match: ['mysql'] },
  postgresql: { label: 'PostgreSQL', icon: SiPostgresql, match: ['postgres'] },
  firebase: { label: 'Firebase', icon: SiFirebase, match: ['firebase'] },
  git: { label: 'Git', icon: SiGit, match: ['git'] },
  github: { label: 'GitHub', icon: SiGithub, match: ['github'] },
  postman: { label: 'Postman', icon: SiPostman, match: ['postman'] },
  swagger: { label: 'Swagger', icon: SiSwagger, match: ['swagger'] },
  docker: { label: 'Docker', icon: SiDocker, match: ['docker'] },
  jwt: { label: 'JWT', icon: SiJsonwebtokens, match: ['jwt'] },
  vercel: { label: 'Vercel', icon: SiVercel, match: ['vercel'] },
  netlify: { label: 'Netlify', icon: SiNetlify, match: ['netlify'] },
  figma: { label: 'Figma', icon: SiFigma, match: ['figma'] },
  jira: { label: 'Jira', icon: SiJira, match: ['jira'] },
  linux: { label: 'Linux', icon: SiLinux, match: ['linux'] },
  claude: { label: 'Claude', icon: SiClaude, match: ['claude'] },
  code: { label: 'Generic code', icon: FaCode, match: [] },
};

/** Options for the admin skill-icon dropdown. */
export const SKILL_ICON_OPTIONS = Object.entries(SKILL_ICONS).map(([value, { label }]) => ({ value, label }));

/**
 * Logo for a skill item: explicit `icon` key first, otherwise auto-detected from
 * the name ("React.js" -> React). Returns null when nothing matches (caller shows a dot/check).
 * "GitHub" is checked before "Git" and "JavaScript" before "Java" by matching longest keywords first.
 */
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Keywords must start a word ("Git" matches "Git", not "Digital")
const MATCHERS = Object.values(SKILL_ICONS)
  .flatMap((entry) =>
    entry.match.map((keyword) => ({ keyword, re: new RegExp(`(^|[^a-z0-9])${escapeRegex(keyword)}`), icon: entry.icon }))
  )
  .sort((a, b) => b.keyword.length - a.keyword.length);

export const getSkillIcon = (item) => {
  if (item?.icon && SKILL_ICONS[item.icon]) return SKILL_ICONS[item.icon].icon;
  const name = (item?.name || '').toLowerCase();
  return MATCHERS.find(({ re }) => re.test(name))?.icon || null;
};
