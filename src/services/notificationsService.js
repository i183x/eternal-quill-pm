import { doc, addDoc, collection, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';

/**
 * Create a notification for a user.
 * @param {string} userId - ID of the user who will receive the notification.
 * @param {string} message - The notification message.
 * @param {string} type - Type of notification (e.g., "follower", "like", "comment").
 * @param {string} relatedEntityId - (Optional) ID of the post or user related to the notification.
 * @param {string} fromUserId - ID of the user who triggered the notification.
 * @param {string} competitionId - (Optional) ID of the competition if related.
 */
export async function createNotification(userId, message, type, relatedEntityId = null, fromUserId = null, competitionId = null) {
  try {
    let finalMessage = message;

    // If the notification is for a like or comment, fetch the post title
    if ((type === 'like' || type === 'comment') && relatedEntityId) {
      const postRef = doc(db, "posts", relatedEntityId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postTitle = postSnap.data().title;
        const truncatedTitle = postTitle.split(' ').slice(0, 7).join(' ') + '...'; // Truncate to 7 words
        finalMessage = message.replace("your post", truncatedTitle); // Replace "your post" with the truncated title
      }
    }

    const notificationsRef = collection(db, `users/${userId}/notifications`);
    await addDoc(notificationsRef, {
      message: finalMessage,
      type: type,
      relatedEntityId: relatedEntityId,
      fromUserId: fromUserId,
      competitionId: competitionId,
      timestamp: serverTimestamp(),
      read: false,
    });
    console.log('Notification created successfully for:', userId);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}
