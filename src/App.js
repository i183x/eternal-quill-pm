// ./src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/common/Navbar/Navbar';

import { AuthProvider, useAuth } from './components/contexts/authContext';
import { AdminPrivateRoute, GeneralPrivateRoute } from './components/common/PrivateRoute/PrivateRoute';

// General Components
import Auth from './components/Auth/Auth';
import Feed from './components/Feed/Feed';
import Write from './components/Write/Write';
import Post from './components/Posts/Post';
import Profile from './components/Profile/Profile';
import Users from './components/Users/Users';
import Terms from './components/Terms/Terms';
import Judges from './components/Judges/Judges';
import CompetitionPage from './components/Competitions/CompetitionPage';
import CompetitionDetailPage from './components/Competitions/CompetitionDetailPage';
import RegistrationPage from './components/Competitions/RegistrationPage';

// Admin Components
import AdminDashboard from './components/Admin/AdminDashboard/AdminDashboard';

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
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile/:id" element={<Profile />} />
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
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
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
