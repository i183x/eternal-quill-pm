// src/components/Users.js

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useAuth } from '../authContext';
import { createNotification } from '../services/notificationsService'; // Import notification service
import './styles/Users.css';

function Users() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState({});
  const [loadingFollow, setLoadingFollow] = useState({});

  useEffect(() => {
    if (currentUser) {
      const fetchFollowing = async () => {
        const currentUserRef = doc(db, "users", currentUser.uid);
        const currentUserSnap = await getDoc(currentUserRef);

        if (currentUserSnap.exists()) {
          const userData = currentUserSnap.data();
          setFollowing(userData.following || {});
        }
      };

      fetchFollowing();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(
        collection(db, "users"),
        orderBy("lastLogin", "desc"),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchUsers();
  }, []);

  const handleFollowToggle = async (userId) => {
    if (loadingFollow[userId]) return;

    setLoadingFollow((prev) => ({ ...prev, [userId]: true }));

    const currentUserRef = doc(db, "users", currentUser.uid);
    const userRef = doc(db, "users", userId);

    try {
      const currentUserSnap = await getDoc(currentUserRef);
      const userSnap = await getDoc(userRef);

      if (currentUserSnap.exists() && userSnap.exists()) {
        const currentUserData = currentUserSnap.data();
        const userData = userSnap.data();

        let updatedFollowing = currentUserData.following || [];
        let updatedFollowers = userData.followers || [];

        if (following[userId]) {
          updatedFollowing = updatedFollowing.filter(followId => followId !== userId);
          updatedFollowers = updatedFollowers.filter(followerId => followerId !== currentUser.uid);
        } else {
          updatedFollowing.push(userId);
          updatedFollowers.push(currentUser.uid);

          // Create a notification for the user being followed
          await createNotification(userId, `${currentUserData.username} followed you.`, "follower", null, currentUser.uid);
        }

        await updateDoc(currentUserRef, { following: updatedFollowing });
        await updateDoc(userRef, { followers: updatedFollowers });

        setFollowing((prev) => ({
          ...prev,
          [userId]: !following[userId]
        }));
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    } finally {
      setLoadingFollow((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <div className="users">
      <h2>Recent Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id} className="user-item">
            <img src={user.profilePictureURL || 'default-profile.png'} alt={`${user.username}'s profile`} />
            <Link to={`/profile/${user.id}`}>{user.username}</Link>

            {currentUser && currentUser.uid !== user.id && (
              <button
                className="follow-btn"
                onClick={() => handleFollowToggle(user.id)}
                disabled={loadingFollow[user.id]}
              >
                {loadingFollow[user.id] ? "Processing..." : (following[user.id] ? "Unfollow" : "Follow")}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
