const { poolPromise } = require('../config/Database');

/**
 * Get books by course
 */
const getBooksByCourse = async (courseId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('courseId', poolPromise.sql.Int, courseId)
    .query(`
      SELECT book_id, course_id, title, author, isbn
      FROM Books
      WHERE course_id = @courseId
      ORDER BY title ASC
    `);
  return result.recordset;
};

/**
 * Get single book
 */
const getBookById = async (bookId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('bookId', poolPromise.sql.Int, bookId)
    .query(`
      SELECT book_id, course_id, title, author, isbn
      FROM Books
      WHERE book_id = @bookId
    `);
  return result.recordset[0] || null;
};

/**
 * Create book
 */
const createBook = async ({ courseId, title, author, isbn }) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('courseId', poolPromise.sql.Int, courseId)
    .input('title', poolPromise.sql.NVarChar(255), title)
    .input('author', poolPromise.sql.NVarChar(200), author)
    .input('isbn', poolPromise.sql.NVarChar(20), isbn)
    .query(`
      INSERT INTO Books (course_id, title, author, isbn)
      OUTPUT INSERTED.*
      VALUES (@courseId, @title, @author, @isbn)
    `);
  return result.recordset[0];
};

/**
 * Update book
 */
const updateBook = async (bookId, { title, author, isbn }) => {
  const pool = await poolPromise;
  let query = 'UPDATE Books SET ';
  const params = [];
  
  if (title !== undefined) {
    query += 'title = @title, ';
    params.push({ name: 'title', type: poolPromise.sql.NVarChar(255), value: title });
  }
  if (author !== undefined) {
    query += 'author = @author, ';
    params.push({ name: 'author', type: poolPromise.sql.NVarChar(200), value: author });
  }
  if (isbn !== undefined) {
    query += 'isbn = @isbn, ';
    params.push({ name: 'isbn', type: poolPromise.sql.NVarChar(20), value: isbn });
  }
  
  if (params.length === 0) return { rowsAffected: 0 };
  
  query = query.slice(0, -2) + ' WHERE book_id = @bookId';
  params.push({ name: 'bookId', type: poolPromise.sql.Int, value: bookId });
  
  const request = pool.request();
  params.forEach(p => request.input(p.name, p.type, p.value));
  const result = await request.query(query);
  return result;
};

/**
 * Delete book
 */
const deleteBook = async (bookId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('bookId', poolPromise.sql.Int, bookId)
    .query('DELETE FROM Books WHERE book_id = @bookId');
  return result;
};

/**
 * Search books
 */
const searchBooks = async (keyword) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('keyword', poolPromise.sql.NVarChar, `%${keyword.toLowerCase()}%`)
    .query(`
      SELECT book_id, course_id, title, author, isbn
      FROM Books
      WHERE LOWER(title) LIKE @keyword OR LOWER(author) LIKE @keyword
      ORDER BY title ASC
    `);
  return result.recordset;
};

module.exports = {
  getBooksByCourse,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks
};

