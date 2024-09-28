// ./src/components/common/PrivateRoute/PrivateRoute.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';

// General Private Route for authenticated users
export function GeneralPrivateRoute() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/auth" />; // Redirect to the auth page if not logged in
  }

  return <Outlet />; // Allow access if authenticated
}

// Admin-specific Private Route
export function AdminPrivateRoute() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/auth" />; // Redirect to the auth page if not logged in
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/" />; // Redirect to homepage if not admin
  }

  return <Outlet />; // Allow access if admin
}
