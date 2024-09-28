// src/components/Auth.js

import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link, useNavigate } from 'react-router-dom';
import { handleImageUpload, getRandomDefaultProfilePicture } from '../services/imageCompressionService'; // Import the compression service
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

  // Preview Profile Picture
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

  /**
   * Handle authentication (Sign Up / Log In).
   * Performs all validations and image compression before account creation.
   */
  const handleAuth = async () => {
    setErrorMessage('');  // Clear any previous error messages
    setLoading(true);     // Set loading state

    if (isSignup) {
      // Validate the input fields for signup
      if (!validateSignupFields()) {
        setLoading(false);  // Stop loading if validation fails
        return;
      }

      let compressedImage = null; // To hold the compressed image if any
      let defaultProfilePictureURL = null; // To hold the default picture URL if needed

      // Step 1: Handle profile picture
      if (profilePicture) {
        try {
          compressedImage = await handleImageUpload(profilePicture); // Compress image
        } catch (error) {
          // Handle image compression failure
          console.error("Image compression failed:", error.message);
          setErrorMessage(error.message);
          setLoading(false);
          return; // Abort signup if image compression fails
        }
      } else {
        try {
          defaultProfilePictureURL = await getRandomDefaultProfilePicture(); // Assign random default picture
        } catch (error) {
          console.error("Failed to assign default profile picture:", error.message);
          setErrorMessage("Failed to assign a default profile picture. Please try again.");
          setLoading(false);
          return; // Abort signup if default picture assignment fails
        }
      }

      // Step 2: Proceed to create the user account
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        let profilePictureURL = '';

        // Step 3: Upload the compressed image after account creation
        if (compressedImage) {
          try {
            const storageRef = ref(storage, `profilePictures/${user.uid}`);
            const uploadResult = await uploadBytes(storageRef, compressedImage);

            // Get the download URL of the uploaded image
            profilePictureURL = await getDownloadURL(uploadResult.ref);
          } catch (error) {
            // Handle image upload failure
            console.error("Profile picture upload failed:", error.message);
            // Proceed with default profile picture
            try {
              profilePictureURL = await getDownloadURL(ref(storage, 'defaultPics/fallback.png')); // Ensure this image exists
              alert("Profile picture upload failed. A default profile picture has been assigned.");
            } catch (fallbackError) {
              console.error("Failed to assign fallback profile picture:", fallbackError.message);
              setErrorMessage("Profile picture upload failed, and default assignment also failed. Please try again.");
              setLoading(false);
              return; // Abort signup if fallback assignment fails
            }
          }
        } else {
          // Use the randomly assigned default profile picture
          profilePictureURL = defaultProfilePictureURL;
        }

        // Step 4: Add the user document to Firestore
        try {
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
          navigate('/feed');  // Navigate to the feed on successful signup

        } catch (error) {
          // Handle Firestore document creation error
          console.error("Error creating user document:", error.message);
          setErrorMessage("Signup failed. Please try again.");

          // Optionally, delete the user account here if critical
          // await deleteUser(user);
        }

      } catch (error) {
        // Handle any errors that occur during account creation
        console.error("Error during signup:", error.message);
        setErrorMessage("Signup failed. Please try again.");
      } finally {
        setLoading(false);  // Stop loading after signup process
      }

    } else {
      // Handle login process
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update the user's last login time
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
        });

        alert("Login successful!");
        navigate('/feed');  // Navigate to the feed on successful login

      } catch (error) {
        // Handle any errors that occur during login
        console.error("Error during login:", error.message);
        setErrorMessage("Error during login. Please try again.");
      } finally {
        setLoading(false);  // Stop loading after login process
      }
    }
  };

  /**
   * Validate all the signup fields.
   * Returns true if all validations pass, otherwise false.
   */
  const validateSignupFields = () => {
    // Validate email
    if (!email) {
      setErrorMessage("Email is required.");
      return false;
    }

    // Validate password
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return false;
    }

    // Validate username
    if (username.length < 4 || username.length > 32) {
      setErrorMessage("Username must be between 4 and 32 characters.");
      return false;
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      setErrorMessage("Username can only contain letters, numbers, underscores, and hyphens.");
      return false;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setErrorMessage("Phone number must contain only digits and be between 10 to 15 digits long.");
      return false;
    }

    // Validate bio length
    if (bio.length > 300) {
      setErrorMessage("Bio must be 300 characters or less.");
      return false;
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      setErrorMessage("You must agree to the Terms and Conditions.");
      return false;
    }

    return true;
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
            <div className="profile-picture-container">
              <label htmlFor="profile-picture" className="profile-picture-label">
                Upload Profile Picture (Optional)
              </label>
              <input
                type="file"
                id="profile-picture"
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
            </div>
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
