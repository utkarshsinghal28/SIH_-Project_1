import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { ROLES } from '../utils/constants.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import paths from './paths.js';

/**
 * Route guard.
 *
 * IMPORTANT: this is navigation UX, not security. Anyone can edit client-side
 * state. Real authorisation (JWT verification + RBAC middleware) is implemented
 * on the Express API in Part 2; every protected endpoint will re-check the role.
 */
export default function ProtectedRoute({ role }) {
  const { isAuthenticated, user, initialising } = useAuth();
  const location = useLocation();

  if (initialising) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <LoadingSpinner label="Checking your session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath = role === ROLES.ADMIN ? paths.adminLogin : paths.farmerLogin;
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    const home = user.role === ROLES.ADMIN ? paths.adminDashboard : paths.farmerDashboard;
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
