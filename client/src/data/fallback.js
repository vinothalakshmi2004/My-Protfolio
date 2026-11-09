/**
 * Offline fallback content — ONLY used when the API can't be reached
 * (e.g. the server is cold-starting or down). Normally every piece of text,
 * link, image and file on the landing page comes from the database.
 *
 * Shapes match the API responses exactly. Keep this roughly in sync with
 * server/seed/seedData.js (it is a snapshot, not the source of truth).
 */
import { SECTION_KEYS } from '../utils/sections';

export const fallbackSettings = {
  fullName: 'Vinothalakshmi M',
  headline: 'MERN Stack Developer | AI Automation Engineer',
  typingRoles: ['MERN Stack Developer', 'AI Automation Engineer', 'Full-Stack Problem Solver'],
  summary:
    'MCA graduate building responsive, high-performance web applications and autonomous AI automation pipelines with React, Node.js, and MongoDB.',
  aboutLongText:
    'MCA graduate with hands-on experience building MERN stack applications and a strong foundation in full-stack development. Skilled in React.js, Node.js, MongoDB, and REST APIs with real-world project experience in scalable web applications. Currently working as an AI Automation Engineer at ZenxAI, with a proven ability to learn fast, lead teams, and deliver quality software solutions.',
  hero: { greeting: "Hi, I'm", availabilityText: 'Available for New Roles & Collaborations', showAvailability: true },
  profileImage: { url: '', fileId: '' },
  aboutImage: { url: '', fileId: '' },
  favicon: { url: '', fileId: '' },
  // Static copy shipped in client/public — only used while the API is unreachable
  resume: { url: '/resume.pdf', fileId: '', fileName: 'Vinothalakshmi_M_Resume.pdf' },
  contact: {
    email: 'vinothalakshmi7@gmail.com',
    phone: '',
    showPhonePublicly: false,
    location: 'Madurai, Tamil Nadu',
    whatsapp: '',
    intro:
      'I am actively open to discussing software engineering roles, full-stack MERN projects, and AI automation consultancy. Feel free to reach out directly through the form or email.',
    responseTime: 'Within 24 Hours',
  },
  socialLinks: [
    { _id: 'sl-1', platform: 'github', label: 'GitHub', url: 'https://github.com/vinothalakshmi2004', visible: true },
    { _id: 'sl-2', platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/vinotha-lakshmi-m2004', visible: true },
  ],
  stats: [
    { _id: 'st-1', label: 'MERN Projects', value: '4', subtext: 'Production-ready apps' },
    { _id: 'st-2', label: 'Experience', value: '2', subtext: 'ZenXAI & Cognifyz' },
    { _id: 'st-3', label: 'MCA CGPA', value: '9.0', subtext: 'RVS College Distinction' },
    { _id: 'st-4', label: 'Certifications', value: '7+', subtext: 'Java, Python, AWS, Web' },
  ],
  sectionVisibility: Object.fromEntries(SECTION_KEYS.map((key) => [key, true])),
  sectionOrder: [...SECTION_KEYS],
  sectionContent: {
    about: {
      navLabel: 'About',
      badge: 'About Me',
      title: 'Engineering With Purpose & Innovation',
      subtitle: 'Get to know the developer behind the code and automation workflows',
    },
    skills: {
      navLabel: 'Skills',
      badge: 'Technical Proficiency',
      title: 'Core Skills & Technologies',
      subtitle: 'A comprehensive toolkit across modern web development, backend architectures, databases, and AI automation',
    },
    experience: {
      navLabel: 'Experience',
      badge: 'Career Journey',
      title: 'Work & Industry Experience',
      subtitle: 'Real-world engineering impact, AI workflow deployment, and frontend development',
    },
    projects: {
      navLabel: 'Projects',
      badge: 'Featured Portfolio',
      title: 'Full-Stack Web Projects',
      subtitle: 'Real-world applications built with the MERN stack, secure REST APIs, role-based authentication, and modern user interfaces',
    },
    education: {
      navLabel: 'Education',
      badge: 'Academic Background',
      title: 'Education & Qualifications',
      subtitle: 'Strong computer science foundations, consistent academic distinction, and technical honors',
    },
    certifications: {
      navLabel: 'Certifications',
      badge: 'Credentials',
      title: 'Professional Certifications',
      subtitle: 'Continuous learning and validated proficiencies',
    },
    achievements: {
      navLabel: 'Achievements',
      badge: 'Recognition',
      title: 'Honors & Achievements',
      subtitle: 'Awards, competitions, and competitive coding accolades',
    },
    contact: {
      navLabel: 'Contact',
      badge: 'Get In Touch',
      title: "Let's Build Something Together",
      subtitle: 'Have a project in mind, a hiring opportunity, or want to discuss AI automation? Drop a message!',
    },
  },
  seo: {
    title: 'Vinothalakshmi M | MERN Stack Developer & AI Automation Engineer',
    description:
      'Portfolio of Vinothalakshmi M — MERN Stack Developer & AI Automation Engineer based in Madurai, Tamil Nadu.',
    keywords: 'Vinothalakshmi M, MERN Stack Developer, AI Automation Engineer, React, Node.js, MongoDB',
    ogImage: { url: '', fileId: '' },
  },
  theme: { primaryColor: '#7c3aed', secondaryColor: '#ec4899' },
  footerText: 'Designed & built by Vinothalakshmi M',
};

const skill = (category, items) => ({ category, items: items.map((name) => ({ name, icon: '', level: '' })) });

export const fallbackSkills = [
  skill('Frontend', ['React.js', 'HTML5', 'CSS3', 'JavaScript (ES6+)']),
  skill('Backend', ['Node.js', 'Express.js', 'REST APIs', 'Java', 'Python']),
  skill('Database', ['MongoDB', 'MySQL']),
  skill('AI', ['Antigravity', 'Claude', 'AI Agents']),
  skill('Tools', ['Git', 'GitHub', 'Postman', 'VS Code', 'Slack', 'Canvas', 'Swagger', 'Docker (basic)']),
  skill('Soft skills', ['Leadership', 'Team Management', 'Time Management', 'Multitasking']),
].map((item, order) => ({ _id: `sk-${order}`, order, visible: true, ...item }));

export const fallbackExperience = [
  {
    _id: 'exp-1',
    company: 'ZenXAI',
    role: 'AI Automation Engineer & Quality Analyst',
    location: 'Madurai, Tamil Nadu',
    startDate: '2026-01',
    endDate: '',
    isCurrent: true,
    bullets: [
      'Developed and maintained AI voice agents and automation workflows to improve operational efficiency.',
      'Worked with REST APIs, API keys, webhooks, and JSON for application integrations.',
      'Performed API testing using Postman and Swagger; gained exposure to Docker and MERN stack technologies.',
      'Conducted quality analysis, identified bugs, and troubleshot issues to improve system accuracy and reliability.',
    ],
    companyLogo: { url: '', fileId: '' },
  },
  {
    _id: 'exp-2',
    company: 'Cognifyz Technologies',
    role: 'Frontend Development Intern',
    location: 'Remote',
    startDate: '2025-07',
    endDate: '2025-08',
    isCurrent: false,
    bullets: [
      'Built responsive web interfaces using HTML, CSS, and JavaScript.',
      'Improved UI design skills and coding practices through hands-on project work.',
    ],
    companyLogo: { url: '', fileId: '' },
  },
];

const project = (slug, title, category, shortDescription, techStack, features, liveUrl = '') => ({
  _id: `proj-${slug}`,
  slug,
  title,
  category,
  shortDescription,
  fullDescription: shortDescription,
  techStack,
  features,
  githubUrl: 'https://github.com/vinothalakshmi2004',
  liveUrl,
  thumbnail: { url: '', fileId: '' },
  gallery: [],
  featured: true,
});

export const fallbackProjects = [
  project(
    'smart-admission-management-system',
    'Smart Admission Management System',
    'Admin Dashboard',
    'Full-stack web app for online college admissions with scholarship eligibility check, seat availability tracking, live admission updates, secure authentication, and an admin dashboard.',
    ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'JWT'],
    ['Online student admission application workflow', 'Scholarship eligibility automated checker', 'Live seat availability and vacancy tracking', 'Admin dashboard for application approval and analytics']
  ),
  project(
    'nextstep-educational-consultancy-system',
    'NextStep Educational Consultancy System',
    'MERN',
    'Consultancy platform helping post-12th students with course selection, college shortlisting, and application support, plus an admin panel to manage inquiries.',
    ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
    ['Interactive student inquiry and profile matching interface', 'Course selection and college shortlisting guide', 'Admin panel to manage inquiries'],
    'https://nextstepeducationalcounsultancy.netlify.app/'
  ),
  project(
    'kkm-hotel-management-portal',
    'KKM Hotel Management Portal',
    'Admin Dashboard',
    'Manage multiple hotels from one portal: real-time room availability, booking approvals, income/expense dashboard, maintenance management, and Excel export.',
    ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT Auth', 'ExcelJS'],
    ['Multi-hotel centralized management', 'Real-time room availability and booking engine', 'Income and expense tracking dashboard'],
    'https://kkmhotel.netlify.app/'
  ),
  project(
    'sri-krishna-departmental-store',
    'Sri Krishna Departmental Store',
    'E-commerce',
    'E-commerce app with product search, cart, orders and real-time tracking, plus an admin dashboard with barcode-scan product upload and order flow management.',
    ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Barcode Scanner', 'JWT'],
    ['Product catalog with search and filtering', 'Real-time order tracking (accept → dispatch → delivered)', 'Admin dashboard with barcode-scanner product upload']
  ),
];

export const fallbackEducation = [
  {
    _id: 'edu-1',
    degree: 'Master of Computer Applications (MCA)',
    institution: 'RVS College of Arts and Science',
    location: 'Coimbatore, Tamil Nadu',
    startYear: '2024',
    endYear: '2026',
    scoreType: 'CGPA',
    score: '9.0',
    notes: '',
  },
  {
    _id: 'edu-2',
    degree: 'Bachelor of Computer Applications (BCA)',
    institution: 'RVS College of Arts and Science',
    location: 'Coimbatore, Tamil Nadu',
    startYear: '2021',
    endYear: '2024',
    scoreType: 'CGPA',
    score: '7.9',
    notes: 'Best Performer Award – Placement Training',
  },
  {
    _id: 'edu-3',
    degree: 'Higher Secondary Certificate (HSC)',
    institution: 'Government Higher Secondary School',
    location: 'Peraiyur, Madurai, Tamil Nadu',
    startYear: '2019',
    endYear: '2021',
    scoreType: 'Percentage',
    score: '90',
    notes: '',
  },
];

export const fallbackCertifications = [
  ['Java Programming Fundamentals', 'Infosys Springboard'],
  ['Front-End Development HTML & CSS', 'Great Learning'],
  ['OOPs Concepts in Java', 'Great Learning'],
  ['PHP', 'Great Learning'],
  ['Basics of Python', 'Infosys Springboard'],
  ['EF SET English Proficiency', 'EF SET'],
  ['Cloud Computing with AWS', 'Cloudplusai Technology'],
].map(([title, issuer], i) => ({
  _id: `cert-${i}`,
  title,
  issuer,
  issueDate: '',
  credentialUrl: '',
  file: { url: '', fileId: '', contentType: '' },
}));

export const fallbackAchievements = [
  ['Best Performer Award', 'Recognized as the top-performing student during campus placement and technical readiness training at RVS College.'],
  ['2nd Place — JPL Intra-College Competition', 'Secured the runner-up position, demonstrating strategic problem solving and technical team collaboration.'],
  ['Coding Ninja Java Coding Competition', 'Competed in algorithmic problem solving and core Java challenges hosted by Coding Ninjas.'],
  ['Beecrowd Java Programming Challenges', 'Solved practical algorithmic problem sets covering basic to intermediate data structures and logic.'],
  ['Infosys Soft Skills Training', 'Completed Infosys Springboard training in communication, teamwork, and workplace readiness.'],
].map(([title, description], i) => ({ _id: `ach-${i}`, title, description, date: '', image: { url: '', fileId: '' } }));

export const fallbackData = {
  settings: fallbackSettings,
  skills: fallbackSkills,
  experience: fallbackExperience,
  projects: fallbackProjects,
  education: fallbackEducation,
  certifications: fallbackCertifications,
  achievements: fallbackAchievements,
};
