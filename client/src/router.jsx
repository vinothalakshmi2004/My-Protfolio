/**
 * Application routes (data router — required for the admin "unsaved changes" blocker).
 *
 *   /                 Landing page (100% data-driven)
 *   /admin/login      Admin sign-in
 *   /admin/*          Admin dashboard (protected; redirects to /admin/login without a valid token)
 *
 * Every admin screen is lazy-loaded, so visitors of the landing page never
 * download the dashboard code (forms, drag-and-drop, validation libraries).
 */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import PageSpinner from './components/PageSpinner';

const AdminRoot = lazy(() => import('./admin/AdminRoot'));
const LoginPage = lazy(() => import('./admin/pages/LoginPage'));
const ProtectedRoute = lazy(() => import('./admin/layout/ProtectedRoute'));
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout'));

const OverviewPage = lazy(() => import('./admin/pages/OverviewPage'));
const ProfilePage = lazy(() => import('./admin/pages/ProfilePage'));
const ContactSocialPage = lazy(() => import('./admin/pages/ContactSocialPage'));
const ResumePage = lazy(() => import('./admin/pages/ResumePage'));
const ProjectsPage = lazy(() => import('./admin/pages/ProjectsPage'));
const ExperiencePage = lazy(() => import('./admin/pages/ExperiencePage'));
const EducationPage = lazy(() => import('./admin/pages/EducationPage'));
const SkillsPage = lazy(() => import('./admin/pages/SkillsPage'));
const CertificationsPage = lazy(() => import('./admin/pages/CertificationsPage'));
const AchievementsPage = lazy(() => import('./admin/pages/AchievementsPage'));
const SectionsPage = lazy(() => import('./admin/pages/SectionsPage'));
const SeoPage = lazy(() => import('./admin/pages/SeoPage'));
const MessagesPage = lazy(() => import('./admin/pages/MessagesPage'));
const AccountPage = lazy(() => import('./admin/pages/AccountPage'));
const AdminNotFound = lazy(() => import('./admin/pages/AdminNotFound'));

const withSuspense = (element) => <Suspense fallback={<PageSpinner />}>{element}</Suspense>;

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  {
    path: '/admin',
    element: withSuspense(<AdminRoot />),
    children: [
      { path: 'login', element: <LoginPage /> },
      {
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <OverviewPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'contact-social', element: <ContactSocialPage /> },
          { path: 'resume', element: <ResumePage /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'experience', element: <ExperiencePage /> },
          { path: 'education', element: <EducationPage /> },
          { path: 'skills', element: <SkillsPage /> },
          { path: 'certifications', element: <CertificationsPage /> },
          { path: 'achievements', element: <AchievementsPage /> },
          { path: 'sections', element: <SectionsPage /> },
          { path: 'seo', element: <SeoPage /> },
          { path: 'messages', element: <MessagesPage /> },
          { path: 'account', element: <AccountPage /> },
          { path: '*', element: <AdminNotFound /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default router;
