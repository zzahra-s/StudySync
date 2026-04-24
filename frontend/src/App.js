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

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <div className="container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/semesters" element={<ProtectedRoute><Semesters /></ProtectedRoute>} />
        <Route path="/semesters/:semesterId/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/courses/:courseId/grade" element={<ProtectedRoute><GradeEntry /></ProtectedRoute>} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default App;
