/**
 * Sidebar navigation for the admin dashboard (grouped).
 */
import {
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCode,
  FiFileText,
  FiFolder,
  FiGlobe,
  FiGrid,
  FiLayout,
  FiMail,
  FiShield,
  FiStar,
  FiUser,
  FiUserCheck,
} from 'react-icons/fi';

export const NAV_GROUPS = [
  {
    label: null,
    items: [{ to: '/admin', label: 'Overview', icon: FiGrid, end: true }],
  },
  {
    label: 'Profile',
    items: [
      { to: '/admin/profile', label: 'Profile & About', icon: FiUser },
      { to: '/admin/contact-social', label: 'Contact & Social', icon: FiGlobe },
      { to: '/admin/resume', label: 'Resume', icon: FiFileText },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/projects', label: 'Projects', icon: FiFolder },
      { to: '/admin/experience', label: 'Experience', icon: FiBriefcase },
      { to: '/admin/education', label: 'Education', icon: FiBookOpen },
      { to: '/admin/skills', label: 'Skills', icon: FiCode },
      { to: '/admin/certifications', label: 'Certifications', icon: FiAward },
      { to: '/admin/achievements', label: 'Achievements', icon: FiStar },
    ],
  },
  {
    label: 'Site',
    items: [
      { to: '/admin/sections', label: 'Sections & Layout', icon: FiLayout },
      { to: '/admin/seo', label: 'SEO & Branding', icon: FiShield },
    ],
  },
  {
    label: 'Inbox & Account',
    items: [
      { to: '/admin/messages', label: 'Messages', icon: FiMail, badgeKey: 'unread' },
      { to: '/admin/account', label: 'Account', icon: FiUserCheck },
    ],
  },
];

/** Flat list (used for the header page title). */
export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
