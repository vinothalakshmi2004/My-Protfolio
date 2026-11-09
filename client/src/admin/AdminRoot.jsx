/**
 * AdminRoot — wraps every /admin route with the admin-only providers:
 * auth session, the shared confirm dialog, page title and a Suspense boundary
 * for the lazily-loaded admin pages. Search engines are told not to index /admin.
 */
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ConfirmProvider } from './context/ConfirmContext';
import PageSpinner from '../components/PageSpinner';

export default function AdminRoot() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <Helmet>
          <title>Admin Dashboard</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </ConfirmProvider>
    </AuthProvider>
  );
}
