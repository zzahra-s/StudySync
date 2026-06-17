import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('studentId');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    window.location.href = '/login';
  };

  if (!isAuthenticated) return null;

  const navbarStyle = {
    backgroundColor: '#111',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 999
  };

  const navBrandStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  };

  const navLinksStyle = {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.9rem'
  };

  const logoutBtnStyle = {
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  };

  return (
    <nav style={navbarStyle}>
      <div style={navBrandStyle} onClick={() => navigate('/dashboard')}>
        <img src="/logo.png" alt="StudySync Logo" style={{ height: '50px', width: 'auto', transition: 'transform 0.3s' }} className="nav-logo" />
        <span>StudySync</span>
      </div>

      <div style={navLinksStyle}>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/deadlines" style={linkStyle}>Deadlines</Link>
        <Link to="/profile" style={linkStyle}>Profile</Link>
        <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
      </div>
      <style>{`
        .nav-logo:hover {
          transform: scale(1.05);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
