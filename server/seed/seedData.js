/**
 * Initial portfolio content for Vinothalakshmi M (from the resume).
 * Used by `npm run seed` — after seeding, everything is edited from /admin.
 */

const settingsData = {
  fullName: 'Vinothalakshmi M',
  headline: 'MERN Stack Developer | AI Automation Engineer',
  typingRoles: ['MERN Stack Developer', 'AI Automation Engineer', 'Full-Stack Problem Solver'],
  summary:
    'MCA graduate building responsive, high-performance web applications and autonomous AI automation pipelines with React, Node.js, and MongoDB.',
  aboutLongText:
    'MCA graduate with hands-on experience building MERN stack applications and a strong foundation in full-stack development. Skilled in React.js, Node.js, MongoDB, and REST APIs with real-world project experience in scalable web applications. Currently working as an AI Automation Engineer at ZenxAI, with a proven ability to learn fast, lead teams, and deliver quality software solutions.',
  hero: {
    greeting: "Hi, I'm",
    availabilityText: 'Available for New Roles & Collaborations',
    showAvailability: true,
  },
  contact: {
    email: 'vinothalakshmi7@gmail.com',
    phone: '+91 8610257232',
    showPhonePublicly: false,
    location: 'Madurai, Tamil Nadu',
    whatsapp: '',
    intro:
      'I am actively open to discussing software engineering roles, full-stack MERN projects, and AI automation consultancy. Feel free to reach out directly through the form or email.',
    responseTime: 'Within 24 Hours',
  },
  socialLinks: [
    { platform: 'github', label: 'GitHub', url: 'https://github.com/vinothalakshmi2004', icon: 'github', visible: true },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/vinotha-lakshmi-m2004',
      icon: 'linkedin',
      visible: true,
    },
  ],
  stats: [
    { label: 'MERN Projects', value: '4', subtext: 'Production-ready apps' },
    { label: 'Experience', value: '2', subtext: 'ZenXAI & Cognifyz' },
    { label: 'MCA CGPA', value: '9.0', subtext: 'RVS College Distinction' },
    { label: 'Certifications', value: '7+', subtext: 'Java, Python, AWS, Web' },
  ],
  sectionVisibility: {
    about: true,
    skills: true,
    experience: true,
    projects: true,
    education: true,
    certifications: true,
    achievements: true,
    contact: true,
  },
  sectionOrder: ['about', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements', 'contact'],
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
      subtitle:
        'Real-world applications built with the MERN stack, secure REST APIs, role-based authentication, and modern user interfaces',
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
      'Portfolio of Vinothalakshmi M — MERN Stack Developer & AI Automation Engineer based in Madurai, Tamil Nadu. Explore full-stack projects, experience, skills, and certifications.',
    keywords:
      'Vinothalakshmi M, MERN Stack Developer, AI Automation Engineer, React Developer, Node.js, Express, MongoDB, Portfolio, Full-Stack Developer, Madurai',
  },
  theme: { primaryColor: '#7c3aed', secondaryColor: '#ec4899' },
  footerText: 'Designed & built by Vinothalakshmi M',
};

const skillsData = [
  { category: 'Frontend', items: ['React.js', 'HTML5', 'CSS3', 'JavaScript (ES6+)'] },
  { category: 'Backend', items: ['Node.js', 'Express.js', 'REST APIs', 'Java', 'Python'] },
  { category: 'Database', items: ['MongoDB', 'MySQL'] },
  { category: 'AI', items: ['Antigravity', 'Claude', 'AI Agents'] },
  { category: 'Tools', items: ['Git', 'GitHub', 'Postman', 'VS Code', 'Slack', 'Canvas', 'Swagger', 'Docker (basic)'] },
  { category: 'Soft skills', items: ['Leadership', 'Team Management', 'Time Management', 'Multitasking'] },
].map((group, order) => ({
  ...group,
  order,
  items: group.items.map((name) => ({ name, icon: '', level: '' })),
}));

const experienceData = [
  {
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
  },
  {
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
  },
].map((item, order) => ({ ...item, order }));

const projectsData = [
  {
    title: 'Smart Admission Management System',
    slug: 'smart-admission-management-system',
    category: 'Admin Dashboard',
    shortDescription:
      'Full-stack web app for online college admissions with scholarship eligibility check, seat availability tracking, live admission updates, secure authentication, and an admin dashboard.',
    fullDescription:
      'Full-stack web application for online college admissions featuring scholarship eligibility verification, real-time seat availability tracking, admission status updates, secure authentication, and a comprehensive administrative dashboard.',
    techStack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'JWT'],
    features: [
      'Online student admission application workflow',
      'Scholarship eligibility automated checker',
      'Live seat availability and vacancy tracking',
      'Live admission updates and email notifications',
      'Admin dashboard for application approval and analytics',
      'Secure role-based authentication',
    ],
    githubUrl: 'https://github.com/vinothalakshmi2004',
    liveUrl: '',
    featured: true,
  },
  {
    title: 'NextStep Educational Consultancy System',
    slug: 'nextstep-educational-consultancy-system',
    category: 'MERN',
    shortDescription:
      'Consultancy platform helping post-12th students with course selection, college shortlisting, and application support, plus an admin panel to manage inquiries.',
    fullDescription:
      'A comprehensive educational consultancy platform guiding post-12th students through course selection, college shortlisting, and application support with interactive interfaces and centralized inquiry tracking.',
    techStack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
    features: [
      'Interactive student inquiry and profile matching interface',
      'Course selection and college shortlisting guide',
      'Application tracking and status monitoring',
      'Admin panel to manage inquiries and provide career guidance',
      'Counselor allocation and appointment scheduling',
    ],
    githubUrl: 'https://github.com/vinothalakshmi2004',
    liveUrl: 'https://nextstepeducationalcounsultancy.netlify.app/',
    featured: true,
  },
  {
    title: 'KKM Hotel Management Portal',
    slug: 'kkm-hotel-management-portal',
    category: 'Admin Dashboard',
    shortDescription:
      'Manage multiple hotels from one portal: real-time room availability, booking approvals, income/expense dashboard, maintenance management, and Excel export.',
    fullDescription:
      'Multi-hotel management portal to manage multiple properties from a single interface: real-time room availability, online booking with admin approval workflow, income/expense dashboard, maintenance management, and Excel data export with database cleanup.',
    techStack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT Auth', 'ExcelJS'],
    features: [
      'Multi-hotel centralized management from a single portal',
      'Real-time room availability calendar and booking engine',
      'Admin booking approval and reservation workflow',
      'Income and expense tracking dashboard with analytics',
      'Room maintenance and housekeeping management',
      'Excel export functionality with scheduled database cleanup',
      'Secure JWT-based role authentication',
    ],
    githubUrl: 'https://github.com/vinothalakshmi2004',
    liveUrl: 'https://kkmhotel.netlify.app/',
    featured: true,
  },
  {
    title: 'Sri Krishna Departmental Store',
    slug: 'sri-krishna-departmental-store',
    category: 'E-commerce',
    shortDescription:
      'E-commerce app with product search, cart, orders and real-time tracking, plus an admin dashboard with barcode-scan product upload and order flow management.',
    fullDescription:
      'End-to-end departmental store e-commerce application with product search, cart, order management, and real-time tracking. Equipped with an admin dashboard supporting manual and barcode-scan product uploads, offers management, and three-stage order lifecycle processing.',
    techStack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Barcode Scanner', 'JWT'],
    features: [
      'Product catalog with keyword search and category filtering',
      'Shopping cart and smooth checkout experience',
      'Real-time order lifecycle tracking (accept → dispatch → delivered)',
      'Admin dashboard with manual and barcode-scanner product upload',
      'Special offers and discount coupon management',
      'Revenue and sales performance analytics',
      'Customer user management and JWT secured authentication',
    ],
    githubUrl: 'https://github.com/vinothalakshmi2004',
    liveUrl: '',
    featured: true,
  },
].map((item, order) => ({ ...item, order }));

const educationData = [
  {
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
    degree: 'Higher Secondary Certificate (HSC)',
    institution: 'Government Higher Secondary School',
    location: 'Peraiyur, Madurai, Tamil Nadu',
    startYear: '2019',
    endYear: '2021',
    scoreType: 'Percentage',
    score: '90',
    notes: '',
  },
].map((item, order) => ({ ...item, order }));

const certificationsData = [
  { title: 'Java Programming Fundamentals', issuer: 'Infosys Springboard' },
  { title: 'Front-End Development HTML & CSS', issuer: 'Great Learning' },
  { title: 'OOPs Concepts in Java', issuer: 'Great Learning' },
  { title: 'PHP', issuer: 'Great Learning' },
  { title: 'Basics of Python', issuer: 'Infosys Springboard' },
  { title: 'EF SET English Proficiency', issuer: 'EF SET' },
  { title: 'Cloud Computing with AWS', issuer: 'Cloudplusai Technology' },
].map((item, order) => ({ ...item, issueDate: '', credentialUrl: '', order }));

const achievementsData = [
  {
    title: 'Best Performer Award',
    description: 'Recognized as the top-performing student during campus placement and technical readiness training at RVS College.',
  },
  {
    title: '2nd Place — JPL Intra-College Competition',
    description: 'Secured the runner-up position, demonstrating strategic problem solving and technical team collaboration.',
  },
  {
    title: 'Coding Ninja Java Coding Competition',
    description: 'Competed in algorithmic problem solving and core Java challenges hosted by Coding Ninjas.',
  },
  {
    title: 'Beecrowd Java Programming Challenges',
    description: 'Solved practical algorithmic problem sets covering basic to intermediate data structures and logic.',
  },
  {
    title: 'Infosys Soft Skills Training',
    description: 'Completed Infosys Springboard training in communication, teamwork, and workplace readiness.',
  },
].map((item, order) => ({ ...item, date: '', order }));

module.exports = {
  settingsData,
  skillsData,
  experienceData,
  projectsData,
  educationData,
  certificationsData,
  achievementsData,
};
