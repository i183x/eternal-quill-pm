// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../authContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

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
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.role === 'admin');
        }
      }
      setLoading(false);
    };

    checkAdmin();
  }, [currentUser]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/" />; // Redirect to homepage if not admin
  }

  return <Outlet />; // Allow access if admin
}
