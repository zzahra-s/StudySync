const express = require('express');
const { addOrUpdateGrade, getCourseGrade, updateGrade, getGradePoints } = require('../controllers/gradecontroller');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// POST /api/courses/:courseId/grade  — add or update grade for a course
router.post('/courses/:courseId/grade', authenticateToken, addOrUpdateGrade);

// GET  /api/courses/:courseId/grade
router.get('/courses/:courseId/grade', authenticateToken, getCourseGrade);

// PUT  /api/grades/:id
router.put('/grades/:id', authenticateToken, updateGrade);

// GET  /api/grade-points  — reference table (no auth needed but kept consistent)
router.get('/grade-points', getGradePoints);

module.exports = router;