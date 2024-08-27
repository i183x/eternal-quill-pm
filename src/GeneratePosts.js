// import React, { useEffect } from 'react';
// import { db } from './firebase'; // Adjust the path as needed
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { faker } from '@faker-js/faker';
//
// function GeneratePosts() {
//   useEffect(() => {
//     const generatePosts = async () => {
//       for (let i = 0; i < 20; i++) {
//         const title = faker.lorem.sentence();
//         const content = faker.lorem.paragraphs(5);
//
//         try {
//           await addDoc(collection(db, "posts"), {
//             title,
//             content,
//             userId: "testUserId", // Replace with a valid user ID or keep it as a test user
//             createdAt: serverTimestamp(),
//           });
//           console.log(`Post ${i + 1} created successfully`);
//         } catch (error) {
//           console.error("Error adding document: ", error);
//         }
//       }
//     };
// 
//     generatePosts();
//   }, []);
//
//   return (
//     <div>
//       <h2>Generating Posts...</h2>
//       <p>Check your Firestore database to see the new posts.</p>
//     </div>
//   );
// }
//
// export default GeneratePosts;
