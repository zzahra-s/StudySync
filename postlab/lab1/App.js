import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/books')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch books');
        return res.json();
      })
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const genreColors = {
    'Programming': '#4f8ef7',
    'Software Engineering': '#a259f7',
    'JavaScript': '#f7c948',
    'Databases': '#4fcf70',
    'Node.js': '#f76b4f',
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-icon">📚</span>
          <div>
            <h1 className="header-title">BookShelf</h1>
            <p className="header-subtitle">Recommended reads for CS students</p>
          </div>
        </div>
      </header>

      <main className="main">
        {loading && (
          <div className="status-box">
            <div className="spinner"></div>
            <p>Loading books from backend...</p>
          </div>
        )}

        {error && (
          <div className="status-box error">
            <span>⚠️</span>
            <p>{error} — is the backend running on port 5000?</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="count-label">{books.length} books available</p>
            <ul className="book-list">
              {books.map((book) => (
                <li key={book.id} className="book-card">
                  <div className="book-number">#{book.id.toString().padStart(2, '0')}</div>
                  <div className="book-info">
                    <h2 className="book-title">{book.title}</h2>
                    <p className="book-author">by {book.author}</p>
                    <div className="book-meta">
                      <span
                        className="book-genre"
                        style={{ backgroundColor: genreColors[book.genre] || '#888' }}
                      >
                        {book.genre}
                      </span>
                      <span className="book-year">{book.year}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

export default App;