import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Semesters from './pages/Semesters';
import Courses from './pages/Courses';
import GradeEntry from './pages/GradeEntry';
import DeadlinesPage from './pages/DeadlinesPage';
import StudyPlannerPage from './pages/StudyPlannerPage';
import CourseMaterialsPage from './pages/CourseMaterialsPage';
import BooksPage from './pages/BooksPage';
import TaskProgressDashboard from './pages/TaskProgressDashboard';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentId');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    window.location.href = '/login';
  };

  const navbarStyles = {
    navbar: {
      backgroundColor: '#1a1a1a',
      padding: '12px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 999,
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    },
    logo: {
      fontSize: '1.5em',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none',
      color: 'white',
      cursor: 'pointer'
    },
    navLinks: {
      display: 'flex',
      gap: '20px',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      alignItems: 'center'
    },
    navLink: {
      color: 'white',
      textDecoration: 'none',
      fontSize: '0.95em',
      padding: '8px 12px',
      borderRadius: '4px',
      transition: 'background-color 0.2s',
      cursor: 'pointer'
    },
    navLinkHover: {
      backgroundColor: '#007bff'
    },
    logoutBtn: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '8px 15px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9em',
      transition: 'background-color 0.2s'
    }
  };

  return (
    <div>
      {isAuthenticated && (
        <nav style={navbarStyles.navbar}>
          <div style={navbarStyles.logo} onClick={() => window.location.href = '/dashboard'}>
            📚 StudySync
          </div>
          <ul style={navbarStyles.navLinks}>
            <li><a href="/dashboard" style={navbarStyles.navLink} onMouseEnter={(e) => e.target.style.backgroundColor = '#007bff'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Dashboard</a></li>
            <li><a href="/deadlines" style={navbarStyles.navLink} onMouseEnter={(e) => e.target.style.backgroundColor = '#007bff'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Deadlines</a></li>
            <li><a href="/study-planner" style={navbarStyles.navLink} onMouseEnter={(e) => e.target.style.backgroundColor = '#007bff'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Study Planner</a></li>
            <li><a href="/materials" style={navbarStyles.navLink} onMouseEnter={(e) => e.target.style.backgroundColor = '#007bff'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Materials</a></li>
            <li><a href="/books" style={navbarStyles.navLink} onMouseEnter={(e) => e.target.style.backgroundColor = '#007bff'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Books</a></li>
            <li><a href="/progress" style={navbarStyles.navLink} onMouseEnter={(e) => e.target.style.backgroundColor = '#007bff'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Progress</a></li>
            <li><a href="/profile" style={navbarStyles.navLink} onMouseEnter={(e) => e.target.style.backgroundColor = '#007bff'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Profile</a></li>
            <li><button onClick={handleLogout} style={navbarStyles.logoutBtn} onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'} onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}>Logout</button></li>
          </ul>
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
        <Route path="/study-planner" element={<ProtectedRoute><StudyPlannerPage /></ProtectedRoute>} />
        <Route path="/materials" element={<ProtectedRoute><CourseMaterialsPage /></ProtectedRoute>} />
        <Route path="/books" element={<ProtectedRoute><BooksPage /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><TaskProgressDashboard /></ProtectedRoute>} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
      </div>
    </div>
  );
}

export default App;
