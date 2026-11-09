/**
 * LandingPage — the public portfolio, rendered 100% from the API:
 *   settings + projects + experience + skills + education + certifications + achievements
 * (usePortfolioData falls back to src/data/fallback.js only when the API is unreachable).
 *
 * Section order, visibility and headings come from settings; hidden or empty
 * sections are skipped AND removed from the navbar (same list feeds both).
 */
import { Fragment } from 'react';
import { MotionConfig } from 'framer-motion';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { getSectionContent, getVisibleSections } from '../utils/sections';
import Seo from '../components/Seo';
import ThemeColors from '../components/ThemeColors';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { LandingSkeleton } from '../components/SkeletonLoader';
import HeroSection from '../sections/HeroSection';
import AboutSection from '../sections/AboutSection';
import SkillsSection from '../sections/SkillsSection';
import ExperienceSection from '../sections/ExperienceSection';
import ProjectsSection from '../sections/ProjectsSection';
import EducationSection from '../sections/EducationSection';
import CertificationsSection from '../sections/CertificationsSection';
import AchievementsSection from '../sections/AchievementsSection';
import ContactSection from '../sections/ContactSection';

/** Renders one section by key with the data it needs. */
const renderSection = (key, { settings, data, content, muted }) => {
  const common = { content, muted };
  switch (key) {
    case 'about':
      return <AboutSection {...common} settings={settings} />;
    case 'skills':
      return <SkillsSection {...common} skills={data.skills} />;
    case 'experience':
      return <ExperienceSection {...common} experiences={data.experience} />;
    case 'projects':
      return <ProjectsSection {...common} projects={data.projects} />;
    case 'education':
      return <EducationSection {...common} education={data.education} />;
    case 'certifications':
      return <CertificationsSection {...common} certifications={data.certifications} />;
    case 'achievements':
      return <AchievementsSection {...common} achievements={data.achievements} />;
    case 'contact':
      return <ContactSection {...common} settings={settings} />;
    default:
      return null;
  }
};

export const LandingPage = () => {
  const { loading, data } = usePortfolioData();

  if (loading || !data) return <LandingSkeleton />;

  const { settings } = data;
  const visibleSections = getVisibleSections(settings, data);
  const navItems = visibleSections.map((key) => ({ key, label: getSectionContent(settings, key).navLabel }));

  return (
    // reducedMotion="user": framer-motion animations respect the OS "reduce motion" setting
    <MotionConfig reducedMotion="user">
      <Seo settings={settings} />
      <ThemeColors theme={settings.theme} />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg"
      >
        Skip to content
      </a>

      <div className="min-h-screen min-h-dvh bg-slate-50 text-slate-800 transition-colors duration-300 selection:bg-brand selection:text-white dark:bg-slate-950 dark:text-slate-100">
        <Navbar settings={settings} navItems={navItems} />
        <main id="main">
          <HeroSection settings={settings} visibleSections={visibleSections} />
          {visibleSections.map((key, index) => (
            <Fragment key={key}>
              {renderSection(key, {
                settings,
                data,
                content: getSectionContent(settings, key),
                muted: index % 2 === 0, // alternate backgrounds regardless of chosen order
              })}
            </Fragment>
          ))}
        </main>
        <Footer settings={settings} />
      </div>
    </MotionConfig>
  );
};

export default LandingPage;
