const pool = require('../config/Database');

const getBooksByCourse = async (courseId) => {
  const query = `
    SELECT book_id, course_id, title, author, isbn
    FROM Books
    WHERE course_id = ?
    ORDER BY title ASC
  `;
  const [rows] = await pool.query(query, [courseId]);
  return rows;
};

const getBookById = async (bookId) => {
  const query = `
    SELECT book_id, course_id, title, author, isbn
    FROM Books
    WHERE book_id = ?
  `;
  const [rows] = await pool.query(query, [bookId]);
  return rows[0] || null;
};

const createBook = async ({ courseId, title, author = null, isbn = null }) => {
  const query = `
    INSERT INTO Books (course_id, title, author, isbn)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await pool.query(query, [courseId, title, author, isbn]);
  return { book_id: result.insertId, course_id: courseId, title, author, isbn };
};

const updateBook = async (bookId, { title, author, isbn }) => {
  const fields = [];
  const params = [];

  if (title !== undefined) { fields.push('title = ?'); params.push(title); }
  if (author !== undefined) { fields.push('author = ?'); params.push(author); }
  if (isbn !== undefined) { fields.push('isbn = ?'); params.push(isbn); }

  if (!fields.length) return { affectedRows: 0 };

  params.push(bookId);
  const query = `UPDATE Books SET ${fields.join(', ')} WHERE book_id = ?`;
  const [result] = await pool.query(query, params);
  return result;
};

const deleteBook = async (bookId) => {
  const query = `DELETE FROM Books WHERE book_id = ?`;
  const [result] = await pool.query(query, [bookId]);
  return result;
};

const searchBooks = async (keyword) => {
  const query = `
    SELECT book_id, course_id, title, author, isbn
    FROM Books
    WHERE LOWER(title) LIKE ? OR LOWER(author) LIKE ?
    ORDER BY title ASC
  `;
  const term = `%${keyword.toLowerCase()}%`;
  const [rows] = await pool.query(query, [term, term]);
  return rows;
};

module.exports = {
  getBooksByCourse,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks
};