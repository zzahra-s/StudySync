const bookModel = require('../models/BookModel');

const getBooksByCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, error: 'Invalid course ID' });
    }
    const books = await bookModel.getBooksByCourse(courseId);
    res.json({ success: true, data: books });
  } catch (error) {
    console.error('getBooksByCourse error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch books' });
  }
};

const createBook = async (req, res) => {
  try {
    const { course_id, title, author, isbn } = req.body;
    
    if (!course_id || !title) {
      return res.status(400).json({ success: false, error: 'course_id and title required' });
    }

    const newBook = await bookModel.createBook({
      courseId: parseInt(course_id),
      title,
      author: author || null,
      isbn: isbn || null
    });
    
    res.status(201).json({ success: true, data: newBook });
  } catch (error) {
    console.error('createBook error:', error);
    res.status(500).json({ success: false, error: 'Failed to create book' });
  }
};

const updateBook = async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    if (isNaN(bookId)) {
      return res.status(400).json({ success: false, error: 'Invalid book ID' });
    }
    
    const { title, author, isbn } = req.body;
    const result = await bookModel.updateBook(bookId, { title, author, isbn });
    
    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: 'Book not found or no changes' });
    }
    
    res.json({ success: true, data: 'Book updated successfully' });
  } catch (error) {
    console.error('updateBook error:', error);
    res.status(500).json({ success: false, error: 'Failed to update book' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    if (isNaN(bookId)) {
      return res.status(400).json({ success: false, error: 'Invalid book ID' });
    }
    
    const result = await bookModel.deleteBook(bookId);
    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    
    res.json({ success: true, data: 'Book deleted successfully' });
  } catch (error) {
    console.error('deleteBook error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete book' });
  }
};

const searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ success: false, error: 'Search keyword required' });
    }
    
    const books = await bookModel.searchBooks(q);
    res.json({ success: true, data: books });
  } catch (error) {
    console.error('searchBooks error:', error);
    res.status(500).json({ success: false, error: 'Failed to search books' });
  }
};

module.exports = {
  getBooksByCourse,
  createBook,
  updateBook,
  deleteBook,
  searchBooks
};

