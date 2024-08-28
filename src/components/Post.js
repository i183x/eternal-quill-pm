import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot } from 'firebase/firestore';
import DOMPurify from 'dompurify';
import { useAuth } from '../authContext';
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

  useEffect(() => {
    const fetchPost = async () => {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const postData = docSnap.data();
        setPost(postData);
        setLikes(postData.likes || []);

        // Fetch the author's information
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
      alert("You must be logged in to like a post.");
      return;
    }

    const docRef = doc(db, "posts", id);
    let updatedLikes = [...likes];
    if (likes.includes(currentUser.uid)) {
      updatedLikes = updatedLikes.filter(like => like !== currentUser.uid);
    } else {
      updatedLikes.push(currentUser.uid);
    }

    setLikes(updatedLikes);
    await updateDoc(docRef, { likes: updatedLikes });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to comment.");
      return;
    }

    if (newComment.trim() === '') {
      alert("Comment cannot be empty.");
      return;
    }

    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);

    try {
      const commentsRef = collection(db, "posts", id, "comments");
      await addDoc(commentsRef, {
        content: newComment,
        userId: currentUser.uid,
        createdAt: new Date(),
      });
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment: ", error);
    } finally {
      setIsSubmitting(false);
    }
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
          {author ? author.username : 'Unknown Author'}
        </Link>
      </p>
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />

      {/* Likes Section */}
      <div className="post-actions">
        <button onClick={handleLike} disabled={!currentUser}>
          {likes.includes(currentUser?.uid) ? 'Unlike' : 'Like'} ({likes.length})
        </button>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h3>Comments</h3>
        {comments.length > 0 ? (
          <ul>
            {comments.map(comment => (
              <li key={comment.id} className={comment.userId === post.userId ? 'comment-highlight' : ''}>
                <strong>{comment.userId}</strong>
                {comment.userId === post.userId && <span className="badge">Author</span>}
                : {comment.content}
                <span className="comment-timestamp">{new Date(comment.createdAt.seconds * 1000).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments yet.</p>
        )}

        {/* Add Comment */}
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
    </div>
  );
}

export default Post;
