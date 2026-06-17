import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const Courses = () => {
  const { semesterId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState('');
  const [creditHours, setCreditHours] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    try {
      const response = await fetchWithToken(`http://localhost:5001/api/semesters/${semesterId}/courses`);
      const data = await response.json();
      if (response.ok) {
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

    if (!name.trim()) {
      setError('Course name is required.');
      return;
    }

    if (!creditHours || Number(creditHours) <= 0) {
      setError('Credit hours must be greater than 0.');
      return;
    }

    try {
      if (editId) {
        const response = await fetchWithToken(`http://localhost:5001/api/courses/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({
            course_name: name,
            course_code: name.substring(0, 6).toUpperCase(), // Auto-generate code from name
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
            course_code: name.substring(0, 6).toUpperCase(), // Auto-generate code from name
            credit_hours: Number(creditHours)
          })
        });
        if (!response.ok) {
          setError('Failed to add course.');
        }
      }
      setName('');
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
    setCreditHours(course.credit_hours || course.creditHours || '');
  };

  return (
    <div className="page-container">

      <div className="page-header">
        <h1 className="page-title">Semester Courses</h1>
        <p className="description">Add and manage courses with credit hours inside the selected semester.</p>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>{editId ? 'Edit Course' : 'Add Course'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="course-name">Course Name *</label>
            <input
              id="course-name"
              type="text"
              placeholder="e.g., Data Structures"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="credit-hours">Credit Hours *</label>
            <input
              id="credit-hours"
              type="number"
              placeholder="e.g., 3"
              min="1"
              max="6"
              step="0.5"
              value={creditHours}
              onChange={(e) => setCreditHours(e.target.value)}
              required
            />
          </div>
          <button type="submit">{editId ? 'Update' : 'Add'}</button>
          {editId && (
            <button type="button" className="btn-secondary" onClick={() => { setEditId(null); setName(''); setCreditHours(''); }}>Cancel</button>
          )}
        </form>
      </div>

      <div>
        {courses.length === 0 ? <p>No courses found for this semester.</p> : (
          courses.map(course => (
            <div key={course.course_id || course.id} className="card flex-between">
              <div>
                <strong>{course.course_name || course.name}</strong> - {course.credit_hours || course.creditHours} Credits
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => navigate(`/courses/${course.course_id || course.id}/grade`)}>Enter Grade</button>
                <button className="btn-secondary" onClick={() => handleEditClick(course)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(course.course_id || course.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;
