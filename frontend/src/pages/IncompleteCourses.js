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

  if (loading) return <p>Loading incomplete courses...</p>;

  return (
    <div>
      <div className="nav-bar">
        <Link to="/course-grades">Go to Grades Report</Link>
      </div>
    <div className="nav-bar">
         <Link to="/dashboard">Back to Dashboard</Link>
      </div>

      <h2>Courses Without Grades</h2>
      <p>These courses have no grade recorded yet. Click "Enter Grade" to add one.</p>

      {error && <p className="error">{error}</p>}

      {courses.length === 0 ? (
        <p>All courses have grades recorded. Great job!</p>
      ) : (
        courses.map((course) => (
          <div key={course.course_id} className="card flex-between">
            <div>
              <strong>{course.course_name} ({course.course_code})</strong>
              <p style={{ margin: '4px 0' }}>
                Semester: {course.semester_name} &nbsp;|&nbsp;
                Credits: {course.credit_hours} &nbsp;|&nbsp;
                Instructor: {course.instructor_name || 'N/A'}
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