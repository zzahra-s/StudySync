import React, { useCallback, useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

function BooksPage() {
  const { user } = useAuth();
  const studentId = user?.studentId;

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const fetchBooks = useCallback(async (courseId) => {
    if (!courseId) {
      setBooks([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/courses/${courseId}/book-materials`);
      const list = Array.isArray(response.data) ? response.data : [];
      setBooks(list);
    } catch (err) {
      setBooks([]);
      setError(err?.response?.data?.message || 'Failed to load books.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchBooks(selectedCourseId);
  }, [selectedCourseId, fetchBooks]);

  return (
    <div className="page-container">
      <h1 className="page-title">Book Material</h1>
      <p className="description">Choose a course to view teacher-recommended books.</p>

      <div className="card">
        <div className="form-group">
          <label htmlFor="bookCourseSelect">Select Course</label>
          <select
            id="bookCourseSelect"
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

        {selectedCourseId && (
          <p className="description" style={{ marginBottom: '12px' }}>
            For this course, your teacher recommends the following books:
          </p>
        )}

        {loading && <p>Loading books...</p>}
        {error && <p className="error">{error}</p>}

        <div className="materials-grid">
          {!loading && selectedCourseId && books.length === 0 && (
            <div className="empty-state">No recommended books found for this course.</div>
          )}

          {books.map((book) => (
            <article key={book.id} className="material-card">
              <h3>{book.title}</h3>
              <p><strong>Author:</strong> {book.author}</p>
              <p>{book.description || 'No description available.'}</p>
              {book.pdfLink ? (
                <a href={book.pdfLink} target="_blank" rel="noreferrer">Open PDF</a>
              ) : (
                <span className="text-muted">No PDF link</span>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BooksPage;