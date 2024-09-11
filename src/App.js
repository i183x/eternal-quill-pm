import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import Users from './components/Users';
import Profile from './components/Profile';
import Feed from './components/Feed';
import Write from './components/Write';
import Post from './components/Post';
import Terms from './components/Terms';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Judges from './components/Judges';
import CompetitionPage from './components/CompetitionPage';
import CompetitionDetailPage from './components/CompetitionDetailPage';
import RegistrationPage from './components/RegistrationPage';
import { AuthProvider, useAuth } from './authContext';
import { AdminPrivateRoute, GeneralPrivateRoute } from './components/PrivateRoute';

import UserManagement from './components/admin/UserManagement';
import Settings from './components/admin/Settings';
import Analytics from './components/admin/Analytics';
import ContentModeration from './components/admin/ContentModeration';
import Notifications from './components/admin/Notifications';
import SecurityLogs from './components/admin/SecurityLogs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="App">
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/post/:id" element={<Post />} />

            {/* Protected routes for authenticated users */}
            <Route element={<GeneralPrivateRoute />}>
              <Route
                path="/feed"
                element={
                    <Feed />
                }
              />
              <Route
                path="/profile/:id"
                element={
                    <Profile />
                }
              />
              <Route path="/write" element={<Write />} />
              <Route path="/users" element={<Users />} />
              <Route path="/competitions" element={<CompetitionPage />} />
              <Route path="/competitions/:competitionId" element={<CompetitionDetailPage />} />
              <Route path="/register/:competitionId" element={<RegistrationPage />} />
              <Route path="/judges" element={<Judges />} />
              <Route path="/terms" element={<Terms />} />
            </Route>

            {/* Protected admin routes */}
            <Route element={<AdminPrivateRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/competitions" element={<CompetitionPage />} />
              <Route path="/admin/judges" element={<Judges />} />
              <Route
                path="/admin/profile/:id"
                element={
                    <Profile />
                }
              />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/content-moderation" element={<ContentModeration />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/security-logs" element={<SecurityLogs />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function HomeRoute() {
  const { currentUser } = useAuth();

  return currentUser ? <Navigate to="/feed" /> : <Auth />;
}

export default App;
