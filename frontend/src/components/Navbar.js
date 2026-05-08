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

  const styles = {
    navbar: {
      backgroundColor: '#111',
      padding: '12px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 999,
      boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
    },
    linkGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gridColumn: '3'
    },
    navLink: {
      color: 'white',
      textDecoration: 'none',
      padding: '8px 12px',
      borderRadius: '4px',
      backgroundColor: 'transparent',
      transition: 'background 0.2s'
    },
    logoutBtn: {
      backgroundColor: '#d9534f',
      color: 'white',
      border: 'none',
      padding: '8px 14px',
      borderRadius: '4px',
      cursor: 'pointer'
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={{ gridColumn: '1' }}></div>
      <div 
        style={{ 
          gridColumn: '2',
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          fontWeight: 'bold', 
          cursor: 'pointer',
          fontSize: '1.2rem'
        }} 
        onClick={() => navigate('/dashboard')}
      >
        <img src="/logo.png" alt="StudySync Logo" style={{ height: '55px', width: 'auto', objectFit: 'contain', transition: 'transform 0.3s ease' }} className="nav-logo" />
        <span style={{ fontSize: '1.4rem', letterSpacing: '-0.5px' }}>StudySync</span>
      </div>
      <div style={styles.linkGroup}>
        <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
        <Link to="/deadlines" style={styles.navLink}>Deadlines</Link>
        <Link to="/materials" style={styles.navLink}>Materials</Link>
        <Link to="/books" style={styles.navLink}>Books</Link>
        <Link to="/progress" style={styles.navLink}>Progress</Link>
        <Link to="/profile" style={styles.navLink}>Profile</Link>
        <button type="button" onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
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
