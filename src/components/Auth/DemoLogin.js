// ./src/components/Auth/DemoLogin.js

import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function DemoLogin() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Demo credentials
  const DEMO_EMAIL = process.env.REACT_APP_DEMO_EMAIL;
  const DEMO_PASSWORD = process.env.REACT_APP_DEMO_PASSWORD;

  useEffect(() => {
    const performDemoLogin = async () => {
      try {
        // Sign in with demo credentials
        const userCredential = await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
        const user = userCredential.user;

        // Update the user's last login time
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
        });

        // Redirect to the feed or desired page
        navigate('/feed');
      } catch (error) {
        console.error("Error during demo login:", error.message);
        setErrorMessage("Demo Login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    performDemoLogin();
  }, [navigate]);

  return (
    <div className="demo-login-container">
      {loading ? (
        <p>Logging you in...</p>
      ) : errorMessage ? (
        <div className="error-message">{errorMessage}</div>
      ) : null}
    </div>
  );
}

export default DemoLogin;
