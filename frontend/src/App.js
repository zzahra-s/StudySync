import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Semesters from './pages/Semesters';
import Courses from './pages/Courses';
import GradeEntry from './pages/GradeEntry';
import ProtectedRoute from './components/ProtectedRoute';

import GPADashboard from './pages/GPADashboard';
import ScenariosList from './pages/ScenariosList';
import ScenarioDetail from './pages/ScenarioDetail';
import CourseGradesReport from './pages/CourseGradesReport';
import IncompleteCourses from './pages/IncompleteCourses';
import TargetCGPACalculator from './pages/TargetCGPACalculator';
import MCACalculator from './components/MCACalculator';

import DeadlinesPage from './pages/DeadlinesPage';
import TaskProgressDashboard from './pages/TaskProgressDashboard';

import AppLayout from './components/AppLayout';

function App() {
  return (
    <AppLayout>
      <Routes>

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/semesters" element={<ProtectedRoute><Semesters /></ProtectedRoute>} />
        <Route path="/semesters/:semesterId/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/courses/:courseId/grade" element={<ProtectedRoute><GradeEntry /></ProtectedRoute>} />

        <Route path="/gpa" element={<ProtectedRoute><GPADashboard /></ProtectedRoute>} />
        <Route path="/scenarios" element={<ProtectedRoute><ScenariosList /></ProtectedRoute>} />
        <Route path="/scenarios/:scenarioId" element={<ProtectedRoute><ScenarioDetail /></ProtectedRoute>} />
        <Route path="/target-cgpa" element={<ProtectedRoute><TargetCGPACalculator /></ProtectedRoute>} />
        <Route path="/mca-calculator" element={<ProtectedRoute><MCACalculator /></ProtectedRoute>} />

        <Route path="/course-grades" element={<ProtectedRoute><CourseGradesReport /></ProtectedRoute>} />
        <Route path="/incomplete-courses" element={<ProtectedRoute><IncompleteCourses /></ProtectedRoute>} />

        <Route path="/deadlines" element={<ProtectedRoute><DeadlinesPage /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><TaskProgressDashboard /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

      </Routes>
    </AppLayout>
  );
}

export default App;