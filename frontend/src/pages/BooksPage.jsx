import React, { useEffect, useState } from 'react';
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
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: ''
  });

  const fetchCourses = async () => {
    if (!studentId) return;

    try {
      const response = await api.get(`/students/${studentId}/courses`);
      const list = Array.isArray(response.data) ? response.data : [];
      setCourses(list);
      if (list.length > 0) {
        const firstId = list[0].id || list[0].course_id;
        setSelectedCourseId(String(firstId || ''));
      }
    } catch {
      setCourses([]);
    }
  };

  const fetchBooks = async (courseId) => {
    if (!courseId) {
      setBooks([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/courses/${courseId}/books`);
      const list = Array.isArray(response.data) ? response.data : [];
      setBooks(list);
    } catch (err) {
      setBooks([]);
      setError(err?.response?.data?.message || 'Failed to load books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [studentId]);

  useEffect(() => {
    fetchBooks(selectedCourseId);
  }, [selectedCourseId]);

  const resetBookForm = () => {
    setBookForm({ title: '', author: '', isbn: '' });
    setEditingBook(null);
  };

  const handleBookInput = (e) => {
    const { name, value } = e.target;
    setBookForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBook = () => {
    resetBookForm();
    setShowBookForm(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || ''
    });
    setShowBookForm(true);
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await api.delete(`/books/${id}`);
      fetchBooks(selectedCourseId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete book.');
    }
  };

  const handleSubmitBook = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, bookForm);
      } else {
        await api.post('/books', {
          course_id: selectedCourseId,
          title: bookForm.title,
          author: bookForm.author,
          isbn: bookForm.isbn
        });
      }

      setShowBookForm(false);
      resetBookForm();
      fetchBooks(selectedCourseId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save book.');
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      return;
    }

    setError('');
    try {
      const response = await api.get(`/books/search?q=${encodeURIComponent(searchKeyword)}`);
      setSearchResults(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to search books.');
      setSearchResults([]);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Books</h1>

      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="bookCourseSelect">Course: </label>
        {courses.length > 0 ? (
          <select
            id="bookCourseSelect"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            {courses.map((course) => {
              const courseId = course.id || course.course_id;
              return (
                <option key={courseId} value={courseId}>
                  {course.course_name || course.courseName || course.name || `Course ${courseId}`}
                </option>
              );
            })}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Enter course ID"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          />
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button type="button" onClick={handleAddBook}>Add Book</button>
      </div>

      {showBookForm && (
        <form onSubmit={handleSubmitBook} style={{ border: '1px solid #ddd', padding: '12px', marginBottom: '16px' }}>
          <h3>{editingBook ? 'Edit Book' : 'Add Book'}</h3>
          <div style={{ marginBottom: '8px' }}>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={bookForm.title}
              onChange={handleBookInput}
              required
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <input
              type="text"
              name="author"
              placeholder="Author"
              value={bookForm.author}
              onChange={handleBookInput}
              required
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <input
              type="text"
              name="isbn"
              placeholder="ISBN"
              value={bookForm.isbn}
              onChange={handleBookInput}
            />
          </div>
          <button type="submit" style={{ marginRight: '8px' }}>
            {editingBook ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={() => setShowBookForm(false)}>Cancel</button>
        </form>
      )}

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search books..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ marginRight: '8px' }}
        />
        <button type="button" onClick={handleSearch}>Search</button>
      </div>

      {loading && <p>Loading books...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section style={{ marginBottom: '24px' }}>
        <h2>Course Books</h2>
        {books.length === 0 && !loading ? (
          <p>No books</p>
        ) : (
          books.map((book) => (
            <div key={book.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '8px' }}>
              <p><strong>{book.title}</strong></p>
              <p>Author: {book.author}</p>
              <p>ISBN: {book.isbn || 'N/A'}</p>
              <button type="button" onClick={() => handleEditBook(book)} style={{ marginRight: '8px' }}>
                Edit
              </button>
              <button type="button" onClick={() => handleDeleteBook(book.id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </section>

      <section>
        <h2>Search Results</h2>
        {searchResults.length === 0 ? (
          <p>No results</p>
        ) : (
          searchResults.map((book, index) => (
            <div
              key={book.id || `${book.title}-${index}`}
              style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '8px' }}
            >
              <p><strong>{book.title}</strong></p>
              <p>Author: {book.author}</p>
              <p>ISBN: {book.isbn || 'N/A'}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default BooksPage;