import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GPADashboard from './pages/GPADashboard';
import Profile from './pages/Profile';
import Semesters from './pages/Semesters';
import Courses from './pages/Courses';
import GradeEntry from './pages/GradeEntry';
import DeadlinesPage from './pages/DeadlinesPage';
import CourseMaterialsPage from './pages/CourseMaterialsPage';
import BooksPage from './pages/BooksPage';
import TaskProgressDashboard from './pages/TaskProgressDashboard';

function App() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <div className="app-wrapper">
      <Navbar key={location.pathname} />
      
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/gpa" element={<ProtectedRoute><GPADashboard /></ProtectedRoute>} />
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
