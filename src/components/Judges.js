import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import './styles/Judges.css';

function Judges() {
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchCompetitions = async () => {
      const q = query(collection(db, "competitions"), where("panelists", "array-contains", "yourUserId"));
      const querySnapshot = await getDocs(q);
      const comps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompetitions(comps);
      setLoading(false);
    };

    fetchCompetitions();
  }, []);

  const selectCompetition = async (competitionId) => {
    setLoading(true);
    setSelectedCompetition(competitionId);

    const q = query(collection(db, `competitions/${competitionId}/submissions`));
    const querySnapshot = await getDocs(q);
    const subs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSubmissions(subs);
    setLoading(false);
  };

  const handleRatingChange = (submissionId, criterion, value) => {
    setRatings(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [criterion]: value
      }
    }));
  };

  const handleFeedbackChange = (submissionId, value) => {
    setFeedback(prev => ({
      ...prev,
      [submissionId]: value
    }));
  };

  const submitRatings = async (submissionId) => {
    const submissionRef = doc(db, `competitions/${selectedCompetition}/submissions`, submissionId);
    await updateDoc(submissionRef, {
      ratings: ratings[submissionId],
      feedback: feedback[submissionId]
    });
    alert("Ratings submitted!");
  };

  useEffect(() => {
    if (submissions.length > 0) {
      const ratedSubmissions = submissions.filter(sub => ratings[sub.id]);
      setProgress((ratedSubmissions.length / submissions.length) * 100);
    }
  }, [ratings, submissions]);

  return (
    <div className="judges">
      <h2>Competitions</h2>
      {loading ? <p>Loading...</p> : (
        <div>
          <ul className="competition-list">
            {competitions.map(comp => (
              <li key={comp.id} onClick={() => selectCompetition(comp.id)} className={selectedCompetition === comp.id ? 'active' : ''}>
                {comp.name} - {comp.organization}
              </li>
            ))}
          </ul>

          {selectedCompetition && (
            <div className="submissions-section">
              <h3>Submissions</h3>
              <p>Progress: {progress}%</p>
              {submissions.map(sub => (
                <div key={sub.id} className="submission">
                  <h4>{sub.title}</h4>
                  <p>{sub.content}</p>

                  <div className="ratings-section">
                    <h5>Rate this submission:</h5>
                    {['Creativity', 'Content Quality', 'Writing Style', 'Research and Analysis', 'Organization and Structure', 'Grammar and Mechanics', 'Relevance and Timeliness', 'Engagement and Persuasiveness', 'Use of Examples and Anecdotes', 'Originality of Argument', 'Tone and Voice', 'Adherence to Theme', 'Overall Impact'].map(criterion => (
                      <div key={criterion} className="rating-input">
                        <label>{criterion}: </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={ratings[sub.id]?.[criterion] || ''}
                          onChange={(e) => handleRatingChange(sub.id, criterion, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="feedback-section">
                    <h5>Feedback:</h5>
                    <textarea
                      value={feedback[sub.id] || ''}
                      onChange={(e) => handleFeedbackChange(sub.id, e.target.value)}
                      placeholder="Leave feedback here..."
                    />
                  </div>

                  <button onClick={() => submitRatings(sub.id)} className="submit-btn">Submit Ratings</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Judges;
