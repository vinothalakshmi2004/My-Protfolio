/**
 * ProtectedRoute — only renders its children for an authenticated admin.
 * While a stored token is being verified it shows a spinner; without a valid
 * token it redirects to /admin/login (remembering where the admin wanted to go).
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageSpinner from '../../components/PageSpinner';

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <PageSpinner label="Checking your session…" />;
  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}
