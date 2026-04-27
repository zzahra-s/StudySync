import React, { useEffect, useState } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

function BooksPage() {
  const { user } = useAuth();
  const studentId = user?.studentId || user?.id;
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [books, setBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', author: '', isbn: '' });

  const fetchCourses = async () => {
    try {
      const response = await api.get(`/students/${studentId}/courses`);
      setCourses(response.data || []);
      if (response.data?.length > 0) {
        setSelectedCourseId(response.data[0].id);
      }
    } catch (err) {
      setCourses([]);
    }
  };

  const fetchBooks = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/courses/${courseId}/books`);
      setBooks(response.data || []);
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [studentId]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchBooks(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/books/search?q=${searchQuery}`);
      setSearchResults(response.data || []);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setShowForm(true);
    setEditingId(null);
    setForm({ title: '', author: '', isbn: '' });
  };

  const handleEditClick = (book) => {
    setShowForm(true);
    setEditingId(book.id);
    setForm({ title: book.title, author: book.author, isbn: book.isbn || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, form);
      } else {
        await api.post('/books', { ...form, courseId: selectedCourseId, studentId });
      }
      setShowForm(false);
      setForm({ title: '', author: '', isbn: '' });
      fetchBooks(selectedCourseId);
    } catch (err) {
      setError('Failed to save book');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this book?')) {
      try {
        await api.delete(`/books/${id}`);
        fetchBooks(selectedCourseId);
      } catch (err) {
        setError('Failed to delete book');
      }
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
    selector: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: 'bold' },
    select: { padding: '8px', width: '100%', maxWidth: '300px', borderRadius: '4px', border: '1px solid #ccc' },
    searchBox: { marginBottom: '20px', display: 'flex', gap: '10px' },
    searchInput: { flex: 1, maxWidth: '300px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
    searchBtn: { padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    form: { border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px', maxWidth: '500px' },
    input: { display: 'block', width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
    btn: { padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    editBtn: { padding: '6px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    deleteBtn: { padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    bookRow: { border: '1px solid #ddd', padding: '12px', marginBottom: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    bookInfo: { flex: 1 }
  };

  return (
    <div style={styles.container}>
      <h1>Books</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={styles.selector}>
        <label style={styles.label}>Select Course:</label>
        {courses.length > 0 ? (
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={styles.select}
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name || course.title}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Enter course ID"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={styles.select}
          />
        )}
      </div>

      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <button onClick={handleSearch} style={styles.searchBtn}>Search</button>
      </div>

      {searchResults.length > 0 && (
        <div>
          <h3>Search Results for "{searchQuery}"</h3>
          {searchResults.map(book => (
            <div key={book.id} style={styles.bookRow}>
              <div style={styles.bookInfo}>
                <p><strong>{book.title}</strong> by {book.author}</p>
                {book.isbn && <p>ISBN: {book.isbn}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {!searchResults.length && (
        <>
          <button onClick={handleAddClick} style={{ ...styles.btn, marginBottom: '20px' }}>+ Add Book</button>

          {showForm && (
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleFormChange}
                required
                style={styles.input}
              />
              <input
                type="text"
                name="author"
                placeholder="Author"
                value={form.author}
                onChange={handleFormChange}
                required
                style={styles.input}
              />
              <input
                type="text"
                name="isbn"
                placeholder="ISBN (optional)"
                value={form.isbn}
                onChange={handleFormChange}
                style={styles.input}
              />
              <button type="submit" style={{ ...styles.btn, marginRight: '10px' }}>Save</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ ...styles.btn, backgroundColor: '#999' }}>Cancel</button>
            </form>
          )}

          {loading && <p>Loading books...</p>}

          <div>
            <h3>Books in Course</h3>
            {books.length > 0 ? (
              books.map(book => (
                <div key={book.id} style={styles.bookRow}>
                  <div style={styles.bookInfo}>
                    <p><strong>{book.title}</strong></p>
                    <p>Author: {book.author}</p>
                    {book.isbn && <p>ISBN: {book.isbn}</p>}
                  </div>
                  <div>
                    <button onClick={() => handleEditClick(book)} style={styles.editBtn}>Edit</button>
                    <button onClick={() => handleDelete(book.id)} style={styles.deleteBtn}>Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No books yet</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default BooksPage;
