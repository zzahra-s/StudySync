import React, { useState, useEffect } from 'react';
import { fetchWithToken } from '../utils/fetchWithToken';

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const studentId = user.id || user.student_id;
    if (!studentId) return;

    const fetchProfile = async () => {
      try {
        const response = await fetchWithToken(`http://localhost:5001/api/students/${studentId}`);
        const data = await response.json();
        if (response.ok) {
          setName(data.full_name || data.name || '');
          setEmail(data.email || '');
        } else {
          setError('Failed to fetch profile.');
        }
      } catch (err) {
        setError('Network error.');
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const id = user.id || user._id;
      const response = await fetchWithToken(`http://localhost:5001/api/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ full_name: name, email })
      });

      if (response.ok) {
        const updatedUser = { ...user, name, email };
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Keep storage in sync
        setUser(updatedUser);
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError('Failed to update profile.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <div className="page-container">
      <h2>My Profile</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      
      <div className="card">
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Name:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              disabled={!isEditing}
              required 
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={!isEditing}
              required 
            />
          </div>
          
          {isEditing ? (
            <div>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} style={{ background: '#6c757d' }}>Cancel</button>
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
