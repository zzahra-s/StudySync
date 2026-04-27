import React, { useEffect, useState } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

function TaskProgressDashboard() {
  const { user } = useAuth();
  const studentId = user?.studentId || user?.id;
  const [progress, setProgress] = useState({ totalTasks: 0, completedTasks: 0, percentage: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProgress = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/students/${studentId}/task-progress`);
      const data = response.data;
      const percentage = data.percentage || (data.totalTasks > 0 ? (data.completedTasks / data.totalTasks) * 100 : 0);
      setProgress({
        totalTasks: data.totalTasks || 0,
        completedTasks: data.completedTasks || 0,
        percentage: Math.round(percentage)
      });
    } catch (err) {
      setError('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [studentId]);

  const styles = {
    container: { padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' },
    title: { fontSize: '2em', marginBottom: '30px' },
    stats: { fontSize: '1.2em', marginBottom: '20px' },
    stat: { margin: '10px 0' },
    progressContainer: { marginTop: '40px' },
    percentage: { fontSize: '3em', fontWeight: 'bold', color: '#007bff', marginBottom: '20px' }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Task Progress</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={styles.stats}>
            <div style={styles.stat}>Total Tasks: <strong>{progress.totalTasks}</strong></div>
            <div style={styles.stat}>Completed: <strong>{progress.completedTasks}</strong></div>
          </div>

          <div style={styles.progressContainer}>
            <div style={styles.percentage}>{progress.percentage}%</div>
            <progress value={progress.percentage} max="100" style={{ width: '100%', height: '30px' }}></progress>
          </div>
        </>
      )}
    </div>
  );
}

export default TaskProgressDashboard;
