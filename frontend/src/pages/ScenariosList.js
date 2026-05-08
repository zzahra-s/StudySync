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
      const res = await fetchWithToken(
        `http://localhost:5001/api/scenarios/${deleteTarget.scenario_id}`,
        { method: 'DELETE' }
      );
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

  if (loading) return <div className="loading">Loading scenarios</div>;

  return (
    <div className="page-container">
      <div className="nav-bar">
        <Link to="/gpa">← GPA Dashboard</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>

      <div className="page-header">
        <h1 className="page-title">GPA Scenarios</h1>
        <p className="description">
          Pick expected grades for your courses and see what GPA you could achieve.
        </p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>Create New Scenario</h3>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Scenario Name</label>
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

      {scenarios.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="emoji">🔮</span>
            No scenarios yet. Create one above to get started!
          </div>
        </div>
      ) : (
        scenarios.map((s) => (
          <div key={s.scenario_id} className="scenario-card">
            <div>
              <strong>{s.scenario_name}</strong>
              <p className="meta">Created {new Date(s.created_at).toLocaleDateString()}</p>
            </div>
            <div className="actions">
              <button onClick={() => navigate(`/scenarios/${s.scenario_id}`)}>
                View / Edit
              </button>
              <button className="btn-danger" onClick={() => setDeleteTarget(s)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete Scenario?</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.scenario_name}</strong>?
              This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={handleDeleteConfirm}>
                Yes, Delete
              </button>
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenariosList;
