import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const CourseGradesReport = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user.student_id;

  const [grades, setGrades] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await fetchWithToken(`http://localhost:5001/api/students/${studentId}/course-grades`);
        const data = await res.json();
        if (res.ok) {
          setGrades(data);
        } else {
          setError(data.message || 'Failed to load grades.');
        }
      } catch (err) {
        setError('Network error. Is the server running?');
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchGrades();
  }, [studentId]);

  if (loading) return <div className="loading">Loading grades</div>;

  const gradeColor = (grade) => {
    if (grade === 'A') return 'badge badge-green';
    if (grade === 'F') return 'badge badge-red';
    return 'badge badge-indigo';
  };

  return (
    <div className="page-container">
      <div className="nav-bar">
        <Link to="/dashboard">← Dashboard</Link>
        <Link to="/incomplete-courses">Incomplete Courses</Link>
      </div>

      <div className="page-header">
        <h1 className="page-title">Course Grades</h1>
        <p className="description">A summary of all your graded courses across every semester.</p>
      </div>

      {error && <p className="error">{error}</p>}

      {grades.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="emoji">📝</span>
            No graded courses found. Go to Semesters → Courses to enter grades.
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Semester</th>
                <th>Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Grade</th>
                <th>Points</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((row, index) => (
                <tr key={index}>
                  <td>{row.semester_name}</td>
                  <td><code style={{ fontSize: '0.85rem' }}>{row.course_code}</code></td>
                  <td>{row.course_name}</td>
                  <td>{row.credit_hours}</td>
                  <td><span className={gradeColor(row.letter_grade)}>{row.letter_grade}</span></td>
                  <td>{row.grade_points}</td>
                  <td style={{ color: '#6b7280', fontSize: '0.85rem' }}>{row.comments || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CourseGradesReport;
