import React, { useEffect, useState } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

function StudyPlannerPage() {
  const { user } = useAuth();
  const studentId = user?.studentId || user?.id;
  const [tasks, setTasks] = useState([]);
  const [studyHours, setStudyHours] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, hoursRes, coursesRes] = await Promise.all([
        api.get(`/students/${studentId}/study-planner`),
        api.get(`/students/${studentId}/study-hours`),
        api.get(`/students/${studentId}/top-courses`)
      ]);
      setTasks(tasksRes.data || []);
      setStudyHours(hoursRes.data || []);
      setTopCourses(coursesRes.data || []);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const getToday = () => new Date().toISOString().split('T')[0];
  const getDateOffset = (days) => new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

  const groupTasksByDate = () => {
    const today = getToday();
    const weekEnd = getDateOffset(7);
    
    const sections = {
      today: [],
      thisWeek: [],
      later: []
    };

    tasks.forEach(task => {
      if (task.dueDate === today) {
        sections.today.push(task);
      } else if (task.dueDate > today && task.dueDate <= weekEnd) {
        sections.thisWeek.push(task);
      } else if (task.dueDate > weekEnd) {
        sections.later.push(task);
      }
    });

    return sections;
  };

  const maxHours = Math.max(...studyHours.map(h => h.hours || 0), 1);

  const sections = groupTasksByDate();

  const styles = {
    container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
    section: { marginTop: '30px' },
    sectionTitle: { fontSize: '1.3em', fontWeight: 'bold', marginBottom: '15px', borderBottom: '2px solid #007bff', paddingBottom: '10px' },
    taskList: { listStyle: 'none', padding: 0 },
    taskItem: { padding: '10px', border: '1px solid #e0e0e0', marginBottom: '8px', borderRadius: '4px' },
    hoursContainer: { marginTop: '30px' },
    courseBar: { marginBottom: '15px' },
    barLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
    progressBar: { width: '100%', height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#007bff', transition: 'width 0.3s' },
    emptyText: { color: '#999' }
  };

  return (
    <div style={styles.container}>
      <h1>Study Planner</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Today</div>
        {sections.today.length > 0 ? (
          <ul style={styles.taskList}>
            {sections.today.map(task => (
              <li key={task.id} style={styles.taskItem}>
                <strong>{task.title}</strong> - {task.course || 'No course'} ({task.dueDate})
              </li>
            ))}
          </ul>
        ) : (
          <p style={styles.emptyText}>No tasks for today</p>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>This Week</div>
        {sections.thisWeek.length > 0 ? (
          <ul style={styles.taskList}>
            {sections.thisWeek.map(task => (
              <li key={task.id} style={styles.taskItem}>
                <strong>{task.title}</strong> - {task.course || 'No course'} ({task.dueDate})
              </li>
            ))}
          </ul>
        ) : (
          <p style={styles.emptyText}>No tasks this week</p>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Later</div>
        {sections.later.length > 0 ? (
          <ul style={styles.taskList}>
            {sections.later.map(task => (
              <li key={task.id} style={styles.taskItem}>
                <strong>{task.title}</strong> - {task.course || 'No course'} ({task.dueDate})
              </li>
            ))}
          </ul>
        ) : (
          <p style={styles.emptyText}>No tasks later</p>
        )}
      </div>

      <div style={styles.hoursContainer}>
        <h2>Study Hours by Course</h2>
        {studyHours.length > 0 ? (
          studyHours.map(item => (
            <div key={item.id} style={styles.courseBar}>
              <div style={styles.barLabel}>
                <span>{item.subject || item.course}</span>
                <span>{item.hours} hrs</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${(item.hours / maxHours) * 100}%` }}></div>
              </div>
            </div>
          ))
        ) : (
          <p style={styles.emptyText}>No study hours logged</p>
        )}
      </div>

      <div style={styles.hoursContainer}>
        <h2>Top Courses</h2>
        {topCourses.length > 0 ? (
          topCourses.map(item => (
            <div key={item.id} style={styles.courseBar}>
              <div style={styles.barLabel}>
                <span>{item.course || item.title}</span>
                <span>Grade: {item.grade}</span>
              </div>
            </div>
          ))
        ) : (
          <p style={styles.emptyText}>No top courses</p>
        )}
      </div>
    </div>
  );
}

export default StudyPlannerPage;
