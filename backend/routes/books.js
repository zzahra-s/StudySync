const express = require('express');
const router = express.Router();
const { getConnectionPool } = require('../db');

router.get('/students/:studentId/books', async (req, res) => {
  const { studentId } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('studentId', parseInt(studentId));

    const result = await request.query(`
      SELECT b.book_id as id, b.title, b.author, b.isbn, c.course_name as course,
             c.course_code as courseCode
      FROM Books b
      JOIN Courses c ON b.course_id = c.course_id
      JOIN Semesters s ON c.semester_id = s.semester_id
      WHERE s.student_id = @studentId
      ORDER BY b.title ASC
    `);

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ message: 'Failed to fetch books', error: err.message });
  }
});

router.get('/courses/:courseId/books', async (req, res) => {
  const { courseId } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('courseId', parseInt(courseId));

    const result = await request.query(`
      SELECT book_id as id, title, author, isbn
      FROM Books
      WHERE course_id = @courseId
      ORDER BY title ASC
    `);

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching books for course:', err);
    res.status(500).json({ message: 'Failed to fetch books for course', error: err.message });
  }
});

router.post('/books', async (req, res) => {
  const { course_id, title, author, isbn } = req.body;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('course_id', course_id);
    request.input('title', title);
    request.input('author', author);
    request.input('isbn', isbn || null);

    const result = await request.query(`
      INSERT INTO Books (course_id, title, author, isbn)
      OUTPUT INSERTED.book_id
      VALUES (@course_id, @title, @author, @isbn)
    `);

    res.json({
      message: 'Book added successfully',
      book_id: result.recordset[0].book_id
    });
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(500).json({ message: 'Failed to add book', error: err.message });
  }
});

router.put('/books/:id', async (req, res) => {
  const { id } = req.params;
  const { title, author, isbn } = req.body;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('id', parseInt(id));
    request.input('title', title);
    request.input('author', author);
    request.input('isbn', isbn);

    await request.query(`
      UPDATE Books
      SET title = @title, author = @author, isbn = @isbn
      WHERE book_id = @id
    `);

    res.json({ message: 'Book updated successfully' });
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({ message: 'Failed to update book', error: err.message });
  }
});

router.delete('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('id', parseInt(id));

    await request.query('DELETE FROM Books WHERE book_id = @id');

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ message: 'Failed to delete book', error: err.message });
  }
});

module.exports = router;

router.delete('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('id', id);
    await request.query('DELETE FROM Books WHERE id = @id');

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ message: 'Failed to delete book' });
  }
});

router.get('/books/search', async (req, res) => {
  const { q } = req.query;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('query', `%${q}%`);

    const result = await request.query(`
      SELECT id, title, author, isbn
      FROM Books
      WHERE title LIKE @query OR author LIKE @query
    `);

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error searching books:', err);
    res.status(500).json({ message: 'Search failed' });
  }
});

module.exports = router;
