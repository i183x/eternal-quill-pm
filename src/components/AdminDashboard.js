import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './styles/AdminDashboard.css';

function AdminDashboard() {
  const [competitions, setCompetitions] = useState([]);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [panelists, setPanelists] = useState([]);
  const [selectedPanelists, setSelectedPanelists] = useState([]);
  const [newCompetition, setNewCompetition] = useState({
    name: '',
    description: '',
    rules: '',
    isPublic: true,
    organisation: '',
    subCategory: ''
  });
  const [organisations, setOrganisations] = useState([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const competitionsSnapshot = await getDocs(collection(db, "competitions"));
      const usersSnapshot = await getDocs(collection(db, "users"));
      const postsSnapshot = await getDocs(collection(db, "posts"));
      const organisationsSnapshot = await getDocs(collection(db, "organisations"));

      const allPanelists = usersSnapshot.docs.filter(doc => doc.data().role === 'panelist');

      setCompetitions(competitionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setPosts(postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setPanelists(allPanelists.map(doc => ({ id: doc.id, ...doc.data() })));
      setOrganisations(organisationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleDeleteCompetition = async (competitionId) => {
    await deleteDoc(doc(db, "competitions", competitionId));
    setCompetitions(competitions.filter(competition => competition.id !== competitionId));
  };

  const handleMarkAsComplete = async (competitionId) => {
    await updateDoc(doc(db, "competitions", competitionId), {
      isComplete: true
    });
    alert("Competition marked as complete!");
  };

  const handleAnnounceWinners = async (competitionId, winners) => {
    await updateDoc(doc(db, "competitions", competitionId), {
      winners: winners
    });
    alert("Winners announced!");
  };

  const handleCreateCompetition = async () => {
    if (!newCompetition.isPublic && !newCompetition.organisation) {
      alert("Please select or add an organisation for private competitions.");
      return;
    }
    await addDoc(collection(db, "competitions"), {
      ...newCompetition,
      createdAt: new Date(),
      isComplete: false,
      winners: [],
      panelists: []
    });
    setNewCompetition({ name: '', description: '', rules: '', isPublic: true, organisation: '', subCategory: '' });
    const competitionsSnapshot = await getDocs(collection(db, "competitions"));
    setCompetitions(competitionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddOrganisation = async () => {
    const orgName = prompt("Enter the new organisation name:");
    if (orgName) {
      const orgRef = await addDoc(collection(db, "organisations"), { name: orgName });
      setOrganisations([...organisations, { id: orgRef.id, name: orgName }]);
      setNewCompetition({ ...newCompetition, organisation: orgRef.id });
    }
  };

  const handleAssignPanelists = async () => {
    if (selectedCompetitionId === '' || selectedPanelists.length === 0) {
      alert("Please select a competition and at least one panelist.");
      return;
    }

    const competitionRef = doc(db, "competitions", selectedCompetitionId);
    await updateDoc(competitionRef, {
      panelists: arrayUnion(...selectedPanelists)
    });

    alert("Panelists assigned successfully!");
    setSelectedPanelists([]);
  };

  const handleDeleteUser = async (userId) => {
    await deleteDoc(doc(db, "users", userId));
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleDeletePost = async (postId) => {
    await deleteDoc(doc(db, "posts", postId));
    setPosts(posts.filter(post => post.id !== postId));
  };

  const togglePanelistSelection = (panelistId) => {
    setSelectedPanelists(prev =>
      prev.includes(panelistId)
        ? prev.filter(id => id !== panelistId)
        : [...prev, panelistId]
    );
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <nav>
            <ul>
              <li><a href="#create-competition">Create New Competition</a></li>
              <li><a href="#manage-competitions">Manage Competitions</a></li>
              <li><a href="#assign-panelists">Assign Panelists</a></li>
              <li><a href="#manage-users">Manage Users</a></li>
              <li><a href="#manage-posts">Manage Posts</a></li>
            </ul>
          </nav>

          {/* Create New Competition Section */}
          <div id="create-competition">
            <h3>Create New Competition</h3>
            <input
              type="text"
              placeholder="Competition Name"
              value={newCompetition.name}
              onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={newCompetition.description}
              onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
            />
            <textarea
              placeholder="Rules"
              value={newCompetition.rules}
              onChange={(e) => setNewCompetition({ ...newCompetition, rules: e.target.value })}
            />
            <label>
              Public:
              <input
                type="radio"
                checked={newCompetition.isPublic}
                onChange={() => setNewCompetition({ ...newCompetition, isPublic: true, organisation: '', subCategory: '' })}
              />
            </label>
            <label>
              Private:
              <input
                type="radio"
                checked={!newCompetition.isPublic}
                onChange={() => setNewCompetition({ ...newCompetition, isPublic: false })}
              />
              {!newCompetition.isPublic && (
                <>
                  <select
                    value={newCompetition.organisation}
                    onChange={(e) => setNewCompetition({ ...newCompetition, organisation: e.target.value })}
                  >
                    <option value="">Select Organisation</option>
                    {organisations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                  <button onClick={handleAddOrganisation}>Add Organisation</button>

                  <input
                    type="text"
                    placeholder="Sub-Category (e.g., Club > Event)"
                    value={newCompetition.subCategory}
                    onChange={(e) => setNewCompetition({ ...newCompetition, subCategory: e.target.value })}
                  />
                </>
              )}
            </label>
            <button onClick={handleCreateCompetition}>Create Competition</button>
          </div>

          {/* Manage Competitions Section */}
          <div id="manage-competitions">
            <h3>Manage Competitions</h3>
            <ul>
              {competitions.map(competition => (
                <li key={competition.id} className="list-item">
                  <div className="item-content">
                    <p>{competition.name}</p>
                    <div className="buttons-container">
                      <button onClick={() => handleMarkAsComplete(competition.id)}>Mark as Complete</button>
                      <button onClick={() => handleAnnounceWinners(competition.id, prompt("Enter the top 3 winner user IDs separated by commas:").split(','))}>Announce Winners</button>
                      <button onClick={() => handleDeleteCompetition(competition.id)}>Delete</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Assign Panelists Section */}
          <div id="assign-panelists">
            <h3>Assign Panelists</h3>
            <select onChange={(e) => setSelectedCompetitionId(e.target.value)}>
              <option value="">Select Competition</option>
              {competitions.map(competition => (
                <option key={competition.id} value={competition.id}>{competition.name}</option>
              ))}
            </select>
            <div className="panelists-container">
              {panelists.map(panelist => (
                <div key={panelist.id} className="panelist-item">
                  <input
                    type="checkbox"
                    id={`panelist-${panelist.id}`}
                    value={panelist.id}
                    checked={selectedPanelists.includes(panelist.id)}
                    onChange={() => togglePanelistSelection(panelist.id)}
                  />
                  <label htmlFor={`panelist-${panelist.id}`}>{panelist.username}</label>
                </div>
              ))}
            </div>
            <button onClick={handleAssignPanelists}>Assign Panelists</button>
          </div>

          {/* Manage Users Section */}
          <div id="manage-users">
            <h3>Manage Users</h3>
            <ul>
              {users.map(user => (
                <li key={user.id} className="list-item">
                  <div className="item-content">
                    <Link to={`/profile/${user.id}`}>{user.username}</Link>
                    <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Manage Posts Section */}
          <div id="manage-posts">
            <h3>Manage Posts</h3>
            <ul>
              {posts.map(post => (
                <li key={post.id} className="list-item">
                  <div className="item-content">
                    <Link to={`/profile/${post.userId}`}>{users.find(user => user.id === post.userId)?.username || 'Unknown User'}</Link> -
                    <Link to={`/post/${post.id}`}>{post.title}</Link>
                    <button onClick={() => handleDeletePost(post.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
