const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const deadlineController = require('../controllers/deadlineController');

const router = express.Router();

// GET /api/courses/:courseId/deadlines
router.get('/courses/:courseId/deadlines', [
  authenticateToken,
  param('courseId').isInt().withMessage('Valid course ID required')
], deadlineController.getDeadlinesByCourse);

// GET /api/students/:studentId/deadlines?status=...&priority=...&upcoming=true&overdue=true
router.get('/students/:studentId/deadlines', [
  authenticateToken,
  param('studentId').isInt().withMessage('Valid student ID required'),
  query('status').optional().isIn(['Pending', 'Completed']).withMessage('Invalid status'),
  query('priority').optional().isIn(['High', 'Medium', 'Low']).withMessage('Invalid priority'),
  query('upcoming').optional().isBoolean().withMessage('upcoming must be true/false'),
  query('overdue').optional().isBoolean().withMessage('overdue must be true/false')
], deadlineController.getDeadlinesByStudent);

// POST /api/deadlines
router.post('/deadlines', [
  authenticateToken,
  body('course_id').isInt().withMessage('Valid course ID required'),
  body('title').trim().notEmpty().escape().isLength({ max: 150 }).withMessage('Valid title required'),
  body('due_date').isISO8601().withMessage('Valid due date required'),
  body('status').optional().isIn(['Pending', 'Completed']),
  body('priority').optional().isIn(['High', 'Medium', 'Low']),
  body('allocated_study_hours').optional().isFloat({ min: 0 }).withMessage('Valid hours >= 0')
], deadlineController.createDeadline);

// PUT /api/deadlines/:id
router.put('/deadlines/:id', [
  authenticateToken,
  param('id').isInt().withMessage('Valid deadline ID required')
], deadlineController.updateDeadline);

// DELETE /api/deadlines/:id
router.delete('/deadlines/:id', [
  authenticateToken,
  param('id').isInt().withMessage('Valid deadline ID required')
], deadlineController.deleteDeadline);

module.exports = router;

