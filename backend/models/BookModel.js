const { sql, poolPromise } = require('../config/Database');

const getBooksByCourse = async (courseId) => {
  const pool = await poolPromise;
  const result = await pool.request().input('courseId', sql.Int, courseId).query(`
      SELECT
        b.book_id,
        b.course_id,
        b.title,
        b.author,
        b.isbn
      FROM Books b
      WHERE b.course_id = @courseId
      ORDER BY b.title ASC;
    `);

  return result.recordset;
};

const createBook = async (bookData) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('course_id', sql.Int, bookData.course_id)
    .input('title', sql.VarChar(255), bookData.title)
    .input('author', sql.VarChar(200), bookData.author || null)
    .input('isbn', sql.VarChar(20), bookData.isbn || null)
    .query(`
      INSERT INTO Books (course_id, title, author, isbn)
      OUTPUT
        INSERTED.book_id,
        INSERTED.course_id,
        INSERTED.title,
        INSERTED.author,
        INSERTED.isbn
      VALUES (@course_id, @title, @author, @isbn);
    `);

  return result.recordset[0];
};

const updateBook = async (bookId, updates) => {
  const pool = await poolPromise;
  const request = pool.request().input('book_id', sql.Int, bookId);
  const assignments = [];

  if (updates.title !== undefined) {
    assignments.push('title = @title');
    request.input('title', sql.VarChar(255), updates.title);
  }

  if (updates.author !== undefined) {
    assignments.push('author = @author');
    request.input('author', sql.VarChar(200), updates.author);
  }

  if (updates.isbn !== undefined) {
    assignments.push('isbn = @isbn');
    request.input('isbn', sql.VarChar(20), updates.isbn);
  }

  if (updates.course_id !== undefined) {
    assignments.push('course_id = @course_id');
    request.input('course_id', sql.Int, updates.course_id);
  }

  if (assignments.length === 0) {
    return null;
  }

  const result = await request.query(`
      UPDATE Books
      SET ${assignments.join(', ')}
      OUTPUT
        INSERTED.book_id,
        INSERTED.course_id,
        INSERTED.title,
        INSERTED.author,
        INSERTED.isbn
      WHERE book_id = @book_id;
    `);

  return result.recordset[0] || null;
};

const deleteBook = async (bookId) => {
  const pool = await poolPromise;
  const result = await pool.request().input('bookId', sql.Int, bookId).query(`
      DELETE FROM Books
      WHERE book_id = @bookId;
    `);

  return result.rowsAffected[0] > 0;
};

const searchBooks = async (keyword) => {
  const pool = await poolPromise;
  const result = await pool.request().input('keyword', sql.VarChar(100), `%${keyword}%`).query(`
      SELECT
        b.book_id,
        b.course_id,
        b.title,
        b.author,
        b.isbn,
        c.course_code,
        c.course_name
      FROM Books b
      INNER JOIN Courses c ON b.course_id = c.course_id
      WHERE LOWER(b.title) LIKE LOWER(@keyword)
         OR LOWER(ISNULL(b.author, '')) LIKE LOWER(@keyword)
      ORDER BY b.title ASC;
    `);

  return result.recordset;
};

module.exports = {
  getBooksByCourse,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
};
