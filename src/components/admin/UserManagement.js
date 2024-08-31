import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import './styles/UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('username');
  const [sortOrder, setSortOrder] = useState('asc');
  const usersPerPage = 10; // Number of users to fetch per page
  const [error, setError] = useState(null);

  // Debounce function to handle search input
  const debounce = (func, delay) => {
    let debounceTimer;
    return function(...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Fetch users function with error handling and retry mechanism
  const fetchUsers = useCallback(async (retry = 3) => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'users'),
        orderBy(sortField, sortOrder),
        where('username', '>=', searchTerm),
        where('username', '<=', searchTerm + '\uf8ff'),
        limit(usersPerPage)
      );
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (err) {
      if (retry > 0) {
        console.warn(`Retrying... attempts left: ${retry}`);
        fetchUsers(retry - 1);
      } else {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortField, sortOrder]);

  // Load more users with pagination
  const loadMoreUsers = async () => {
    if (!lastVisible) return;
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'users'),
        orderBy(sortField, sortOrder),
        where('username', '>=', searchTerm),
        where('username', '<=', searchTerm + '\uf8ff'),
        startAfter(lastVisible),
        limit(usersPerPage)
      );
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(prevUsers => [...prevUsers, ...userList]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setPage(prevPage => prevPage + 1);
    } catch (err) {
      console.error("Error loading more users:", err);
      setError("Failed to load more users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search input with debounce
  const handleSearchChange = debounce((e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  }, 300);

  // Handle sort changes
  const handleSortChange = (field) => {
    setSortField(field);
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  };

  // Handle role change with confirmation
  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm("Are you sure you want to change the user's role?")) {
      const userRef = doc(db, 'users', userId);
      try {
        await updateDoc(userRef, { role: newRole });
        setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
      } catch (err) {
        console.error("Error updating role:", err);
        setError("Failed to update user role. Please try again.");
      }
    }
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <input
        type="text"
        placeholder="Search by username..."
        onChange={handleSearchChange}
      />
      <div className="sorting-controls">
        <button onClick={() => handleSortChange('username')}>Sort by Username</button>
        <button onClick={() => handleSortChange('email')}>Sort by Email</button>
        <button onClick={() => handleSortChange('role')}>Sort by Role</button>
        <button onClick={() => handleSortChange('lastLogin')}>Sort by Last Login</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <>
          {error && <p className="error-message">{error}</p>}
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="judge">Judge</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            {page > 1 && (
              <button onClick={() => setPage(prevPage => prevPage - 1)} disabled={loading}>
                Previous
              </button>
            )}
            {users.length >= usersPerPage && (
              <button onClick={loadMoreUsers} disabled={loading}>
                Next
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default UserManagement;
