// src/components/PrivateRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function PrivateRoute({ component: Component, ...rest }) {
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

  return (
    <Route
      {...rest}
      render={props =>
        currentUser && isAdmin ? (
          <Component {...props} />
        ) : (
          <Navigate to="/" /> // Redirect to homepage if not admin
        )
      }
    />
  );
}

export default PrivateRoute;
