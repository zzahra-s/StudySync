const express = require('express');
const { param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const taskProgressController = require('../controllers/taskProgressController');
const deadlineController = require('../controllers/deadlineController');

const router = express.Router();

// GET /api/students/:studentId/task-progress
router.get('/students/:studentId/task-progress', [
  authenticateToken,
  param('studentId').isInt().withMessage('Valid student ID required')
], taskProgressController.getTaskProgress);

// GET /api/students/:studentId/study-planner
router.get('/students/:studentId/study-planner', [
  authenticateToken,
  param('studentId').isInt().withMessage('Valid student ID required')
], deadlineController.getStudyPlanner);

// GET /api/students/:studentId/study-hours
router.get('/students/:studentId/study-hours', [
  authenticateToken,
  param('studentId').isInt().withMessage('Valid student ID required')
], taskProgressController.getStudyHoursByCourse);

// GET /api/students/:studentId/top-courses
router.get('/students/:studentId/top-courses', [
  authenticateToken,
  param('studentId').isInt().withMessage('Valid student ID required')
], taskProgressController.getTopCoursesByStudyHours);

module.exports = router;

