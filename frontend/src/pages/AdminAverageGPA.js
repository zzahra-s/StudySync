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

  if (loading) return <p>Loading admin data...</p>;

  return (
    <div>
      <div className="nav-bar">
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>

      <h3>This shows the average CGPA calculated across all students who have at least one graded course.</h3>

      {error && <p className="error">{error}</p>}

      {avgData ? (
        <div className="card">
          <h3>Overall Average CGPA</h3>
          <p style={{ fontSize: '3em', fontWeight: 'bold', margin: '10px 0' }}>
            {avgData.overall_avg_cgpa ?? 'N/A'}
          </p>
          <p style={{ color: '#555' }}>
            This is the weighted average across all students and all their graded courses.
          </p>
        </div>
      ) : (
        <p>No data available. This means no student has any graded courses yet.</p>
      )}
    </div>
  );
};

export default AdminAverageGPA;