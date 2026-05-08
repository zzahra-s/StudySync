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
  const [editId, setEditId] = useState(null);
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
      if (editId) {
        const response = await fetchWithToken(`http://localhost:5001/api/courses/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({
            course_name: name,
            course_code: code,
            credit_hours: Number(creditHours)
          })
        });
        if (response.ok) {
          setEditId(null);
        } else {
          setError('Failed to update course.');
        }
      } else {
        const response = await fetchWithToken('http://localhost:5001/api/courses', {
          method: 'POST',
          body: JSON.stringify({
            semester_id: Number(semesterId),
            course_name: name,
            course_code: code,
            credit_hours: Number(creditHours)
          })
        });
        if (!response.ok) {
          setError('Failed to add course.');
        }
      }
      setName('');
      setCode('');
      setCreditHours('');
      fetchCourses();
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

  const handleEditClick = (course) => {
    setEditId(course.course_id || course.id);
    setName(course.course_name || course.name || '');
    setCode(course.course_code || course.code || '');
    setCreditHours(course.credit_hours || course.creditHours || '');
  };

  return (
    <div>
      <div className="nav-bar">
        <Link to="/semesters">Back to Semesters</Link>
      </div>

      <h2>Courses</h2>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>{editId ? 'Edit Course' : 'Add Course'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" placeholder="Course Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="text" placeholder="Course Code" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="number" placeholder="Credit Hours" value={creditHours} onChange={(e) => setCreditHours(e.target.value)} required />
          </div>
          <button type="submit">{editId ? 'Update' : 'Add'}</button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setName(''); setCode(''); setCreditHours(''); }} style={{ background: '#6c757d' }}>Cancel</button>
          )}
        </form>
      </div>

      <div>
        {courses.length === 0 ? <p>No courses found for this semester.</p> : (
          courses.map(course => (
            <div key={course.course_id || course.id} className="card flex-between">
              <div>
                <strong>{course.course_name || course.name} ({course.course_code || course.code})</strong> - {course.credit_hours || course.creditHours} Credits
              </div>
              <div>
                <button onClick={() => navigate(`/courses/${course.course_id || course.id}/grade`)}>Enter Grade</button>
                <button onClick={() => handleEditClick(course)} style={{ background: '#ffc107', color: 'black' }}>Edit</button>
                <button onClick={() => handleDelete(course.course_id || course.id)} style={{ background: '#dc3545' }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;
