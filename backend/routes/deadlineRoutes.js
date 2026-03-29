const express = require('express');
const deadlineController = require('../controllers/deadlineController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateRequest,
  validateCourseIdParam,
  validateStudentIdParam,
  validateDeadlineIdParam,
  validateDeadlineFilters,
  validateDeadline,
  validateDeadlineUpdate,
} = require('../middleware/validation');

const router = express.Router();

router.get(
  '/courses/:courseId/deadlines',
  authenticateToken,
  validateCourseIdParam,
  validateRequest,
  deadlineController.getDeadlinesByCourse
);

router.get(
  '/students/:studentId/deadlines',
  authenticateToken,
  validateStudentIdParam,
  validateDeadlineFilters,
  validateRequest,
  deadlineController.getDeadlinesByStudent
);

router.post(
  '/deadlines',
  authenticateToken,
  validateDeadline,
  validateRequest,
  deadlineController.createDeadline
);

router.put(
  '/deadlines/:id',
  authenticateToken,
  validateDeadlineUpdate,
  validateRequest,
  deadlineController.updateDeadline
);

router.delete(
  '/deadlines/:id',
  authenticateToken,
  validateDeadlineIdParam,
  validateRequest,
  deadlineController.deleteDeadline
);

router.get(
  '/students/:studentId/study-planner',
  authenticateToken,
  validateStudentIdParam,
  validateRequest,
  deadlineController.getStudyPlanner
);

router.get(
  '/students/:studentId/study-hours',
  authenticateToken,
  validateStudentIdParam,
  validateRequest,
  deadlineController.getStudyHoursByCourse
);

router.get(
  '/students/:studentId/top-courses',
  authenticateToken,
  validateStudentIdParam,
  validateRequest,
  deadlineController.getTopCoursesByStudyHours
);

module.exports = router;
