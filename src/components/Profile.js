// src/components/Profile.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db, storage } from '../firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  startAfter,
} from 'firebase/firestore';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth';
import { useAuth } from '../authContext';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import { handleImageUpload } from '../services/imageCompressionService'; // Import image compression service
import './styles/Profile.css';
import './styles/Modal.css';

const CACHE_KEY_PREFIX = 'profile_cache_';
const CACHE_EXPIRATION = 60 * 60 * 1000; // 1 hour

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [lastVisiblePost, setLastVisiblePost] = useState(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const [showPostDeleteConfirmation, setShowPostDeleteConfirmation] = useState(false);
  const [showProfileDeleteConfirmation, setShowProfileDeleteConfirmation] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const postToDeleteRef = useRef(null);

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const CACHE_KEY = `${CACHE_KEY_PREFIX}${id}`;

  // Validate cache validity
  const isCacheValid = (cache) => {
    if (!cache || !cache.timestamp) return false;
    const now = new Date().getTime();
    return now - cache.timestamp < CACHE_EXPIRATION;
  };

  // Fetch user data with caching
  const fetchUserData = useCallback(async () => {
    const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));

    if (cachedData && isCacheValid(cachedData)) {
      const userData = cachedData.data;
      setUser(userData);
      setUsername(userData.username);
      setBio(userData.bio);
      setFollowersCount(userData.followers ? userData.followers.length : 0);
      setFollowingCount(userData.following ? userData.following.length : 0);
      setLoading(false);
    } else {
      try {
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);
          setUsername(userData.username);
          setBio(userData.bio);
          setFollowersCount(userData.followers ? userData.followers.length : 0);
          setFollowingCount(userData.following ? userData.following.length : 0);

          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: userData, timestamp: new Date().getTime() })
          );
        } else {
          console.error('No such user!');
          toast.error('User not found.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    }
  }, [CACHE_KEY, id]);

  // Fetch initial posts
  const fetchPosts = useCallback(async () => {
    try {
      const postsQueryInstance = query(
        collection(db, 'posts'),
        where('userId', '==', id),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const postsSnapshot = await getDocs(postsQueryInstance);
      const postsData = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
      setLastVisiblePost(postsSnapshot.docs[postsSnapshot.docs.length - 1]);
      setLoadingPosts(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts.');
      setLoadingPosts(false);
    }
  }, [id]);

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
    fetchPosts();
  }, [fetchUserData, fetchPosts]);

  // Fetch more posts for pagination
  const fetchMorePosts = useCallback(async () => {
    if (!lastVisiblePost || !hasMorePosts || loadingPosts) return;

    setLoadingPosts(true);

    try {
      const postsQueryInstance = query(
        collection(db, 'posts'),
        where('userId', '==', id),
        orderBy('createdAt', 'desc'),
        limit(10),
        startAfter(lastVisiblePost)
      );
      const postsSnapshot = await getDocs(postsQueryInstance);
      if (!postsSnapshot.empty) {
        const newPosts = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setLastVisiblePost(postsSnapshot.docs[postsSnapshot.docs.length - 1]);
      } else {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error('Error fetching more posts:', error);
      toast.error('Failed to load more posts.');
    } finally {
      setLoadingPosts(false);
    }
  }, [db, id, lastVisiblePost, hasMorePosts, loadingPosts]);

  // Fetch followers or following list
  const fetchUsersList = useCallback(
    async (type) => {
      try {
        const userIds = type === 'followers' ? user.followers : user.following;
        if (!userIds || userIds.length === 0) {
          toast.info(`No ${type} to display.`);
          return;
        }

        const usersQueryInstance = query(
          collection(db, 'users'),
          where('__name__', 'in', userIds.slice(0, 10)) // Firestore 'in' operator limit is 10
        );
        const usersSnapshot = await getDocs(usersQueryInstance);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (type === 'followers') {
          setFollowersList(usersList);
          setShowFollowersModal(true);
        } else {
          setFollowingList(usersList);
          setShowFollowingModal(true);
        }
      } catch (error) {
        console.error(`Error fetching ${type} list:`, error);
        toast.error(`Failed to fetch ${type} list.`);
      }
    },
    [user]
  );

  // Delete a specific post
  const handleDeletePost = useCallback(async () => {
    const postId = postToDeleteRef.current;
    if (!postId) return;

    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      toast.success('Post deleted successfully');
      setShowPostDeleteConfirmation(false);
      postToDeleteRef.current = null;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post.');
    }
  }, []);

  // Update user profile
  const handleProfileUpdate = useCallback(async () => {
    if (!currentUser || currentUser.uid !== id) return;

    setErrorMessage('');
    setIsUpdatingProfile(true);

    let profilePictureURL = user?.profilePictureURL;

    if (profilePicture) {
      try {
        const compressedFile = profilePicture;
        const storageReference = storageRef(storage, `profilePictures/${currentUser.uid}`);
        await uploadBytes(storageReference, compressedFile);
        profilePictureURL = await getDownloadURL(storageReference);
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        setErrorMessage('Failed to upload profile picture. Please try again.');
        setIsUpdatingProfile(false);
        return;
      }
    }

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        username,
        bio,
        profilePictureURL,
      });

      setIsEditing(false);
      setUser((prevUser) => ({
        ...prevUser,
        username,
        bio,
        profilePictureURL,
      }));

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: { ...user, username, bio, profilePictureURL },
          timestamp: new Date().getTime(),
        })
      );

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  }, [bio, CACHE_KEY, currentUser, id, profilePicture, username, user]);

  // Handle profile picture selection and compression
  const handleProfilePictureChange = useCallback(
    async (e) => {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png'];
      const maxSizeInMB = 5;

      setErrorMessage('');

      if (file) {
        if (!validTypes.includes(file.type)) {
          setErrorMessage('Invalid file format. Only JPG and PNG are allowed.');
          e.target.value = '';
          return;
        }

        if (file.size > maxSizeInMB * 1024 * 1024) {
          setErrorMessage(`File is too large. Max size is ${maxSizeInMB}MB.`);
          e.target.value = '';
          return;
        }

        try {
          const compressedFile = await handleImageUpload(file);
          setProfilePicturePreview(URL.createObjectURL(compressedFile));
          setProfilePicture(compressedFile);
        } catch (error) {
          console.error('Image compression failed:', error);
          setErrorMessage(error.message || 'Failed to compress image. Please try another file.');
        }
      }
    },
    []
  );

  // Delete user profile
  const handleDeleteProfile = useCallback(async () => {
    if (!password) {
      toast.error('Please enter your password to confirm.');
      return;
    }

    setIsDeleting(true);
    setErrorMessage('');

    const credential = EmailAuthProvider.credential(currentUser.email, password);

    try {
      await reauthenticateWithCredential(currentUser, credential);
      await deleteDoc(doc(db, 'users', currentUser.uid));
      await deleteUser(currentUser);

      toast.success('Profile deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting profile:', error);
      setErrorMessage('Failed to delete profile. Please check your password.');
      toast.error('Failed to delete profile. Please check your password.');
    } finally {
      setIsDeleting(false);
    }
  }, [currentUser, navigate, password]);

  // Truncate post content for preview
  const truncateContent = (content, maxLength = 100) => {
    const plainText = content.replace(/<[^>]+>/g, '');
    return plainText.length > maxLength ? `${plainText.slice(0, maxLength)}...` : plainText;
  };

  // Open post delete confirmation modal
  const openPostDeleteConfirmation = useCallback((postId) => {
    postToDeleteRef.current = postId;
    setShowPostDeleteConfirmation(true);
  }, []);

  // Open profile delete confirmation modal
  const openProfileDeleteConfirmation = useCallback(() => {
    setShowProfileDeleteConfirmation(true);
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>User not found!</p>;
  }

  return (
    <div className="profile">
      <img
        src={profilePicturePreview || user.profilePictureURL || 'default-profile.png'}
        alt={`${user.username}'s profile`}
        className="profile-picture"
      />
      <h2>{user.username}</h2>
      <p>{user.bio}</p>
      <p>
        <span
          className="clickable"
          onClick={() => fetchUsersList('followers')}
          role="button"
          tabIndex={0}
          onKeyPress={() => fetchUsersList('followers')}
        >
          Followers: {followersCount}
        </span>{' '}
        |{' '}
        <span
          className="clickable"
          onClick={() => fetchUsersList('following')}
          role="button"
          tabIndex={0}
          onKeyPress={() => fetchUsersList('following')}
        >
          Following: {followingCount}
        </span>
      </p>

      {currentUser && currentUser.uid === id && (
        <div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          ) : (
            <div>
              <h3>Edit Profile</h3>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                maxLength={300}
              />

              <div className="profile-picture-container always-visible">
                <label htmlFor="profilePictureInput" className="profile-picture-label">
                  <div className="overlay">
                    <span>Change Picture</span>
                  </div>
                </label>
                <input
                  type="file"
                  id="profilePictureInput"
                  className="profile-picture-input"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
                <small className="upload-instructions">JPG, PNG only. Max size: 5MB.</small>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
              </div>

              <button onClick={handleProfileUpdate} disabled={isUpdatingProfile}>
                {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
              </button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>

              <button className="delete-profile-btn danger" onClick={openProfileDeleteConfirmation}>
                Delete Profile
              </button>
            </div>
          )}
        </div>
      )}

      <h3>Posts</h3>
      {loadingPosts ? (
        <p>Loading posts...</p>
      ) : posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <h4>{post.title}</h4>
              <p>{truncateContent(post.content)}</p>
              <Link to={`/post/${post.id}`}>Read More</Link>
              {currentUser && currentUser.uid === id && (
                <button className="danger" onClick={() => openPostDeleteConfirmation(post.id)}>
                  Delete Post
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts yet.</p>
      )}
      {hasMorePosts && (
        <button onClick={fetchMorePosts} disabled={loadingPosts}>
          {loadingPosts ? 'Loading more posts...' : 'Load More Posts'}
        </button>
      )}

      {/* Post Delete Confirmation Modal */}
      {showPostDeleteConfirmation && (
        <div
          className="delete-confirmation-modal"
          role="dialog"
          aria-labelledby="postDeleteModalTitle"
          aria-modal="true"
        >
          <p>Are you sure you want to delete this post? This action cannot be undone.</p>
          <button onClick={handleDeletePost}>Confirm</button>
          <button onClick={() => setShowPostDeleteConfirmation(false)}>Cancel</button>
        </div>
      )}

      {/* Profile Delete Confirmation Modal */}
      {showProfileDeleteConfirmation && (
        <div
          className="delete-confirmation-modal"
          role="dialog"
          aria-labelledby="profileDeleteModalTitle"
          aria-modal="true"
        >
          <h3>Confirm Profile Deletion</h3>
          <p>
            Deleting your profile will permanently remove your data, including all posts, followers, and
            following lists. This action cannot be undone.
          </p>
          <input
            type="password"
            placeholder="Enter your password to confirm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="delete-confirmation-buttons danger">
            <button className="confirm-delete-btn danger" onClick={handleDeleteProfile} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
            </button>
            <button onClick={() => setShowProfileDeleteConfirmation(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div
          className="modal"
          role="dialog"
          aria-labelledby="followersModalTitle"
          aria-modal="true"
        >
          <div className="modal-content">
            <h3>Followers</h3>
            <ul>
              {followersList.map((follower) => (
                <li key={follower.id}>
                  <Link to={`/profile/${follower.id}`}>
                    <img src={follower.profilePictureURL || 'default-profile.png'} alt={follower.username} />
                    <span>{follower.username}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowFollowersModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div
          className="modal"
          role="dialog"
          aria-labelledby="followingModalTitle"
          aria-modal="true"
        >
          <div className="modal-content">
            <h3>Following</h3>
            <ul>
              {followingList.map((following) => (
                <li key={following.id}>
                  <Link to={`/profile/${following.id}`}>
                    <img src={following.profilePictureURL || 'default-profile.png'} alt={following.username} />
                    <span>{following.username}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowFollowingModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/*
        TODO: Refactor the modal dialogs (delete confirmations, followers/following lists) into separate reusable components
        to enhance readability and maintainability.
      */}
    </div>
  );
}

export default Profile;
