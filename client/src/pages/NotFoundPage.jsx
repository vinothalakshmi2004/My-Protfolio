/**
 * NotFoundPage — themed 404 for unknown public routes, with a link back home.
 */
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft } from 'react-icons/fi';

export const NotFoundPage = () => (
  <main className="flex min-h-screen min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
    <Helmet>
      <title>Page not found</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    {/* Fluid "404": 96px on phones → 160px on desktop */}
    <p className="text-gradient-brand text-[clamp(6rem,15vw,10rem)] font-black leading-none">404</p>
    <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Page not found</h1>
    <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">The page you are looking for doesn’t exist or has been moved.</p>
    <Link
      to="/"
      className="bg-gradient-brand mt-8 inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 font-semibold text-white shadow-lg shadow-brand/25"
    >
      <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to home
    </Link>
  </main>
);

export default NotFoundPage;
