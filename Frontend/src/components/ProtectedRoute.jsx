import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  
  // Fallback from localStorage
  const hasToken = localStorage.getItem('authToken');
  const isAdminFromStorage = localStorage.getItem('admin') === 'true';

  console.log('ProtectedRoute check:', {
    isAuthenticated,
    loading,
    requireAdmin,
    isAdmin, // ✅ no () because it's a boolean
    hasToken,
    isAdminFromStorage,
    authToken: localStorage.getItem('authToken'),
    admin: localStorage.getItem('admin')
  });

  if (loading) return <div>Loading...</div>;
  
  // Authentication check
  if (!isAuthenticated && !hasToken) {
    console.log('Redirecting to login - not authenticated');
    return <Navigate to="/login" replace />;
  }
  
  // Admin check if required
  if (requireAdmin && !isAdmin && !isAdminFromStorage) {
    console.log('Redirecting to product - not admin');
    return <Navigate to="/product" replace />;
  }

  return children;
}
