import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

function DeadlinesPage() {
  const { user } = useAuth();
  const studentId = user?.studentId;

  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
    status: 'Pending',
    courseId: ''
  });

  const normalizeDate = (value) => {
    if (!value) return '';
    return String(value).split('T')[0];
  };

  const fetchDeadlines = async () => {
    if (!studentId) return;

    setLoading(true);
    setError('');
    try {
      let url = `/students/${studentId}/deadlines`;
      if (filterStatus) {
        url += `?status=${encodeURIComponent(filterStatus)}`;
      }
      const response = await api.get(url);
      setDeadlines(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load deadlines.');
      setDeadlines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, [studentId, filterStatus]);

  const resetForm = () => {
    setFormData({ title: '', dueDate: '', status: 'Pending', courseId: '' });
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

    try {
      const payload = {
        title: formData.title,
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
    <div style={{ padding: '20px' }}>
      <h1>Deadlines</h1>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {filterButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={() => setFilterStatus(button.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              backgroundColor: filterStatus === button.value ? '#e7f0ff' : '#fff',
              cursor: 'pointer'
            }}
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
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '12px', marginBottom: '12px' }}>
          <div style={{ marginBottom: '8px' }}>
            <label htmlFor="title">Title: </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleFormChange}
              required
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label htmlFor="dueDate">Due Date: </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleFormChange}
              required
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label htmlFor="status">Status: </label>
            <select id="status" name="status" value={formData.status} onChange={handleFormChange}>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label htmlFor="courseId">Course ID: </label>
            <input
              id="courseId"
              name="courseId"
              type="text"
              value={formData.courseId}
              onChange={handleFormChange}
              required
            />
          </div>
          <button type="submit">{editingDeadline ? 'Update Deadline' : 'Create Deadline'}</button>
        </form>
      )}

      <div>
        {deadlines.length === 0 && !loading ? (
          <p>No deadlines found.</p>
        ) : (
          deadlines.map((deadline) => (
            <div key={deadline.id} style={{ border: '1px solid #ddd', padding: '12px', marginBottom: '10px' }}>
              <p><strong>Title:</strong> {deadline.title}</p>
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
  );
}

export default DeadlinesPage;