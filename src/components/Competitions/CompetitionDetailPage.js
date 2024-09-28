// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { db } from '../firebase';
// import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
// import { useAuth } from '../authContext';
// import './styles/CompetitionDetailPage.css';
//
// function CompetitionDetailPage() {
//   const { competitionId } = useParams();
//   const { currentUser } = useAuth();
//   const [competition, setCompetition] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [writeUp, setWriteUp] = useState('');
//   const [error, setError] = useState('');
//
//   useEffect(() => {
//     const fetchCompetitionDetails = async () => {
//       try {
//         const compRef = doc(db, "competitions", competitionId);
//         const compSnap = await getDoc(compRef);
//
//         if (compSnap.exists()) {
//           setCompetition(compSnap.data());
//         } else {
//           setError('Competition not found');
//           console.error("No such competition!");
//         }
//       } catch (err) {
//         setError('Error loading competition data');
//         console.error("Error fetching competition details: ", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     fetchCompetitionDetails();
//   }, [competitionId]);
//
//   const handleSubmitWriteUp = async () => {
//     if (!competition) {
//       alert("Competition not loaded. Please try again later.");
//       return;
//     }
//
//     const currentDateTime = new Date();
//     const competitionStartDate = competition?.startDateTime?.toDate();
//
//     if (currentDateTime < competitionStartDate) {
//       alert("The competition hasn't started yet. Please wait until the start time.");
//       return;
//     }
//
//     if (writeUp.trim() === '') {
//       alert("Please enter your write-up.");
//       return;
//     }
//
//     try {
//       await addDoc(collection(db, "posts"), {
//         competitionId,
//         userId: currentUser.uid,
//         content: writeUp,
//         createdAt: new Date(),
//       });
//       alert("Write-up submitted successfully!");
//       setWriteUp('');
//     } catch (error) {
//       console.error("Error submitting write-up: ", error);
//       alert("Failed to submit. Please try again.");
//     }
//   };
//
//   if (loading) {
//     return <p>Loading...</p>;
//   }
//
//   if (error) {
//     return (
//       <div className="competition-detail-page">
//         <h2>Error</h2>
//         <p>{error}</p>
//       </div>
//     );
//   }
//
//   if (!competition) {
//     return (
//       <div className="competition-detail-page">
//         <h2>Competition Not Found</h2>
//         <p>Sorry, we couldn't find the competition you are looking for.</p>
//       </div>
//     );
//   }
//
//   const currentDateTime = new Date();
//   const competitionStartDate = competition?.startDateTime?.toDate();
//
//   return (
//     <div className="competition-detail-page">
//       <h2>{competition.name || "Unnamed Competition"}</h2>
//       {currentDateTime < competitionStartDate ? (
//         <p>
//           We appreciate your patience, the competition will start at{" "}
//           {competitionStartDate ? competitionStartDate.toLocaleString() : "a future date"}.
//         </p>
//       ) : (
//         <div className="write-up-section">
//           <textarea
//             placeholder="Enter your write-up here..."
//             value={writeUp}
//             onChange={(e) => setWriteUp(e.target.value)}
//             className="write-up-input"
//           />
//           <button onClick={handleSubmitWriteUp} className="submit-btn">
//             Submit Write-Up
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
//
// export default CompetitionDetailPage;
