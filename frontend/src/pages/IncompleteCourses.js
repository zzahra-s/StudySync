import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const IncompleteCourses = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user.student_id;
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetchWithToken(
          `http://localhost:5001/api/students/${studentId}/incomplete-courses`
        );
        const data = await res.json();
        if (res.ok) {
          setCourses(data);
        } else {
          setError(data.message || 'Failed to load incomplete courses.');
        }
      } catch (err) {
        setError('Network error. Is the server running?');
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchCourses();
  }, [studentId]);

  if (loading) return <div className="loading">Loading courses</div>;

  return (
    <div className="page-container">
      <Link className="back-btn" to="/dashboard">← Dashboard</Link>
      <Link className="back-btn" to="/course-grades">← Grades Report</Link>

      <div className="page-header">
        <h1 className="page-title">Courses Without Grades</h1>
        <p className="description">
          These courses don't have a grade recorded yet. Click "Enter Grade" to add one.
        </p>
      </div>

      {error && <p className="error">{error}</p>}

      {courses.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="emoji">✅</span>
            All courses have grades recorded. Great job!
          </div>
        </div>
      ) : (
        courses.map((course) => (
          <div className="course-card" key={course.course_id}>
            <div>
              <strong>{course.course_name}</strong>
              <span style={{ marginLeft: 8 }}>
                <code style={{ fontSize: '0.82rem', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4 }}>
                  {course.course_code}
                </code>
              </span>
              <p className="meta">
                {course.semester_name} &nbsp;·&nbsp; {course.credit_hours} credits
                {course.instructor_name ? ` · ${course.instructor_name}` : ''}
              </p>
            </div>
            <button onClick={() => navigate(`/courses/${course.course_id}/grade`)}>
              Enter Grade
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default IncompleteCourses;
