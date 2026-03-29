const express = require('express');
const taskProgressController = require('../controllers/taskProgressController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, validateStudentIdParam } = require('../middleware/validation');

const router = express.Router();

router.get(
  '/students/:studentId/task-progress',
  authenticateToken,
  validateStudentIdParam,
  validateRequest,
  taskProgressController.getTaskProgress
);

module.exports = router;
