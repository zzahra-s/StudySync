
const express = require('express');
const { getCourseGrades, getCoursesPerSemester, getIncompleteCourses } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/students/:studentId/course-grades
router.get('/students/:studentId/course-grades', authenticateToken, getCourseGrades);

// GET /api/students/:studentId/courses-per-semester
router.get('/students/:studentId/courses-per-semester', authenticateToken, getCoursesPerSemester);

// GET /api/students/:studentId/incomplete-courses
router.get('/students/:studentId/incomplete-courses', authenticateToken, getIncompleteCourses);

module.exports = router;