import React from 'react';
import { Route, Routes, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../authContext';
import adminRoutes from './adminRoutes'; // Import the routes configuration
import './styles/AdminDashboard.css';

function AdminDashboard() {
  const { currentUser } = useAuth();

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" />; // Redirect to homepage if not admin
  }

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <nav>
          <ul>
            {adminRoutes.map((route) => (
              <li key={route.path}>
                <Link to={route.path}>{route.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="content">
        <Routes>
          {adminRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.component />} />
          ))}
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard;
