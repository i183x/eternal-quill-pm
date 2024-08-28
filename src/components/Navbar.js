import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../authContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './styles/Navbar.css'; // Keep your custom CSS

function Navbar() {
  const { currentUser } = useAuth();
  const [theme, setTheme] = useState('light');

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    document.body.className = theme;  // Apply theme to body element
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Eternal Quill
        </Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to="/feed" className="nav-link">
                Feed
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/write" className="nav-link">
                Write
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/users" className="nav-link">
                Users
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/competitions" className="nav-link">
                Competitions
              </Link>
            </li>
            <li className="nav-item">
              <button onClick={toggleTheme} className="nav-link btn-theme-toggle">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>
            </li>
            {currentUser ? (
              <>
                <li className="nav-item">
                  <Link to={`/profile/${currentUser.uid}`} className="nav-link">
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button onClick={handleSignOut} className="nav-link btn-signout">
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/auth" className="nav-link">
                    Login/Signup
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
