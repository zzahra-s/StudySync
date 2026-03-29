const express = require('express');
const bookController = require('../controllers/bookController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateRequest,
  validateCourseIdParam,
  validateBookIdParam,
  validateBook,
  validateBookUpdate,
  validateSearch,
} = require('../middleware/validation');

const router = express.Router();

router.get(
  '/courses/:courseId/books',
  authenticateToken,
  validateCourseIdParam,
  validateRequest,
  bookController.getBooksByCourse
);

router.get(
  '/books/search',
  authenticateToken,
  validateSearch,
  validateRequest,
  bookController.searchBooks
);

router.post('/books', authenticateToken, validateBook, validateRequest, bookController.createBook);

router.put(
  '/books/:id',
  authenticateToken,
  validateBookUpdate,
  validateRequest,
  bookController.updateBook
);

router.delete(
  '/books/:id',
  authenticateToken,
  validateBookIdParam,
  validateRequest,
  bookController.deleteBook
);

module.exports = router;
