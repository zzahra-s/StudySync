
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import Profile        from './pages/Profile';
import Semesters      from './pages/Semesters';
import Courses        from './pages/Courses';
import GradeEntry     from './pages/GradeEntry';
import ProtectedRoute from './components/ProtectedRoute';

import GPADashboard      from './pages/GPADashboard';
import ScenariosList     from './pages/ScenariosList';
import ScenarioDetail    from './pages/ScenarioDetail';
import CourseGradesReport from './pages/CourseGradesReport';
import IncompleteCourses from './pages/IncompleteCourses';
import AdminAverageGPA   from './pages/AdminAverageGPA';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/semesters"                        element={<ProtectedRoute><Semesters /></ProtectedRoute>} />
        <Route path="/semesters/:semesterId/courses"    element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/courses/:courseId/grade"          element={<ProtectedRoute><GradeEntry /></ProtectedRoute>} />

        <Route path="/gpa"         element={<ProtectedRoute><GPADashboard /></ProtectedRoute>} />
        <Route path="/scenarios"   element={<ProtectedRoute><ScenariosList /></ProtectedRoute>} />
        <Route path="/scenarios/:scenarioId" element={<ProtectedRoute><ScenarioDetail /></ProtectedRoute>} />

        <Route path="/course-grades"      element={<ProtectedRoute><CourseGradesReport /></ProtectedRoute>} />
        <Route path="/incomplete-courses" element={<ProtectedRoute><IncompleteCourses /></ProtectedRoute>} />

        <Route path="/admin/average-gpa" element={<ProtectedRoute><AdminAverageGPA /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;