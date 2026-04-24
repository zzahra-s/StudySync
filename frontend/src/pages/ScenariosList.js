import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const ScenariosList = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user.student_id;
  const navigate = useNavigate();

  const [scenarios, setScenarios] = useState([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithToken(`http://localhost:5001/api/students/${studentId}/scenarios`);
      const data = await res.json();
      if (res.ok) {
        setScenarios(data);
      } else {
        setError(data.message || 'Failed to load scenarios.');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) fetchScenarios();
  }, [studentId, fetchScenarios]);
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetchWithToken('http://localhost:5001/api/scenarios', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, scenario_name: newName }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewName('');
        fetchScenarios(); 
      } else {
        setError(data.message || 'Failed to create scenario.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setError('');
    try {
      const res = await fetchWithToken(`http://localhost:5001/api/scenarios/${deleteTarget.scenario_id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchScenarios();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete scenario.');
        setDeleteTarget(null);
      }
    } catch (err) {
      setError('Network error.');
      setDeleteTarget(null);
    }
  };

  if (loading) return <p>Loading scenarios...</p>;

  return (
    <div>
      <div className="nav-bar">
        <Link to="/gpa">Back to GPA Dashboard</Link>
      </div>

      <h2>GPA Scenarios</h2>
      <p>
        Scenarios let you pick expected grades for courses and see what GPA you could achieve.
      </p>

      {error && <p className="error">{error}</p>}

      {/* create new */}
      <div className="card">
        <h3>Create New Scenario</h3>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Scenario Name:</label>
            <input
              type="text"
              placeholder='e.g. "Best Case Spring 2025"'
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <button type="submit">Create Scenario</button>
        </form>
      </div>

      {/* existing ones*/}
      {scenarios.length === 0 ? (
        <p>No scenarios yet. Create one above!</p>
      ) : (
        scenarios.map((s) => (
          <div key={s.scenario_id} className="card flex-between">
            <div>
              <strong>{s.scenario_name}</strong>
              <p style={{ fontSize: '0.85em', color: '#666' }}>
                Created: {new Date(s.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <button onClick={() => navigate(`/scenarios/${s.scenario_id}`)}>
                View / Edit
              </button>
              <button
                onClick={() => setDeleteTarget(s)}
                style={{ background: '#dc3545', marginLeft: '10px' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {/* delete confirm */}
      {deleteTarget && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>Delete Scenario?</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.scenario_name}</strong>?
              This cannot be undone.
            </p>
            <button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Yes, Delete
            </button>
            <button
              onClick={() => setDeleteTarget(null)}
              style={{ background: '#6c757d', marginLeft: '10px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};
const modalStyle = {
  background: '#fff', padding: '30px', borderRadius: '8px',
  maxWidth: '400px', width: '90%',
};

export default ScenariosList;