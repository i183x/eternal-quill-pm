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
import { AuthProvider, useAuth } from './authContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase';


function AdminRoute({ children }) {
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

  return currentUser && isAdmin ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={
                <HomeRoute />
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="/competitions" element={<CompetitionPage />} />
            <Route path="/judges" element={<Judges />} />
            <Route path="/users" element={<Users />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/write" element={<Write />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/auth" element={<Auth />} />
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
