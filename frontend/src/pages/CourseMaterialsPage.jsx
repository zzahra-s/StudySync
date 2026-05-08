import React, { useCallback, useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

function CourseMaterialsPage() {
  const { user } = useAuth();
  const studentId = user?.studentId;

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [weightages, setWeightages] = useState({
    quizzesPercentage: 0,
    assignmentsPercentage: 0,
    midtermPercentage: 0,
    finalPercentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchCourses = useCallback(async () => {
    if (!studentId) return;

    try {
      const response = await api.get(`/students/${studentId}/course-options`);
      const list = Array.isArray(response.data) ? response.data : [];
      setCourses(list);
    } catch {
      setCourses([]);
    }
  }, [studentId]);

  const fetchWeightages = useCallback(async (courseId) => {
    if (!courseId) {
      setWeightages({
        quizzesPercentage: 0,
        assignmentsPercentage: 0,
        midtermPercentage: 0,
        finalPercentage: 0
      });
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.get(`/courses/${courseId}/course-material`);
      setWeightages({
        quizzesPercentage: Number(response.data.quizzesPercentage || 0),
        assignmentsPercentage: Number(response.data.assignmentsPercentage || 0),
        midtermPercentage: Number(response.data.midtermPercentage || 0),
        finalPercentage: Number(response.data.finalPercentage || 0)
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load course material.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchWeightages(selectedCourseId);
  }, [selectedCourseId, fetchWeightages]);

  const handleChange = (field, value) => {
    setWeightages((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!selectedCourseId) {
      setError('Please select a course first.');
      return;
    }

    const total = Object.values(weightages).reduce((sum, val) => sum + Number(val || 0), 0);
    if (total !== 100) {
      setError('Weightages must add up to 100%.');
      return;
    }

    try {
      await api.put(`/courses/${selectedCourseId}/course-material`, weightages);
      setMessage('Weightages saved successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save weightages.');
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Course Material</h1>
      <p className="description">Set and manage assessment weightages for each course.</p>

      <div className="card">
        <div className="form-group">
          <label htmlFor="courseSelect">Select Course</label>
          <select
            id="courseSelect"
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

        <form onSubmit={handleSave}>
          <div className="weightage-grid">
            <div className="form-group">
              <label>Quizzes (%)</label>
              <input type="number" min="0" max="100" value={weightages.quizzesPercentage} onChange={(e) => handleChange('quizzesPercentage', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Assignments (%)</label>
              <input type="number" min="0" max="100" value={weightages.assignmentsPercentage} onChange={(e) => handleChange('assignmentsPercentage', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Midterm (%)</label>
              <input type="number" min="0" max="100" value={weightages.midtermPercentage} onChange={(e) => handleChange('midtermPercentage', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Final (%)</label>
              <input type="number" min="0" max="100" value={weightages.finalPercentage} onChange={(e) => handleChange('finalPercentage', e.target.value)} />
            </div>
          </div>
          {loading && <p>Loading course material...</p>}
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
          <button type="submit" disabled={!selectedCourseId}>Save Weightages</button>
        </form>
      </div>
    </div>
  );
}

export default CourseMaterialsPage;