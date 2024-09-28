// ./src/components/Admin/AdminDashboard/AdminDashboard.js

import React from 'react';
import { Route, Routes, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import './AdminDashboard.css';

// Import admin components
import CompetitionsAdmin from '../CompetitionsAdmin/Competitions';
import UserManagement from '../UserManagement/UserManagement';
import Analytics from '../Analytics/Analytics';
import ContentModeration from '../ContentModeration/ContentModeration';
import NotificationsAdmin from '../NotificationsAdmin/NotificationsAdmin';
import Settings from '../Settings/Settings';
import SecurityLogs from '../SecurityLogs/SecurityLogs';

function AdminDashboard() {
  const { currentUser } = useAuth();

  // Check if the user is authenticated and has an admin role
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" />; // Redirect to homepage if not admin
  }

  // Define admin links and routes locally
  const adminRoutes = [
    { path: 'dashboard', name: 'Dashboard', component: <h2>Admin Home</h2> },
    { path: 'competitions', name: 'Competitions', component: <CompetitionsAdmin /> },
    { path: 'users', name: 'User Management', component: <UserManagement /> },
    { path: 'analytics', name: 'Analytics', component: <Analytics /> },
    { path: 'content-moderation', name: 'Content Moderation', component: <ContentModeration /> },
    { path: 'notifications', name: 'Notifications', component: <NotificationsAdmin /> },
    { path: 'settings', name: 'Settings', component: <Settings /> },
    { path: 'security-logs', name: 'Security & Logs', component: <SecurityLogs /> },
  ];

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <nav>
          <ul>
            {adminRoutes.map((route) => (
              <li key={route.path}>
                <Link to={`/admin/${route.path}`}>{route.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="content">
        <Routes>
          {adminRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.component}
            />
          ))}
          {/* Redirect /admin to /admin/dashboard */}
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard;
