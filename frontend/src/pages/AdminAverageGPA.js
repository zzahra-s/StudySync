import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const AdminAverageGPA = () => {
  const [avgData, setAvgData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvg = async () => {
      try {
        const res = await fetchWithToken('http://localhost:5001/api/admin/average-gpa');
        const data = await res.json();
        if (res.ok) {
          setAvgData(data);
        } else {
          setError(data.message || 'Failed to load average GPA.');
        }
      } catch (err) {
        setError('Network error. Is the server running?');
      } finally {
        setLoading(false);
      }
    };
    fetchAvg();
  }, []);

  if (loading) return <div className="loading">Loading admin data</div>;

  return (
    <div className="page-container">
      <Link className="back-btn" to="/dashboard">← Dashboard</Link>

      <div className="page-header">
        <h1 className="page-title">Overall CGPA</h1>
        <p className="description">Overview of academic performance across all students.</p>
      </div>

      {error && <p className="error">{error}</p>}

      {avgData ? (
        <div className="card">
          <div className="admin-highlight">
            <p className="gpa-label">Overall Average CGPA</p>
            <p className="gpa-number">{avgData.overall_avg_cgpa ?? 'N/A'}</p>
            <p className="description" style={{ marginBottom: 0, marginTop: 10 }}>
              Weighted average across all graded courses from all students.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <span className="emoji">📊</span>
            No data available yet.
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAverageGPA;
