import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const studentId = user.student_id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!studentId) return;
        const response = await fetchWithToken(`http://localhost:5001/api/students/${studentId}`);
        if (response.ok) {
          const data = await response.json();
          // Backend uses full_name and email
          setName(data.full_name || '');
          setEmail(data.email || '');
          
          // Update localStorage if the server has newer data
          const updatedUser = { ...user, full_name: data.full_name, email: data.email };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        } else {
          setError('Failed to fetch profile.');
        }
      } catch (err) {
        setError('Network error.');
      }
    };
    fetchProfile();
  }, [studentId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (!studentId) return;
      const response = await fetchWithToken(`http://localhost:5001/api/students/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify({ full_name: name, email })
      });

      if (response.ok) {
        const updatedUser = { ...user, full_name: name, email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <div>
      <div className="nav-bar">
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
      <h2>My Profile</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      
      <div className="card">
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Full Name:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              disabled={!isEditing}
              required 
            />
          </div>
          <div className="form-group">
            <label>Email Address:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={!isEditing}
              required 
            />
          </div>
          
          {isEditing ? (
            <div style={{ marginTop: '15px' }}>
              <button type="submit">Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)} style={{ background: '#6c757d', marginLeft: '10px' }}>Cancel</button>
            </div>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)}>Edit Profile</button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
