import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [studentDetails, setStudentDetails] = useState({});
  const [name, setName] = useState('');
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
          setStudentDetails(data);
          setName(data.full_name || '');
          
          // Sync localStorage
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
        body: JSON.stringify({ 
          full_name: name, 
          email: studentDetails.email 
        })
      });

      if (response.ok) {
        const updatedUser = { ...user, full_name: name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage('Profile updated successfully!');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <div className="profile-container">
      <div className="nav-bar">
        <Link to="/dashboard">← Back to Dashboard</Link>
      </div>
      
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <h2>Profile Settings</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Manage your personal account details.</p>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Full Name:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Roll Number:</label>
            <input 
              type="text" 
              value={studentDetails.roll_number || ''} 
              disabled 
              style={{ background: '#f8f9fa' }}
            />
            <small style={{ color: '#6c757d' }}>Roll number is a permanent identifier.</small>
          </div>

          <div className="form-group">
            <label>Email Address:</label>
            <input 
              type="text" 
              value={studentDetails.email || ''} 
              disabled 
              style={{ background: '#f8f9fa' }}
            />
            <small style={{ color: '#6c757d' }}>Email cannot be changed from this page.</small>
          </div>

          <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <button type="submit">Update Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
