// import React, { useState, useEffect } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { db } from '../firebase';
// import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
// import { useAuth } from '../authContext';
// import './styles/RegistrationPage.css';
//
// function RegistrationPage() {
//   const { competitionId } = useParams();
//   const { currentUser } = useAuth();
//   const navigate = useNavigate();
//   const [competition, setCompetition] = useState(null);
//   const [formData, setFormData] = useState({
//     fullName: '',
//     age: '',
//     gender: '',
//     email: '',
//     phoneNumber: '',
//     city: '',
//     country: '',
//     organisation: '',
//     referralCode: '',
//     socialMedia: '',
//     fileUpload: null,
//     consent: false
//   });
//   const [isPaid, setIsPaid] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState('unpaid');
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     const fetchCompetitionDetails = async () => {
//       const compRef = doc(db, "competitions", competitionId);
//       const compSnap = await getDoc(compRef);
//
//       if (compSnap.exists()) {
//         const competitionData = compSnap.data();
//         setCompetition(competitionData);
//         setIsPaid(competitionData.isPaid || false);
//       } else {
//         console.log("No such competition!");
//       }
//       setLoading(false);
//     };
//
//     fetchCompetitionDetails();
//   }, [competitionId]);
//
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({ ...prevData, [name]: value }));
//   };
//
//   const handleFileChange = (e) => {
//     setFormData((prevData) => ({ ...prevData, fileUpload: e.target.files[0] }));
//   };
//
//   const handleConsentChange = () => {
//     setFormData((prevData) => ({ ...prevData, consent: !prevData.consent }));
//   };
//
//   const handlePayment = () => {
//     // Logic to integrate with Paytm payment gateway and update paymentStatus
//     // For simplicity, assume payment is completed successfully
//     setPaymentStatus('paid');
//     alert("Payment successful!");
//   };
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//
//     if (isPaid && paymentStatus !== 'paid') {
//       alert("Please complete the payment to proceed.");
//       return;
//     }
//
//     if (!formData.consent) {
//       alert("You must accept the privacy policy to register.");
//       return;
//     }
//
//     try {
//       await addDoc(collection(db, "registrations"), {
//         ...formData,
//         userId: currentUser.uid,
//         competitionId,
//         paymentStatus,
//         registeredAt: new Date(),
//       });
//
//       alert("Registration successful!");
//       navigate(`/competition/${competitionId}`);
//     } catch (error) {
//       console.error("Error registering for competition: ", error);
//       alert("Failed to register. Please try again.");
//     }
//   };
//
//   if (loading) {
//     return <p>Loading...</p>;
//   }
//
//   if (!competition) {
//     return <p>No competition found!</p>;
//   }
//
//   return (
//     <div className="registration-page">
//       <h2>Register for {competition.name}</h2>
//       <form onSubmit={handleSubmit} className="registration-form">
//         <input
//           type="text"
//           name="fullName"
//           placeholder="Full Name"
//           value={formData.fullName}
//           onChange={handleInputChange}
//           required
//         />
//         <input
//           type="number"
//           name="age"
//           placeholder="Age"
//           value={formData.age}
//           onChange={handleInputChange}
//           required
//         />
//         <select
//           name="gender"
//           value={formData.gender}
//           onChange={handleInputChange}
//           required
//         >
//           <option value="" disabled>Select Gender</option>
//           <option value="male">Male</option>
//           <option value="female">Female</option>
//           <option value="other">Other</option>
//         </select>
//         <input
//           type="email"
//           name="email"
//           placeholder="Email Address"
//           value={formData.email}
//           onChange={handleInputChange}
//           required
//         />
//         <input
//           type="tel"
//           name="phoneNumber"
//           placeholder="Phone Number"
//           value={formData.phoneNumber}
//           onChange={handleInputChange}
//           required
//         />
//         <input
//           type="text"
//           name="city"
//           placeholder="City"
//           value={formData.city}
//           onChange={handleInputChange}
//           required
//         />
//         <input
//           type="text"
//           name="country"
//           placeholder="Country"
//           value={formData.country}
//           onChange={handleInputChange}
//           required
//         />
//         <input
//           type="text"
//           name="organisation"
//           placeholder="Organisation/School/College"
//           value={formData.organisation}
//           onChange={handleInputChange}
//         />
//         <input
//           type="text"
//           name="referralCode"
//           placeholder="Referral Code"
//           value={formData.referralCode}
//           onChange={handleInputChange}
//         />
//         <input
//           type="text"
//           name="socialMedia"
//           placeholder="Social Media Handle"
//           value={formData.socialMedia}
//           onChange={handleInputChange}
//         />
//         <input
//           type="file"
//           onChange={handleFileChange}
//         />
//         <label>
//           <input
//             type="checkbox"
//             checked={formData.consent}
//             onChange={handleConsentChange}
//             required
//           />
//           Accept our <Link to="/privacypolicy">privacy policy</Link>
//         </label>
//         {isPaid && paymentStatus !== 'paid' && (
//           <button type="button" onClick={handlePayment}>Pay Now</button>
//         )}
//         <button type="submit" disabled={isPaid && paymentStatus !== 'paid'}>Register</button>
//       </form>
//     </div>
//   );
// }
//
// export default RegistrationPage;
