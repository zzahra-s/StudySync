import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

function TaskProgressDashboard() {
  const { user } = useAuth();
  const studentId = Number(user?.studentId || user?.id || 1);

  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSemesters = async () => {
    if (!studentId) return;
    try {
      const response = await api.get(`/students/${studentId}/semesters`);
      setSemesters(Array.isArray(response.data) ? response.data : []);
    } catch {
      setSemesters([]);
    }
  };

  const fetchSemesterCourses = async (semesterId) => {
    if (!semesterId) {
      setCourses([]);
      return;
    }
    try {
      const response = await api.get(`/semesters/${semesterId}/courses`);
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch {
      setCourses([]);
    }
  };

  const fetchTasks = async (courseId) => {
    if (!courseId) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/students/${studentId}/task-manager?courseId=${courseId}`);
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, [studentId]);

  useEffect(() => {
    if (selectedSemesterId) {
      fetchSemesterCourses(selectedSemesterId);
      setSelectedCourseId('');
    } else {
      setCourses([]);
      setSelectedCourseId('');
      setTasks([]);
    }
  }, [selectedSemesterId]);

  useEffect(() => {
    fetchTasks(selectedCourseId);
  }, [selectedCourseId, studentId]);

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
          <label htmlFor="taskSemesterSelect">Select Semester</label>
          <select
            id="taskSemesterSelect"
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
          >
            <option value="">Select Semester</option>
            {semesters.map((semester) => (
              <option key={semester.semester_id || semester.id} value={semester.semester_id || semester.id}>
                {semester.semester_name || semester.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="taskCourseSelect">Select Course</label>
          <select
            id="taskCourseSelect"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={!selectedSemesterId}
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.course_id || course.id} value={course.course_id || course.id}>
                {course.course_name || course.courseName || course.name} ({course.course_code || course.courseCode || course.code})
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
            disabled={!selectedCourseId}
          />
          <button type="button" onClick={addTask} disabled={!selectedCourseId || !newTaskTitle.trim()}>Add Task</button>
        </div>

        {loading && <p>Loading tasks...</p>}
        {error && <p className="error">{error}</p>}

        {!selectedSemesterId ? (
          <p className="empty-state">Select a semester first to choose a course and manage tasks.</p>
        ) : !selectedCourseId ? (
          <p className="empty-state">Select a course to see its task list.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}

export default TaskProgressDashboard;