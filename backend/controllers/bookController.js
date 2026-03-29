const bookModel = require('../models/BookModel');

const handleServerError = (res, error, action) => {
  console.error(`Book controller failed while trying to ${action}:`, error);
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

const getBooksByCourse = async (req, res) => {
  try {
    const books = await bookModel.getBooksByCourse(req.params.courseId);
    return res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    return handleServerError(res, error, 'fetch books by course');
  }
};

const createBook = async (req, res) => {
  try {
    const book = await bookModel.createBook(req.body);
    return res.status(201).json({
      success: true,
      data: book,
    });
  } catch (error) {
    return handleServerError(res, error, 'create a book');
  }
};

const updateBook = async (req, res) => {
  try {
    const updatedBook = await bookModel.updateBook(req.params.id, req.body);

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    return res.json({
      success: true,
      data: updatedBook,
    });
  } catch (error) {
    return handleServerError(res, error, 'update a book');
  }
};

const deleteBook = async (req, res) => {
  try {
    const deleted = await bookModel.deleteBook(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    return res.json({
      success: true,
      data: {
        message: 'Book deleted successfully',
      },
    });
  } catch (error) {
    return handleServerError(res, error, 'delete a book');
  }
};

const searchBooks = async (req, res) => {
  try {
    const books = await bookModel.searchBooks(req.query.q);
    return res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    return handleServerError(res, error, 'search books');
  }
};

module.exports = {
  getBooksByCourse,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
};
