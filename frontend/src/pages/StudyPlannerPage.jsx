import React, { useEffect, useMemo, useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

function StudyPlannerPage() {
  const { user } = useAuth();
  const studentId = user?.studentId;

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState('');

  const [studyHours, setStudyHours] = useState([]);
  const [hoursLoading, setHoursLoading] = useState(false);
  const [hoursError, setHoursError] = useState('');

  const [topCourses, setTopCourses] = useState([]);
  const [topCoursesLoading, setTopCoursesLoading] = useState(false);
  const [topCoursesError, setTopCoursesError] = useState('');

  const toDateOnly = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  };

  const formatDate = (value) => {
    const date = toDateOnly(value);
    if (!date) return 'N/A';
    return date.toISOString().split('T')[0];
  };

  const normalizeTask = (task) => ({
    id: task.id || task.taskId || `${task.title}-${task.dueDate}`,
    title: task.title || 'Untitled Task',
    courseName: task.courseName || task.course || 'N/A',
    dueDate: task.dueDate || task.due_date || null
  });

  const normalizeCourseHours = (item, index) => ({
    id: item.id || `${item.courseName || item.course || 'course'}-${index}`,
    courseName: item.courseName || item.course || item.subject || item.fullCourseName || 'N/A',
    totalHours: Number(item.totalHours ?? item.hours ?? item.grade ?? 0)
  });

  const fetchTasks = async () => {
    if (!studentId) return;
    setTasksLoading(true);
    setTasksError('');

    try {
      const response = await api.get(`/students/${studentId}/study-planner`);
      const list = Array.isArray(response.data) ? response.data : [];
      setTasks(list.map(normalizeTask));
    } catch (err) {
      setTasks([]);
      setTasksError(err?.response?.data?.message || 'Failed to load study planner tasks.');
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchStudyHours = async () => {
    if (!studentId) return;
    setHoursLoading(true);
    setHoursError('');

    try {
      const response = await api.get(`/students/${studentId}/study-hours`);
      const list = Array.isArray(response.data) ? response.data : [];
      const normalized = list.map(normalizeCourseHours);

      const aggregated = normalized.reduce((acc, item) => {
        const key = item.courseName;
        acc[key] = (acc[key] || 0) + (Number(item.totalHours) || 0);
        return acc;
      }, {});

      const summary = Object.entries(aggregated).map(([courseName, totalHours], index) => ({
        id: `${courseName}-${index}`,
        courseName,
        totalHours
      }));

      setStudyHours(summary);
    } catch (err) {
      setStudyHours([]);
      setHoursError(err?.response?.data?.message || 'Failed to load study hours.');
    } finally {
      setHoursLoading(false);
    }
  };

  const fetchTopCourses = async () => {
    if (!studentId) return;
    setTopCoursesLoading(true);
    setTopCoursesError('');

    try {
      const response = await api.get(`/students/${studentId}/top-courses`);
      const list = Array.isArray(response.data) ? response.data : [];
      setTopCourses(list.map(normalizeCourseHours).slice(0, 5));
    } catch (err) {
      setTopCourses([]);
      setTopCoursesError(err?.response?.data?.message || 'Failed to load top courses.');
    } finally {
      setTopCoursesLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStudyHours();
    fetchTopCourses();
  }, [studentId]);

  const groupedTasks = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const groups = {
      todayTasks: [],
      thisWeekTasks: [],
      laterTasks: []
    };

    tasks.forEach((task) => {
      const due = toDateOnly(task.dueDate);
      if (!due) return;

      if (due.getTime() === today.getTime()) {
        groups.todayTasks.push(task);
      } else if (due > today && due <= sevenDaysLater) {
        groups.thisWeekTasks.push(task);
      } else if (due > sevenDaysLater) {
        groups.laterTasks.push(task);
      }
    });

    return groups;
  }, [tasks]);

  const renderTaskSection = (heading, list) => (
    <section style={{ marginBottom: '20px' }}>
      <h2>{heading}</h2>
      {list.length === 0 ? (
        <p>No tasks</p>
      ) : (
        list.map((task) => (
          <div key={task.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '8px' }}>
            <p><strong>{task.title}</strong></p>
            <p>Course: {task.courseName}</p>
            <p>Due: {formatDate(task.dueDate)}</p>
          </div>
        ))
      )}
    </section>
  );

  const renderHoursBarSection = (heading, items) => {
    const maxHours = items.reduce((max, item) => Math.max(max, item.totalHours || 0), 0);

    return (
      <section style={{ marginTop: '28px' }}>
        <h2>{heading}</h2>
        {items.length === 0 ? (
          <p>No data</p>
        ) : (
          items.map((item) => {
            const barWidth = maxHours > 0 ? (item.totalHours / maxHours) * 100 : 0;
            return (
              <div key={item.id} style={{ marginBottom: '12px' }}>
                <p style={{ marginBottom: '6px' }}>
                  {item.courseName}: {item.totalHours}
                </p>
                <div style={{ width: '100%', height: '20px', backgroundColor: '#e5e7eb' }}>
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: '20px',
                      backgroundColor: '#4f46e5'
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </section>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Study Planner</h1>

      {tasksLoading && <p>Loading planner tasks...</p>}
      {tasksError && <p style={{ color: 'red' }}>{tasksError}</p>}

      {renderTaskSection('Today', groupedTasks.todayTasks)}
      {renderTaskSection('This Week', groupedTasks.thisWeekTasks)}
      {renderTaskSection('Later', groupedTasks.laterTasks)}

      {hoursLoading && <p>Loading study hours...</p>}
      {hoursError && <p style={{ color: 'red' }}>{hoursError}</p>}
      {!hoursLoading && !hoursError && renderHoursBarSection('Study Hours Summary', studyHours)}

      {topCoursesLoading && <p>Loading top courses...</p>}
      {topCoursesError && <p style={{ color: 'red' }}>{topCoursesError}</p>}
      {!topCoursesLoading && !topCoursesError && renderHoursBarSection('Top Courses by Study Time', topCourses)}
    </div>
  );
}

export default StudyPlannerPage;