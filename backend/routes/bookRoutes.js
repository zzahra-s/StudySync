const express = require('express');
const { body, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const bookController = require('../controllers/bookController');

const router = express.Router();

// GET /api/courses/:courseId/books
router.get('/courses/:courseId/books', authenticateToken, bookController.getBooksByCourse);

// POST /api/books
router.post('/books', [
  authenticateToken,
  body('course_id').isInt().withMessage('Valid course ID required'),
  body('title').trim().notEmpty().escape().withMessage('Title required'),
  body('author').optional().trim().escape(),
  body('isbn').optional().isLength({ min: 10, max: 20 }).withMessage('Invalid ISBN')
], bookController.createBook);

// PUT /api/books/:id
router.put('/books/:id', [
  authenticateToken,
  body('id').isInt().withMessage('Valid book ID required')
], bookController.updateBook);

// DELETE /api/books/:id
router.delete('/books/:id', [
  authenticateToken,
  body('id').isInt().withMessage('Valid book ID required')
], bookController.deleteBook);

// GET /api/books/search?q=keyword
router.get('/books/search', [
  authenticateToken,
  query('q').trim().notEmpty().withMessage('Search keyword required')
], bookController.searchBooks);

module.exports = router;

