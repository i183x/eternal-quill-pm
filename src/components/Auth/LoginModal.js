// ./src/components/Auth/LoginModal.js

import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import './LoginModal.css';

function LoginModal({ isVisible, onClose, redirectTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
      redirectTo();
    } catch (error) {
      setError('Failed to log in. Please check your email and password.');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="login-modal">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Login to Like Posts</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account?{' '}
          <a href="/auth" onClick={onClose}>
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginModal;
