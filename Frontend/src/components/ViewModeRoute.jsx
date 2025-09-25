import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Product from './Product';

export default function ViewModeRoute() {
  const [viewMode, setViewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const isViewMode = localStorage.getItem('viewMode') === 'true';
    setViewMode(isViewMode);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // If in view mode, show product page (regardless of authentication)
  if (viewMode) {
    return <Product />;
  }

  // If user is authenticated but not in view mode, redirect to normal product page
  if (isAuthenticated) {
    return <Navigate to="/product" replace />;
  }

  // Otherwise redirect to login
  return <Navigate to="/login" replace />;
} 