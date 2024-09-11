import { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, getDoc, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../authContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faComment, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import './styles/Notifications.css';

function Notifications({ isMobile }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDropdownUp, setIsDropdownUp] = useState(false);
  const [lastVisibleNotification, setLastVisibleNotification] = useState(null);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
  const bellRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  const fetchPostTitle = async (notification) => {
    if (notification.relatedEntityId) {
      const postRef = doc(db, 'posts', notification.relatedEntityId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postTitle = postSnap.data().title;
        const truncatedTitle = postTitle.split(' ').slice(0, 7).join(' ') + '...';
        return notification.message.replace('your post', truncatedTitle);
      }
    }
    return notification.message;
  };

  useEffect(() => {
    if (currentUser) {
      const notificationsRef = collection(db, `users/${currentUser.uid}/notifications`);
      const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(10));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const notificationsList = await Promise.all(
          snapshot.docs.map(async (notificationDoc) => {
            const notification = notificationDoc.data();
            if (notification.type === 'like' || notification.type === 'comment') {
              notification.message = await fetchPostTitle(notification);
            }
            return { id: notificationDoc.id, ...notification };
          })
        );

        setNotifications(notificationsList);
        setLastVisibleNotification(snapshot.docs[snapshot.docs.length - 1]);

        const unreadExists = notificationsList.some((notification) => !notification.read);
        setHasUnreadNotifications(unreadExists);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const loadMoreNotifications = () => {
    if (!lastVisibleNotification || !currentUser) return;

    const notificationsRef = collection(db, `users/${currentUser.uid}/notifications`);
    const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(10), startAfter(lastVisibleNotification));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setHasMoreNotifications(false);
        return;
      }

      const notificationsList = await Promise.all(
        snapshot.docs.map(async (notificationDoc) => {
          const notification = notificationDoc.data();
          if (notification.type === 'like' || notification.type === 'comment') {
            notification.message = await fetchPostTitle(notification);
          }
          return { id: notificationDoc.id, ...notification };
        })
      );

      setNotifications((prevNotifications) => [...prevNotifications, ...notificationsList]);
      setLastVisibleNotification(snapshot.docs[snapshot.docs.length - 1]);
    });

    return () => unsubscribe();
  };

  const handleDropdownPosition = () => {
    if (bellRef.current && notificationsRef.current) {
      const bellRect = bellRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const notificationHeight = notificationsRef.current.offsetHeight;

      if (isMobile && bellRect.top > notificationHeight + 20) {
        setIsDropdownUp(true);
      } else {
        setIsDropdownUp(false);
      }
    }
  };

  useEffect(() => {
    handleDropdownPosition();
    window.addEventListener('resize', handleDropdownPosition);
    return () => window.removeEventListener('resize', handleDropdownPosition);
  }, [isMobile, showNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, `users/${currentUser.uid}/notifications/${notificationId}`);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);

    if (notification.type === 'like' || notification.type === 'comment') {
      navigate(`/post/${notification.relatedEntityId}`);
    } else if (notification.type === 'follower') {
      navigate(`/profile/${notification.fromUserId}`);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <>
      {isMobile ? (
        <div className="floating-bell" onClick={toggleNotifications} ref={bellRef}>
          <div className="bell-icon">
            <span role="img" aria-label="bell">
              🔔
            </span>
            {hasUnreadNotifications && <span className="red-dot" />}
          </div>
          {showNotifications && (
            <div
              ref={notificationsRef}
              className={`notifications-modal ${isDropdownUp ? 'dropdown-up' : ''}`}
            >
              <div className="notifications-inner">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <span className="icon">
                        {notification.type === 'like' && <FontAwesomeIcon icon={faThumbsUp} />}
                        {notification.type === 'comment' && <FontAwesomeIcon icon={faComment} />}
                        {notification.type === 'follower' && <FontAwesomeIcon icon={faUserPlus} />}
                      </span>
                      <p>{notification.message}</p>
                      <span className="timestamp">
                        {new Date(notification.timestamp.seconds * 1000).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No new notifications</p>
                )}
                {hasMoreNotifications && (
                  <button onClick={loadMoreNotifications}>Load More</button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="notifications-dropdown">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <span className="icon">
                  {notification.type === 'like' && <FontAwesomeIcon icon={faThumbsUp} />}
                  {notification.type === 'comment' && <FontAwesomeIcon icon={faComment} />}
                  {notification.type === 'follower' && <FontAwesomeIcon icon={faUserPlus} />}
                </span>
                <p>{notification.message}</p>
                <span className="timestamp">
                  {new Date(notification.timestamp.seconds * 1000).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p>No new notifications</p>
          )}
          {hasMoreNotifications && (
            <button onClick={loadMoreNotifications}>Load More</button>
          )}
        </div>
      )}
    </>
  );
}

export default Notifications;
