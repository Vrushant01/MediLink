import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Route guard restricting access based on authentication status and allowed user roles
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-8">
        <div className="text-center font-sans text-[13px] text-ink-soft animate-pulse">
          Loading MediLink...
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user role is not authorized for this route, redirect to their home page
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const roleHome =
      user.role === 'store'
        ? '/store'
        : user.role === 'supplier'
        ? '/supplier'
        : '/admin';

    return <Navigate to={roleHome} replace />;
  }

  return children;
}
