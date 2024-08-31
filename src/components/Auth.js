import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Auth.css';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (profilePicture) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(profilePicture);
    } else {
      setProfilePicturePreview(null);
    }
  }, [profilePicture]);

  const handleAuth = async () => {
    setErrorMessage('');
    setLoading(true);

    if (isSignup) {
      // Validate username
      if (username.length < 4 || username.length > 32) {
        setErrorMessage("Username must be between 4 and 32 characters.");
        setLoading(false);
        return;
      }

      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(username)) {
        setErrorMessage("Username can only contain letters, numbers, underscores, and hyphens.");
        setLoading(false);
        return;
      }

      // Validate password
      if (password.length < 8) {
        setErrorMessage("Password must be at least 8 characters long.");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        setLoading(false);
        return;
      }

      // Validate phone number
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(phoneNumber)) {
        setErrorMessage("Phone number must contain only digits and be between 10 to 15 digits long.");
        setLoading(false);
        return;
      }

      // Validate bio length
      if (bio.length > 300) {
        setErrorMessage("Bio must be 300 characters or less.");
        setLoading(false);
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        let profilePictureURL = '';

        if (profilePicture) {
          const storageRef = ref(storage, `profilePictures/${user.uid}`);
          const uploadResult = await uploadBytes(storageRef, profilePicture);
          profilePictureURL = await getDownloadURL(uploadResult.ref);
        } else {
          profilePictureURL = await getDownloadURL(ref(storage, 'profilePictures/anonymous_tie_profile_pic.jpeg'));
        }

        await setDoc(doc(db, "users", user.uid), {
          userId: user.uid,
          username: username,
          email: email,
          phoneNumber: phoneNumber,
          bio: bio,
          profilePictureURL: profilePictureURL,
          role: 'user',
          following: [],
          lastLogin: serverTimestamp(),
        });

        alert("Signup successful!");
        navigate('/feed');
      } catch (error) {
        console.error("Error during signup:", error.message);
        setErrorMessage("Error during signup. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
        });

        alert("Login successful!");
        navigate('/feed');
      } catch (error) {
        console.error("Error during login:", error.message);
        setErrorMessage("Error during login. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isSignup ? "Sign Up" : "Login"}</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {isSignup && (
          <>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <textarea
              placeholder="Short Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files[0])}
            />
            {profilePicturePreview && (
              <img
                src={profilePicturePreview}
                alt="Profile Preview"
                className="profile-preview"
              />
            )}
            <div className="terms-container">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={() => setAgreeToTerms(!agreeToTerms)}
                required
              />
              <label>
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="terms-link">
                  Terms and Conditions
                </Link>
              </label>
            </div>
          </>
        )}
        <button onClick={handleAuth} disabled={loading} className="auth-button">
          {loading ? "Processing..." : isSignup ? "Sign Up" : "Login"}
        </button>
        <Link to="#" className="switch-auth" onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Switch to Login" : "Switch to Sign Up"}
        </Link>
      </div>
    </div>
  );
}

export default Auth;
