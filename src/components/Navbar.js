import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../authContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './styles/Navbar.css'; // Ensure your CSS file is correctly linked

function Navbar() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Eternal Quill
        </Link>
        <div className="nav-icon" onClick={toggleMenu}>
          <i className={isOpen ? "fas fa-times" : "fas fa-bars"} />
        </div>
        <ul className={isOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/feed" className="nav-links" onClick={toggleMenu}>
              Feed
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/write" className="nav-links" onClick={toggleMenu}>
              Write
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/users" className="nav-links" onClick={toggleMenu}>
              Users
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/competitions" className="nav-links" onClick={toggleMenu}>
              Competitions
            </Link>
          </li>
          <li className="nav-item">
            <button onClick={toggleTheme} className="nav-links btn-theme-toggle">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </li>
          {currentUser ? (
            <>
              <li className="nav-item">
                <Link to={`/profile/${currentUser.uid}`} className="nav-links" onClick={toggleMenu}>
                  Profile
                </Link>
              </li>
              <li className="nav-item">
                <button onClick={handleSignOut} className="nav-links btn-signout">
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/auth" className="nav-links" onClick={toggleMenu}>
                  Login/Signup
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
