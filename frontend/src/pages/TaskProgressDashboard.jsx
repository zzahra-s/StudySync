import React, { useCallback, useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

function TaskProgressDashboard() {
  const { user } = useAuth();
  const studentId = Number(user?.studentId || user?.id || 1);

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = useCallback(async () => {
    try {
      const response = await api.get(`/students/${studentId}/course-options`);
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch {
      setCourses([]);
    }
  }, [studentId]);

  const fetchTasks = useCallback(async (courseId) => {
    if (!courseId) {
      setTasks([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/students/${studentId}/task-manager?courseId=${courseId}`);
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchTasks(selectedCourseId);
  }, [selectedCourseId, fetchTasks]);

  const addTask = async () => {
    if (!newTaskTitle.trim() || !selectedCourseId) return;
    try {
      await api.post('/task-manager', {
        userId: studentId,
        courseId: selectedCourseId,
        title: newTaskTitle.trim(),
        status: 'todo'
      });
      setNewTaskTitle('');
      fetchTasks(selectedCourseId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add task.');
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/task-manager/${taskId}/status`, { status });
      fetchTasks(selectedCourseId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update task.');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/task-manager/${taskId}`);
      fetchTasks(selectedCourseId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete task.');
    }
  };

  const todoTasks = tasks.filter((task) => task.status === 'todo');
  const doneTasks = tasks.filter((task) => task.status === 'done');

  return (
    <div className="page-container">
      <h1 className="page-title">Task Manager</h1>
      <p className="description">Manage todo and done tasks per course.</p>

      <div className="card">
        <div className="form-group">
          <label htmlFor="taskCourseSelect">Select Course</label>
          <select id="taskCourseSelect" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseName} ({course.courseCode})
              </option>
            ))}
          </select>
        </div>

        <div className="task-input-row">
          <input
            type="text"
            placeholder="Add a task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button type="button" onClick={addTask} disabled={!selectedCourseId}>Add Task</button>
        </div>

        {loading && <p>Loading tasks...</p>}
        {error && <p className="error">{error}</p>}

        <div className="task-columns">
          <section className="task-column">
            <h3>Todo List</h3>
            {todoTasks.length === 0 ? <p className="empty-state">No todo tasks.</p> : todoTasks.map((task) => (
              <div key={task.id} className="task-item">
                <span>{task.title}</span>
                <div>
                  <button type="button" onClick={() => updateStatus(task.id, 'done')}>Done</button>
                  <button type="button" className="btn-danger" onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </div>
            ))}
          </section>
          <section className="task-column">
            <h3>Done List</h3>
            {doneTasks.length === 0 ? <p className="empty-state">No completed tasks.</p> : doneTasks.map((task) => (
              <div key={task.id} className="task-item">
                <span>{task.title}</span>
                <div>
                  <button type="button" className="btn-secondary" onClick={() => updateStatus(task.id, 'todo')}>Move to Todo</button>
                  <button type="button" className="btn-danger" onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

export default TaskProgressDashboard;