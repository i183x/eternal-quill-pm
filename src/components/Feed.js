import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, startAfter, doc, updateDoc, addDoc, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './styles/Feed.css';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const postsData = await Promise.all(snapshot.docs.map(async (doc) => {
          const commentsSnapshot = await getDocs(collection(doc.ref, "comments"));
          const comments = commentsSnapshot.docs.map(commentDoc => ({
            id: commentDoc.id,
            ...commentDoc.data()
          }));
          return {
            id: doc.id,
            ...doc.data(),
            comments
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

  const fetchMorePosts = async () => {
    if (!lastDoc || fetchingMore) return;

    setFetchingMore(true);

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(10)
    );

    const snapshot = await onSnapshot(q, async (snapshot) => {
      const newPosts = await Promise.all(snapshot.docs.map(async (doc) => {
        const commentsSnapshot = await getDocs(collection(doc.ref, "comments"));
        const comments = commentsSnapshot.docs.map(commentDoc => ({
          id: commentDoc.id,
          ...commentDoc.data()
        }));
        return {
          id: doc.id,
          ...doc.data(),
          comments
        };
      }));
      setPosts(prevPosts => [...prevPosts, ...newPosts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setFetchingMore(false);
    });
  };

  const handleLike = async (postId) => {
    const postRef = doc(db, "posts", postId);
    const post = posts.find(post => post.id === postId);
    const likes = post.likes || [];

    // Replace "yourUserId" with the actual user ID
    if (likes.includes("yourUserId")) {
      const newLikes = likes.filter(like => like !== "yourUserId");
      await updateDoc(postRef, { likes: newLikes });
    } else {
      await updateDoc(postRef, { likes: [...likes, "yourUserId"] });
    }
  };

  const handleCommentSubmit = async (postId, comment) => {
    const postRef = doc(db, "posts", postId);
    const commentsRef = collection(postRef, "comments");

    try {
      await addDoc(commentsRef, {
        content: comment,
        userId: "yourUserId", // Replace with actual user ID
        createdAt: new Date(),
      });
      setNewComment({ ...newComment, [postId]: "" });
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const handleShare = (postId) => {
    const shareURL = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareURL).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const truncateContent = (content, maxLength) => {
    // Remove HTML tags using a regular expression
    const plainText = content.replace(/<[^>]+>/g, '');
    if (plainText.length <= maxLength) {
      return plainText;
    }
    return plainText.slice(0, maxLength) + '...';
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
        document.documentElement.offsetHeight
      )
        return;
      fetchMorePosts();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastDoc, fetchingMore]);

  return (
    <div className="feed">
      <h2>Feed</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="post">
            <h3>{post.title}</h3>
            <p>{truncateContent(post.content, 100)}</p>
            <Link to={`/post/${post.id}`}>Read More</Link>
            <div>
              <button onClick={() => handleLike(post.id)}>
                {post.likes && post.likes.includes("yourUserId") ? "Unlike" : "Like"} {/* Replace with actual user ID */}
              </button>
              <button onClick={() => handleShare(post.id)}>Share</button>
            </div>
            <div>
              <h4>Comments:</h4>
              {post.comments && post.comments.map((comment) => (
                <p key={comment.id}><strong>Anonymous:</strong>{comment.content}</p>
              ))}
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCommentSubmit(post.id, newComment[post.id] || "");
              }}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment[post.id] || ""}
                  onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                />
                <button type="submit">Comment</button>
              </form>
            </div>
          </div>
        ))
      )}
      {fetchingMore && <p>Loading more posts...</p>}
    </div>
  );
}

export default Feed;
