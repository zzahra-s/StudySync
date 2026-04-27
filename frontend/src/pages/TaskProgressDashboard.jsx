import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

function TaskProgressDashboard() {
  const { user } = useAuth();
  const studentId = user?.studentId;

  const [progress, setProgress] = useState({
    totalTasks: 0,
    completedTasks: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTaskProgress = async () => {
      if (!studentId) return;

      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/students/${studentId}/task-progress`);
        const data = response.data || {};

        const totalTasks = Number(data.totalTasks ?? data.total_tasks ?? 0);
        const completedTasks = Number(data.completedTasks ?? data.completed_tasks ?? 0);
        const computedPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        const percentage = Number(data.percentage ?? computedPercentage);

        setProgress({
          totalTasks,
          completedTasks,
          percentage: Math.round(percentage)
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load task progress.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskProgress();
  }, [studentId]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Progress Dashboard</h1>

      {loading && <p>Loading task progress...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ border: '1px solid #ddd', padding: '12px', maxWidth: '500px' }}>
          <p>Total Tasks: {progress.totalTasks}</p>
          <p>Completed Tasks: {progress.completedTasks}</p>
          <p>Percentage: {progress.percentage}%</p>
          <progress value={progress.percentage} max="100" style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}

export default TaskProgressDashboard;