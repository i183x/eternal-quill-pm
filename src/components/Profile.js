import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, getDoc, collection, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../authContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import './styles/Profile.css';

function Profile() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);
          setUsername(userData.username);
          setBio(userData.bio);
          setFollowersCount(userData.followers ? userData.followers.length : 0);
          setFollowingCount(userData.following ? userData.following.length : 0);

          if (currentUser) {
            const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (currentUserDoc.exists()) {
              const currentUserData = currentUserDoc.data();
              setFollowing(currentUserData.following.includes(id));
            }
          }
        } else {
          console.log("No such user!");
        }

        const postsQuery = query(
          collection(db, "posts"),
          where("userId", "==", id)
        );
        const postsQuerySnapshot = await getDocs(postsQuery);
        const userPosts = postsQuerySnapshot.docs.map(postDoc => ({
          id: postDoc.id,
          ...postDoc.data()
        }));
        setPosts(userPosts);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, [id, currentUser]);

  const handleFollow = async () => {
    if (!currentUser || !user) return;

    const currentUserRef = doc(db, "users", currentUser.uid);
    const userRef = doc(db, "users", id);

    try {
      const currentUserDoc = await getDoc(currentUserRef);
      if (currentUserDoc.exists()) {
        const currentUserData = currentUserDoc.data();
        let updatedFollowing;
        let updatedFollowers;

        if (following) {
          updatedFollowing = currentUserData.following.filter(userId => userId !== id);
          updatedFollowers = user.followers ? user.followers.filter(followerId => followerId !== currentUser.uid) : [];
          setFollowersCount(followersCount - 1);
        } else {
          updatedFollowing = [...currentUserData.following, id];
          updatedFollowers = user.followers ? [...user.followers, currentUser.uid] : [currentUser.uid];
          setFollowersCount(followersCount + 1);
        }

        await updateDoc(currentUserRef, { following: updatedFollowing });
        await updateDoc(userRef, { followers: updatedFollowers });

        setFollowing(!following);
      }
    } catch (error) {
      console.error("Error updating following status:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post: ", error);
    }
  };

  const handleProfileUpdate = async () => {
    setErrorMessage('');

    if (!currentUser || !user) return;

    if (username.length < 4 || username.length > 32) {
      setErrorMessage("Username must be between 4 and 32 characters.");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      setErrorMessage("Username can only contain letters, numbers, underscores, and hyphens.");
      return;
    }

    let profilePictureURL = user.profilePictureURL;

    if (profilePicture) {
      try {
        const options = { maxSizeMB: 0.25, useWebWorker: true };
        const compressedFile = await imageCompression(profilePicture, options);
        if (compressedFile.size > 250 * 1024) {
          setErrorMessage("Profile picture must be less than 250 KB");
          return;
        }

        const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
        await uploadBytes(storageRef, compressedFile);
        profilePictureURL = await getDownloadURL(storageRef);
      } catch (error) {
        console.error("Error uploading profile picture: ", error);
        setErrorMessage("Error uploading profile picture. Please try again.");
        return;
      }
    }

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        username: username,
        bio: bio,
        profilePictureURL: profilePictureURL
      });
      alert("Profile updated successfully!");
      setUser({ ...user, username: username, bio: bio, profilePictureURL: profilePictureURL });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile: ", error);
      setErrorMessage("Error updating profile. Please try again.");
    }
  };

  const truncateContent = (content, maxLength = 100) => {
    const plainText = content.replace(/<[^>]+>/g, '');
    if (plainText.length > maxLength) {
      return plainText.slice(0, maxLength) + "...";
    }
    return plainText;
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile">
      {user ? (
        <div>
          <img src={user.profilePictureURL || 'default-profile.png'} alt={`${user.username}'s profile`} />
          <h2>{user.username}</h2>
          <p>{user.bio}</p>
          <p>Followers: {followersCount} | Following: {followingCount}</p>
          {errorMessage && <p className="error">{errorMessage}</p>}
          {currentUser && currentUser.uid !== id && (
            <button onClick={handleFollow}>
              {following ? "Unfollow" : "Follow"}
            </button>
          )}
          {currentUser && currentUser.uid === id && (
            <div>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)}>Edit Profile</button>
              ) : (
                <div>
                  <h3>Edit Profile</h3>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                  />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Bio"
                    maxLength={300}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePicture(e.target.files[0])}
                  />
                  <button onClick={handleProfileUpdate}>Update Profile</button>
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              )}
            </div>
          )}
          <h3>Posts</h3>
          {posts.length > 0 ? (
            <ul>
              {posts.map(post => (
                <li key={post.id}>
                  <h4>{post.title}</h4>
                  <p>{truncateContent(post.content)}</p>
                  <Link to={`/post/${post.id}`}>Read More</Link>
                  {currentUser && currentUser.uid === post.userId && (
                    <button onClick={() => handleDeletePost(post.id)}>Delete Post</button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts yet.</p>
          )}
        </div>
      ) : (
        <p>User not found.</p>
      )}
    </div>
  );
}

export default Profile;
