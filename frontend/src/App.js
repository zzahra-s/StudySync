import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Semesters from './pages/Semesters';
import Courses from './pages/Courses';
import GradeEntry from './pages/GradeEntry';
import DeadlinesPage from './pages/DeadlinesPage';
import CourseMaterialsPage from './pages/CourseMaterialsPage';
import BooksPage from './pages/BooksPage';
import TaskProgressDashboard from './pages/TaskProgressDashboard';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('studentId');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    window.location.href = '/login';
  };

  const navbarStyles = {
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
      alignItems: 'center'
    },
    navLink: {
      color: 'white',
      textDecoration: 'none',
      padding: '8px 12px',
      borderRadius: '4px',
      backgroundColor: 'transparent'
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
    <div>
      {isAuthenticated && (
        <nav style={navbarStyles.navbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => (window.location.href = '/dashboard')}>
            📚 StudySync
          </div>
          <div style={navbarStyles.linkGroup}>
            <Link to="/dashboard" style={navbarStyles.navLink}>Dashboard</Link>
            <Link to="/deadlines" style={navbarStyles.navLink}>Deadlines</Link>
            <Link to="/materials" style={navbarStyles.navLink}>Materials</Link>
            <Link to="/books" style={navbarStyles.navLink}>Books</Link>
            <Link to="/progress" style={navbarStyles.navLink}>Progress</Link>
            <Link to="/profile" style={navbarStyles.navLink}>Profile</Link>
            <button type="button" onClick={handleLogout} style={navbarStyles.logoutBtn}>Logout</button>
          </div>
        </nav>
      )}

      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/semesters" element={<ProtectedRoute><Semesters /></ProtectedRoute>} />
          <Route path="/semesters/:semesterId/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/courses/:courseId/grade" element={<ProtectedRoute><GradeEntry /></ProtectedRoute>} />
          <Route path="/deadlines" element={<ProtectedRoute><DeadlinesPage /></ProtectedRoute>} />
          <Route path="/materials" element={<ProtectedRoute><CourseMaterialsPage /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute><BooksPage /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><TaskProgressDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
