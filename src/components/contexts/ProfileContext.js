// ./src/components/contexts/ProfileContext.js

import React, { createContext, useContext, useState } from 'react';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState({});
  const [profileTimestamp, setProfileTimestamp] = useState({});

  const CACHE_EXPIRY_TIME = 3600000; // 1 hour in milliseconds

  const isCacheValid = (userId) => {
    return profileTimestamp[userId] && Date.now() - profileTimestamp[userId] < CACHE_EXPIRY_TIME;
  };

  const updateProfileData = (userId, data) => {
    setProfileData((prev) => ({ ...prev, [userId]: data }));
    setProfileTimestamp((prev) => ({ ...prev, [userId]: Date.now() }));
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfileData, isCacheValid }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => useContext(ProfileContext);
