// src/components/Write.js

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../authContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './styles/Write.css';

function Write() {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save draft every 60 seconds
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (content && charCount <= 20000) {
        handleAutoSave();
      }
    }, 60000); // Auto-save every 60 seconds

    return () => clearInterval(autoSave);
  }, [content, charCount]);

  const handleContentChange = (value) => {
    setContent(value);
    setCharCount(value.replace(/<[^>]+>/g, '').length); // Remove HTML tags to count characters
  };

  const handleAutoSave = async () => {
    setIsSaving(true);
    try {
      // Logic to save the draft (not creating a new post but storing in a temporary location)
      console.log('Auto-saving draft...');
      // You can implement the actual auto-save logic here
    } catch (error) {
      console.error('Error auto-saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Title validation
    if (title.trim().length === 0) {
      alert("Title cannot be empty or just spaces. Please provide a title.");
      return;
    }

    if (title.length < 3 || title.length > 100) {
      alert("Title must be between 3 and 100 characters.");
      return;
    }

    // Content validation
    if (charCount < 10) {
      alert("Content must be at least 10 characters long.");
      return;
    }

    if (charCount > 20000) {
      alert("Content exceeds 20,000 characters.");
      return;
    }

    try {
      setIsSaving(true);
      await addDoc(collection(db, "posts"), {
        title,
        content,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        likes: [],
      });
      alert("Post created successfully!");
      setTitle('');
      setContent('');
      setCharCount(0);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to submit the post. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="write">
      <h2>Create a Post</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title (3-100 characters)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <ReactQuill
          value={content}
          onChange={handleContentChange}
          placeholder="Write your content here..."
          modules={{
            toolbar: [
              [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
              [{ size: [] }],
              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'align': [] }],
              ['clean']
            ]
          }}
          formats={[
            'header', 'font', 'size',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet',
            'align'
          ]}
        />
        <p>Character Count: {charCount}/20000</p>
        <button type="submit" disabled={isSaving}>Post</button>
      </form>
      {isSaving && <p>Saving...</p>}
    </div>
  );
}

export default Write;
