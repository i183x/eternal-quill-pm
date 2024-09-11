import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../authContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './styles/Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faBell } from '@fortawesome/free-solid-svg-icons';
import Notifications from './Notifications';

function Navbar() {
  const { currentUser } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false); // Red dot for unread notifications

  useEffect(() => {
    document.body.className = theme; // Apply the theme to the body
  }, [theme]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme; // Apply the theme to the body
    localStorage.setItem('theme', newTheme); // Save the user's theme preference
  };

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const closeNav = () => {
    setIsNavCollapsed(true);
    document.body.classList.remove('nav-open');
  };

  useEffect(() => {
    if (!isNavCollapsed) {
      document.body.classList.add('nav-open');
    } else {
      document.body.classList.remove('nav-open');
    }
  }, [isNavCollapsed]);

  // Detect if the device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Check initially
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleNotifications = () => setShowNotifications(!showNotifications);

  const closeNotifications = () => setShowNotifications(false);

  // Handle click outside notifications for mobile view
  useEffect(() => {
    const handleClickOutside = (e) => {
      const notificationElement = document.querySelector('.notifications-modal');
      if (notificationElement && !notificationElement.contains(e.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Eternal Quill
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={!isNavCollapsed ? true : false}
          aria-label="Toggle navigation"
          onClick={handleNavCollapse}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
          <ul className="navbar-nav ml-auto">
            {currentUser ? (
              <>
                <li className="nav-item">
                  <Link to="/feed" className="nav-link" onClick={closeNav}>
                    Feed
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/write" className="nav-link" onClick={closeNav}>
                    Write
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/users" className="nav-link" onClick={closeNav}>
                    Users
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/competitions" className="nav-link" onClick={closeNav}>
                    Competitions
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to={`/profile/${currentUser.uid}`} className="nav-link" onClick={closeNav}>
                    Profile
                  </Link>
                </li>

                {/* Notifications Icon (shown only in desktop) */}
                {!isMobile && (
                  <li className="nav-item notifications">
                    <button className="nav-link notification-bell" onClick={toggleNotifications}>
                      <FontAwesomeIcon icon={faBell} />
                      {hasUnreadNotifications && <span className="red-dot"></span>}
                    </button>
                    {showNotifications && <Notifications onClose={closeNotifications} />} {/* Show Notifications */}
                  </li>
                )}

                <li className="nav-item">
                  <button onClick={handleSignOut} className="nav-link btn-signout">
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link to="/auth" className="nav-link" onClick={closeNav}>
                  Login/Signup
                </Link>
              </li>
            )}
            <li className="nav-item">
              <input
                type="checkbox"
                className="checkbox"
                id="checkbox"
                onChange={toggleTheme}
                checked={theme === 'dark'}
              />
              <label htmlFor="checkbox" className="checkbox-label">
                <FontAwesomeIcon icon={faMoon} />
                <FontAwesomeIcon icon={faSun} />
                <span className="ball"></span>
              </label>
            </li>
          </ul>
        </div>
      </div>

      {/* Floating Bell Icon for Mobile */}
      {isMobile && (
        <button className="floating-bell" onClick={toggleNotifications}>
          <FontAwesomeIcon icon={faBell} />
          {hasUnreadNotifications && <span className="red-dot"></span>}
          {showNotifications && <Notifications onClose={closeNotifications} />}
        </button>
      )}
    </nav>
  );
}

export default Navbar;
