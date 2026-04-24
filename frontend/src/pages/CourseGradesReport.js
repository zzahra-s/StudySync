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

  if (loading) return <p>Loading course grades...</p>;

  return (
    <div>
      <div className="nav-bar">
        <Link to="/dashboard">Back to Dashboard</Link>
        <Link to="/incomplete-courses" style={{ marginLeft: '15px' }}>Incomplete Courses</Link>
      </div>

      <h2>Course Grades Report</h2>

      {error && <p className="error">{error}</p>}

      {grades.length === 0 ? (
        <p>No graded courses found. Go to Semesters → Courses to enter grades.</p>
      ) : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Semester</th>
                <th style={thStyle}>Course Code</th>
                <th style={thStyle}>Course Name</th>
                <th style={thStyle}>Credits</th>
                <th style={thStyle}>Grade</th>
                <th style={thStyle}>Grade Points</th>
                <th style={thStyle}>Comments</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((row, index) => (
                <tr key={index}>
                  <td style={tdStyle}>{row.semester_name}</td>
                  <td style={tdStyle}>{row.course_code}</td>
                  <td style={tdStyle}>{row.course_name}</td>
                  <td style={tdStyle}>{row.credit_hours}</td>
                  <td style={tdStyle}><strong>{row.letter_grade}</strong></td>
                  <td style={tdStyle}>{row.grade_points}</td>
                  <td style={tdStyle}>{row.comments || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const thStyle = { borderBottom: '2px solid #ccc', padding: '8px', textAlign: 'left' };
const tdStyle = { borderBottom: '1px solid #eee', padding: '8px' };

export default CourseGradesReport;