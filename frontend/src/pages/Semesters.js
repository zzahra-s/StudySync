import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const Semesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchSemesters = async () => {
    try {
      const response = await fetchWithToken('http://localhost:5001/api/semesters');
      if (response.ok) {
        const data = await response.json();
        setSemesters(data);
      } else {
        setError('Failed to load semesters.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editId) {
        const response = await fetchWithToken(`http://localhost:5001/api/semesters/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ name, year })
        });
        if (response.ok) {
          setEditId(null);
        } else {
          setError('Failed to update semester.');
        }
      } else {
        const response = await fetchWithToken('http://localhost:5001/api/semesters', {
          method: 'POST',
          body: JSON.stringify({ name, year })
        });
        if (!response.ok) {
          setError('Failed to add semester.');
        }
      }
      setName('');
      setYear('');
      fetchSemesters();
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

  const handleEditClick = (sem) => {
    setEditId(sem._id || sem.id);
    setName(sem.name);
    setYear(sem.year);
  };

  return (
    <div>
      <div className="nav-bar">
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>

      <h2>Semesters</h2>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>{editId ? 'Edit Semester' : 'Add Semester'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" placeholder="Semester Name (e.g. Fall, Spring)" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} required />
          </div>
          <button type="submit">{editId ? 'Update' : 'Add'}</button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setName(''); setYear(''); }} style={{ background: '#6c757d' }}>Cancel</button>
          )}
        </form>
      </div>

      <div>
        {semesters.length === 0 ? <p>No semesters found.</p> : (
          semesters.map(sem => (
            <div key={sem._id || sem.id} className="card flex-between">
              <div><strong>{sem.name} {sem.year}</strong></div>
              <div>
                <button onClick={() => navigate(`/semesters/${sem._id || sem.id}/courses`)}>View Courses</button>
                <button onClick={() => handleEditClick(sem)} style={{ background: '#ffc107', color: 'black' }}>Edit</button>
                <button onClick={() => handleDelete(sem._id || sem.id)} style={{ background: '#dc3545' }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Semesters;
