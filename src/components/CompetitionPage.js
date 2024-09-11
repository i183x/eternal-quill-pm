import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../authContext';
import { useNavigate } from 'react-router-dom';
import './styles/CompetitionPage.css';

function CompetitionPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      const competitionsSnapshot = await getDocs(collection(db, "competitions"));

      const ongoingCompetitions = competitionsSnapshot.docs
        .filter(doc => !doc.data().isComplete)
        .map(doc => ({ id: doc.id, ...doc.data() }));

      setCompetitions(ongoingCompetitions);
    };

    fetchCompetitions();
  }, []);

  const handleCompetitionSelect = async (competitionId) => {
    const selected = competitions.find(comp => comp.id === competitionId);
    setSelectedCompetition(selected);

    // Ensure the fields are defined before calling toDate()
    const registrationDeadline = selected?.registrationEnd instanceof Date ? selected?.registrationEnd.toDate() : null;
    const competitionStartDate = selected?.startTime instanceof Date ? selected?.startTime.toDate() : null;
    const currentDateTime = new Date();

    // Check if user is already registered
    const registrationRef = doc(db, "registrations", `${competitionId}_${currentUser.uid}`);
    const registrationSnap = await getDoc(registrationRef);

    if (registrationSnap.exists()) {
      // User is already registered, check competition start
      if (competitionStartDate && currentDateTime >= competitionStartDate) {
        // Competition has started
        navigate(`/competition/${competitionId}`);
      } else {
        // Competition hasn't started yet
        alert(`You have already registered. Wait for the competition to start.`);
      }
    } else {
      // User is not registered, check registration deadline
      if (registrationDeadline && currentDateTime > registrationDeadline) {
        alert("Registration has closed for this competition.");
      } else {
        navigate(`/register/${competitionId}`);
      }
    }
  };

  return (
    <div className="competition-page">
      <h1> Ignore this page for now, it's under development!!</h1>

      <h2>Competitions</h2>

      <div className="ongoing-competitions">
        <h3>Ongoing Competitions</h3>
        <ul>
          {competitions.map(comp => (
            <li key={comp.id}>
              <button onClick={() => handleCompetitionSelect(comp.id)}>
                {comp.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CompetitionPage;
