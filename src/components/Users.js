import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useAuth } from '../authContext'; // Import useAuth for currentUser
import './styles/Users.css';

function Users() {
  const { currentUser } = useAuth(); // Access currentUser from authContext
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState({});

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
    const userRef = doc(db, "users", userId);
    const isFollowing = following[userId];

    try {
      if (isFollowing) {
        await updateDoc(userRef, {
          followers: following[userId].filter(followerId => followerId !== currentUser.uid)
        });
      } else {
        await updateDoc(userRef, {
          followers: [...(following[userId] || []), currentUser.uid]
        });
      }

      setFollowing(prev => ({
        ...prev,
        [userId]: !isFollowing
      }));
    } catch (error) {
      console.error("Error updating following status:", error);
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
          <li key={user.id}>
            <img src={user.profilePictureURL || 'default-profile.png'} alt={`${user.username}'s profile`} />
            <Link to={`/profile/${user.id}`}>{user.username}</Link>
            {currentUser && currentUser.uid !== user.id && ( // Only show the follow button if the current user is not the same as the profile user
              <button
                className="follow-btn"
                onClick={() => handleFollowToggle(user.id)}
              >
                {following[user.id] ? "Unfollow" : "Follow"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
