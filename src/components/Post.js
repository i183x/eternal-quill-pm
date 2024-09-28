// src/components/Post.js

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot } from 'firebase/firestore';
import DOMPurify from 'dompurify';
import { useAuth } from '../authContext';
import LoginModal from './LoginModal';
import { createNotification } from '../services/notificationsService'; // Import notification function
import './styles/Post.css';

function Post() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const postData = docSnap.data();
        setPost(postData);
        setLikes(postData.likes || []);

        const authorRef = doc(db, "users", postData.userId);
        const authorSnap = await getDoc(authorRef);
        if (authorSnap.exists()) {
          setAuthor(authorSnap.data());
        }
      } else {
        console.log("No such post!");
        setPost(null);
      }
      setLoading(false);
    };

    const fetchComments = () => {
      const commentsRef = collection(db, "posts", id, "comments");
      onSnapshot(commentsRef, (snapshot) => {
        const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComments(fetchedComments);
      });
    };

    fetchPost();
    fetchComments();
  }, [id]);

  const handleLike = async () => {
    if (!currentUser) {
      setIsModalVisible(true);
      return;
    }

    const docRef = doc(db, "posts", id);
    let updatedLikes = [...likes];
    if (likes.includes(currentUser.uid)) {
      updatedLikes = updatedLikes.filter(like => like !== currentUser.uid);
    } else {
      updatedLikes.push(currentUser.uid);
      // Trigger a notification for the post author after liking the post
      await createNotification(post.userId, `${currentUser.displayName} liked your post`, "like", id, currentUser.uid);
    }

    setLikes(updatedLikes);
    await updateDoc(docRef, { likes: updatedLikes });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setIsModalVisible(true);
      return;
    }

    if (newComment.trim() === '') {
      alert("Comment cannot be empty.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const commentsRef = collection(db, "posts", id, "comments");
      await addDoc(commentsRef, {
        content: newComment,
        userId: currentUser.uid,
        createdAt: new Date(),
      });

      // Trigger a notification for the post author after a comment is submitted
      await createNotification(post.userId, `${currentUser.displayName} commented on your post`, "comment", id, currentUser.uid);

      setNewComment('');
    } catch (error) {
      console.error("Error adding comment: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setIsModalVisible(false);

  const redirectToPost = () => {
    closeModal();
    window.location.reload();
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!post) {
    return <p>No post found!</p>;
  }

  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <div className="post">
      <h2>{post.title}</h2>
      <p className="post-author">
        By <Link to={`/profile/${post.userId}`} className="author-link">
          {author ? author.username : 'Anonymous'}
        </Link>
      </p>
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />

      <div className="post-actions">
        <button onClick={handleLike}>
          {likes.includes(currentUser?.uid) ? 'Unlike' : 'Like'} ({likes.length})
        </button>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        {comments.length > 0 ? (
          <ul>
            {comments.map(comment => (
              <li key={comment.id} className={comment.userId === post.userId ? 'comment-highlight' : ''}>
                <strong>Anonymous</strong>
                {comment.userId === post.userId && <span className="badge">Author</span>}
                : {comment.content}
                <span className="comment-timestamp">{new Date(comment.createdAt.seconds * 1000).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments yet.</p>
        )}

        {!currentUser && (
          <p className="login-to-comment">
            <Link onClick={() => setIsModalVisible(true)}>Login to comment</Link>
          </p>
        )}

        {currentUser && (
          <form onSubmit={handleCommentSubmit}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
            />
            <button type="submit" disabled={isSubmitting || !newComment.trim()}>Comment</button>
          </form>
        )}
      </div>

      <LoginModal isVisible={isModalVisible} onClose={closeModal} redirectTo={redirectToPost} />
    </div>
  );
}

export default Post;
