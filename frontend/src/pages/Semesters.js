import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const Semesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  // Get logged in student info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user.student_id;
  
  const navigate = useNavigate();

  const fetchSemesters = useCallback(async () => {
    if (!studentId) return;
    try {
      const response = await fetchWithToken(`http://localhost:5001/api/students/${studentId}/semesters`);
      if (response.ok) {
        const data = await response.json();
        setSemesters(data);
      } else {
        setError('Failed to load semesters.');
      }
    } catch (err) {
      setError('Network error.');
    }
  }, [studentId]);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetchWithToken('http://localhost:5001/api/semesters', {
        method: 'POST',
        body: JSON.stringify({ 
          student_id: studentId, 
          semester_name: name 
        })
      });
      
      if (response.ok) {
        setName('');
        fetchSemesters();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add semester.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this semester?')) {
      try {
        const response = await fetchWithToken(`http://localhost:5001/api/semesters/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchSemesters();
        } else {
          setError('Failed to delete semester.');
        }
      } catch (err) {
        setError('Network error.');
      }
    }
  };

  return (
    <div>
      <div className="nav-bar">
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>

      <h2>My Semesters</h2>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>Add New Semester</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Semester Name:</label>
            <input 
              type="text" 
              placeholder="e.g. Fall 2023, Spring 2024" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <button type="submit">Add Semester</button>
        </form>
      </div>

      <div className="semester-list">
        {semesters.length === 0 ? <p>No semesters found. Add your first one above!</p> : (
          semesters.map(sem => (
            <div key={sem.semester_id} className="card flex-between">
              <div>
                <strong>{sem.semester_name}</strong>
              </div>
              <div>
                <button onClick={() => navigate(`/semesters/${sem.semester_id}/courses`)}>View Courses</button>
                <button onClick={() => handleDelete(sem.semester_id)} style={{ background: '#dc3545', marginLeft: '10px' }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Semesters;