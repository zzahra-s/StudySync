import React, { useCallback, useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

function DeadlinesPage() {
  const { user } = useAuth();
  const studentId = user?.studentId;

  const [deadlines, setDeadlines] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'Pending',
    courseId: ''
  });

  const normalizeDate = (value) => {
    if (!value) return '';
    return String(value).split('T')[0];
  };

  const fetchCourses = useCallback(async () => {
    if (!studentId) return;
    try {
      const response = await api.get(`/students/${studentId}/course-options`);
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch {
      setCourses([]);
    }
  }, [studentId]);

  const fetchDeadlines = useCallback(async () => {
    if (!studentId) return;

    setLoading(true);
    setError('');
    try {
      let url = `/students/${studentId}/deadlines`;
      if (filterStatus) {
        url += `?status=${encodeURIComponent(filterStatus)}`;
      }
      if (selectedCourseId) {
        url += `${filterStatus ? '&' : '?'}courseId=${encodeURIComponent(selectedCourseId)}`;
      }
      const response = await api.get(url);
      setDeadlines(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load deadlines.');
      setDeadlines([]);
    } finally {
      setLoading(false);
    }
  }, [studentId, filterStatus, selectedCourseId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchDeadlines();
  }, [fetchDeadlines]);

  const resetForm = () => {
    setFormData({ title: '', description: '', dueDate: '', status: 'Pending', courseId: '' });
    setEditingDeadline(null);
  };

  const handleAddDeadline = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (deadline) => {
    setEditingDeadline(deadline);
    setFormData({
      title: deadline.title || '',
      description: deadline.description || '',
      dueDate: normalizeDate(deadline.dueDate || deadline.due_date),
      status: deadline.status || 'Pending',
      courseId: String(deadline.courseId || deadline.course_id || '')
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deadline?')) return;

    try {
      await api.delete(`/deadlines/${id}`);
      fetchDeadlines();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete deadline.');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.courseId) {
      setError('Please select a course.');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        due_date: formData.dueDate,
        status: formData.status,
        course_id: formData.courseId
      };

      if (editingDeadline) {
        await api.put(`/deadlines/${editingDeadline.id}`, payload);
      } else {
        await api.post('/deadlines', payload);
      }

      setShowForm(false);
      setEditingDeadline(null);
      resetForm();
      fetchDeadlines();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save deadline.');
    }
  };

  const filterButtons = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Completed', value: 'completed' }
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">Deadlines</h1>
      <p className="description">Track your course deadlines and keep tasks in sync.</p>

      <div className="card">
      <div className="form-group">
        <label htmlFor="deadlineCourseFilter">Select Course</label>
        <select
          id="deadlineCourseFilter"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.courseName} ({course.courseCode})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {filterButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={() => setFilterStatus(button.value)}
            className={`deadline-filter-btn ${filterStatus === button.value ? 'is-active' : ''}`}
          >
            {button.label}
          </button>
        ))}
      </div>

      <button type="button" onClick={handleAddDeadline} style={{ marginBottom: '12px' }}>
        Add Deadline
      </button>

      {loading && <p>Loading deadlines...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="card deadline-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows="3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="courseId">Select Course</label>
            <select id="courseId" name="courseId" value={formData.courseId} onChange={handleFormChange} required>
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName} ({course.courseCode})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleFormChange}>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <button type="submit">{editingDeadline ? 'Update Deadline' : 'Create Deadline'}</button>
        </form>
      )}

      <div className="deadline-grid">
        {deadlines.length === 0 && !loading ? (
          <p className="empty-state">No deadlines found.</p>
        ) : (
          deadlines.map((deadline) => (
            <div key={deadline.id} className="deadline-card">
              <p><strong>{deadline.title}</strong></p>
              <p>{deadline.description || 'No description added.'}</p>
              <p><strong>Course:</strong> {deadline.course || deadline.courseName || 'N/A'}</p>
              <p><strong>Due Date:</strong> {normalizeDate(deadline.dueDate || deadline.due_date)}</p>
              <p><strong>Status:</strong> {deadline.status}</p>
              <button type="button" onClick={() => handleEdit(deadline)} style={{ marginRight: '8px' }}>
                Edit
              </button>
              <button type="button" onClick={() => handleDelete(deadline.id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}

export default DeadlinesPage;