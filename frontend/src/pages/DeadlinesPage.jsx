import React, { useEffect, useState } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

function DeadlinesPage() {
  const { user } = useAuth();
  const studentId = user?.studentId || user?.id;
  const [deadlines, setDeadlines] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDeadlines = async () => {
      setLoading(true);
      setError('');

      try {
        const params = statusFilter !== 'All' ? { status: statusFilter } : {};
        const response = await api.get(`/students/${studentId}/deadlines`, { params });
        setDeadlines(response.data);
      } catch (err) {
        setError('Unable to load deadlines. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDeadlines();
  }, [studentId, statusFilter]);

  const filters = ['All', 'Pending', 'Overdue', 'Completed'];

  return (
    <div className="deadlines-page">
      <h1>Deadlines</h1>

      <div className="filter-row">
        {filters.map(filter => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            disabled={statusFilter === filter}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading && <p>Loading deadlines...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="deadlines-list">
        {deadlines.length === 0 && !loading ? (
          <p>No deadlines found.</p>
        ) : (
          deadlines.map(item => (
            <div key={item.id} className="deadline-card">
              <h2>{item.title}</h2>
              <p><strong>Course:</strong> {item.course}</p>
              <p><strong>Due date:</strong> {item.dueDate}</p>
              <p><strong>Status:</strong> {item.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DeadlinesPage;
