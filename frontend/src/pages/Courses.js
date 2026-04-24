import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const Courses = () => {
  const { semesterId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [creditHours, setCreditHours] = useState('');
  const [instructor, setInstructor] = useState('');
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    try {
      const response = await fetchWithToken(`http://localhost:5001/api/semesters/${semesterId}/courses`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        setError('Failed to load courses.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [semesterId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetchWithToken('http://localhost:5001/api/courses', {
        method: 'POST',
        body: JSON.stringify({ 
          semester_id: parseInt(semesterId),
          course_name: name, 
          course_code: code, 
          credit_hours: parseFloat(creditHours),
          instructor_name: instructor
        })
      });

      if (response.ok) {
        setName('');
        setCode('');
        setCreditHours('');
        setInstructor('');
        fetchCourses();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add course.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await fetchWithToken(`http://localhost:5001/api/courses/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchCourses();
        } else {
          setError('Failed to delete course.');
        }
      } catch (err) {
        setError('Network error.');
      }
    }
  };

  return (
    <div>
      <div className="nav-bar">
        <Link to="/semesters">Back to Semesters</Link>
      </div>

      <h2>Courses</h2>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>Add New Course</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course Name:</label>
            <input type="text" placeholder="e.g. Database Systems" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Course Code:</label>
            <input type="text" placeholder="e.g. CS210" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Credit Hours:</label>
            <input type="number" step="0.5" placeholder="e.g. 3.0" value={creditHours} onChange={(e) => setCreditHours(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Instructor:</label>
            <input type="text" placeholder="e.g. Dr. Ahmed" value={instructor} onChange={(e) => setInstructor(e.target.value)} />
          </div>
          <button type="submit">Add Course</button>
        </form>
      </div>

      <div className="course-list">
        {courses.length === 0 ? <p>No courses found for this semester.</p> : (
          courses.map(course => (
            <div key={course.course_id} className="card flex-between">
              <div>
                <strong>{course.course_name} ({course.course_code})</strong>
                <p>{course.credit_hours} Credits | Instructor: {course.instructor_name || 'N/A'}</p>
              </div>
              <div>
                <button onClick={() => navigate(`/courses/${course.course_id}/grade`)}>Enter Grade</button>
                <button onClick={() => handleDelete(course.course_id)} style={{ background: '#dc3545', marginLeft: '10px' }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;
