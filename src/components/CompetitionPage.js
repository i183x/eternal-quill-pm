import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../authContext';
import './styles/CompetitionPage.css';

function CompetitionPage() {
  const { currentUser } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [writeUp, setWriteUp] = useState('');
  const [pastCompetitions, setPastCompetitions] = useState([]);

  useEffect(() => {
    const fetchCompetitions = async () => {
      const competitionsSnapshot = await getDocs(collection(db, "competitions"));

      const ongoingCompetitions = competitionsSnapshot.docs
        .filter(doc => !doc.data().isComplete)
        .map(doc => ({ id: doc.id, ...doc.data() }));
      const completedCompetitions = competitionsSnapshot.docs
        .filter(doc => doc.data().isComplete)
        .map(doc => ({ id: doc.id, ...doc.data() }));

      setCompetitions(ongoingCompetitions);
      setPastCompetitions(completedCompetitions);
    };

    fetchCompetitions();
  }, []);

  const handleCompetitionSelect = (competitionId) => {
    const selected = competitions.find(comp => comp.id === competitionId);
    setSelectedCompetition(selected);
  };

  const handleSubmitWriteUp = async () => {
    if (!selectedCompetition) {
      alert("Please select a competition.");
      return;
    }

    if (writeUp.trim() === '') {
      alert("Please enter your write-up.");
      return;
    }

    await addDoc(collection(db, "posts"), {
      competitionId: selectedCompetition.id,
      userId: currentUser.uid,
      content: writeUp,
      createdAt: new Date(),
    });

    alert("Write-up submitted successfully!");
    setWriteUp('');
  };

  return (
    <div className="competition-page">
      <h2>Competitions</h2>

      {/* Ongoing Competitions Section */}
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

      {/* Write-Up Submission Section */}
      {selectedCompetition && (
        <div className="write-up-section">
          <h3>{selectedCompetition.name}</h3>
          <p>{selectedCompetition.description}</p>
          <textarea
            placeholder="Enter your write-up here..."
            value={writeUp}
            onChange={(e) => setWriteUp(e.target.value)}
            className="write-up-input"
          />
          <button onClick={handleSubmitWriteUp} className="submit-btn">Submit Write-Up</button>
        </div>
      )}

      {/* Past Competitions Section */}
      <div className="past-competitions">
        <h3>Past Competitions</h3>
        <ul>
          {pastCompetitions.map(comp => (
            <li key={comp.id}>
              <h4>{comp.name}</h4>
              <p>{comp.description}</p>
              <h5>Top 3 Winners</h5>
              <ol>
                {comp.winners && comp.winners.map(winnerId => (
                  <li key={winnerId}>
                    {winnerId} {/* Here, you would typically fetch and display the username */}
                  </li>
                ))}
              </ol>
              <button onClick={() => alert('View Winning Write-Up functionality coming soon!')}>
                View Winning Write-Ups
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CompetitionPage;
