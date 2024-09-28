// src/components/Feed.js

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, startAfter, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../authContext';
import './styles/Feed.css';

const sanitizeContent = (content) => {
  let sanitizedContent = DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

  sanitizedContent = sanitizedContent.replace(/&nbsp;/g, ' ')
                                     .replace(/&amp;/g, '&')
                                     .replace(/&lt;/g, '<')
                                     .replace(/&gt;/g, '>')
                                     .replace(/&quot;/g, '"')
                                     .replace(/&#39;/g, "'");

  return sanitizedContent.trim();
};

function Feed() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  // Initial fetch for posts
  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const postsData = await Promise.all(snapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          let authorData = null;

          // Fetch author details
          if (postData.userId) {
            const authorRef = doc(db, "users", postData.userId);
            const authorSnap = await getDoc(authorRef);
            if (authorSnap.exists()) {
              authorData = authorSnap.data();
            }
          }

          return {
            id: postDoc.id,
            ...postData,
            authorName: authorData?.username || 'Anonymous',
            authorAvatar: authorData?.profilePictureURL || '/default-avatar.png',
          };
        }));

        setPosts(postsData);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchPosts();
  }, []);

  // Fetch more posts when scrolling
  const fetchMorePosts = useCallback(async () => {
    if (!lastDoc || fetchingMore) return;

    setFetchingMore(true);

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newPosts = await Promise.all(snapshot.docs.map(async (postDoc) => {
        const postData = postDoc.data();
        let authorData = null;

        // Fetch author details
        if (postData.userId) {
          const authorRef = doc(db, "users", postData.userId);
          const authorSnap = await getDoc(authorRef);
          if (authorSnap.exists()) {
            authorData = authorSnap.data();
          }
        }

        return {
          id: postDoc.id,
          ...postData,
          authorName: authorData?.username || 'Anonymous',
          authorAvatar: authorData?.profilePicture || '/default-avatar.png',
        };
      }));

      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setFetchingMore(false);
    });

    return () => unsubscribe();
  }, [lastDoc, fetchingMore]);

  // Detect when user is near the bottom of the page
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const offsetHeight = document.documentElement.offsetHeight;

      if (scrollPosition >= offsetHeight - 300 && !loading && !fetchingMore) {
        fetchMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fetchMorePosts, loading, fetchingMore]);

  const truncateContentToLines = (content, maxLines) => {
    const sanitizedContent = sanitizeContent(content);
    const lines = sanitizedContent.split('\n');
    if (lines.length <= maxLines) {
      return lines.join('\n');
    }
    return lines.slice(0, maxLines).join('\n') + '...';
  };

  return (
    <div className="feed">
      <h2>Feed</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="feed-grid">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="author-info">
                  <img src={post.authorAvatar} alt={post.authorName} className="author-avatar" />
                  <div>
                    <p className="author-name">{post.authorName}</p>
                  </div>
                </div>
              </div>
              <h3 className="post-title">{post.title}</h3>
              <div className="post-content-preview">
                <p>{truncateContentToLines(post.content, 7)}</p>
                <div className="gradient-overlay"></div>
              </div>
              <Link to={`/post/${post.id}`} className="read-more">Read More</Link>
            </div>
          ))}
        </div>
      )}
      {fetchingMore && <p>Loading more posts...</p>}
    </div>
  );
}

export default Feed;
