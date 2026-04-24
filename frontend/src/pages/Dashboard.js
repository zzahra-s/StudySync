import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [courseHistory, setCourseHistory] = useState([]);
  const [error, setError] = useState('');

  const studentId = user.student_id;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!studentId) return;
      try {
        const response = await fetchWithToken(`http://localhost:5001/api/students/${studentId}/courses`);
        if (response.ok) {
          const data = await response.json();
          setCourseHistory(data);
        }
      } catch (err) {
        setError('Error loading academic history.');
      }
    };
    fetchHistory();
  }, [studentId]);

  // Grouping courses by semester for the summary view
  const groupedCourses = courseHistory.reduce((acc, course) => {
    const sem = course.semester_name || 'Unassigned';
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(course);
    return acc;
  }, {});

  return (
    <div className="dashboard-container">
      <div className="nav-bar flex-between">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="StudySync Logo" className="logo" style={{ width: '45px', height: 'auto', marginRight: '15px' }} />
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile Settings</Link>
          <Link to="/semesters">Manage Academics</Link>
        </div>
        <button onClick={handleLogout} style={{ background: '#dc3545', margin: 0 }}>Logout</button>
      </div>

      <div className="welcome-banner">
        <h2>Welcome back, {user.full_name || 'Student'}!</h2>
        <p className="student-meta">{user.roll_number} | {user.email}</p>
      </div>
      
      {error && <p className="error">{error}</p>}

      <div className="academic-snapshot">
        <h3>My Academic Overview</h3>
        {Object.keys(groupedCourses).length === 0 ? (
          <div className="card">
            <h4>No courses found yet!</h4>
            <p>Start organizing your academic life by adding your first semester.</p>
            <button onClick={() => navigate('/semesters')}>Add My First Semester</button>
          </div>
        ) : (
          Object.entries(groupedCourses).map(([semester, courses]) => (
            <div key={semester} className="semester-summary-card card">
              <div className="flex-between" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>{semester}</h4>
                <button className="text-btn" onClick={() => navigate('/semesters')}>Manage</button>
              </div>
              <div className="mini-course-list">
                {courses.map(course => (
                  <div key={course.course_id} className="mini-course-item">
                    <span>{course.course_name} ({course.course_code})</span>
                    <span className={`grade-badge ${course.letter_grade ? 'graded' : 'pending'}`}>
                      {course.letter_grade || '...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .welcome-banner { margin-bottom: 30px; }
        .student-meta { color: #666; font-size: 14px; margin-top: -10px; }
        .academic-snapshot h3 { margin-bottom: 20px; border-left: 4px solid #007bff; padding-left: 10px; }
        .semester-summary-card { margin-bottom: 20px; }
        .mini-course-item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px dashed #eee; }
        .mini-course-item:last-child { border-bottom: none; }
        .grade-badge { font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
        .grade-badge.graded { background: #e7f3ff; color: #007bff; border: 1px solid #cce5ff; }
        .grade-badge.pending { background: #f8f9fa; color: #999; border: 1px solid #eee; }
        .text-btn { background: none; border: none; color: #007bff; text-decoration: underline; cursor: pointer; padding: 0; font-size: 13px; }
      `}</style>
    </div>
  );
};

export default Dashboard;
