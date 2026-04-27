import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div>
      <div className="nav-bar flex-between">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="StudySync Logo" className="logo" />
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/semesters">Semesters</Link>
        </div>
        <button onClick={handleLogout} style={{ background: '#dc3545', margin: 0 }}>Logout</button>
      </div>

      <h2>Welcome, {user.name || 'Student'}!</h2>
      
      <div className="card">
        <h3>Manage Your Profile</h3>
        <p>Update your personal information and contact details.</p>
        <button onClick={() => navigate('/profile')}>Go to Profile</button>
      </div>

      <div className="card">
        <h3>Your Semesters</h3>
        <p>View semesters, add courses, and enter grades.</p>
        <button onClick={() => navigate('/semesters')}>Manage Semesters</button>
      </div>
    </div>
  );
};

export default Dashboard;
