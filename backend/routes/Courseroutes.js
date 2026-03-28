const express = require('express');
const { getSemesterCourses, createCourse, updateCourse, deleteCourse, getAllCoursesWithGrades } = require('../controllers/Coursecontroller');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET  /api/semesters/:semesterId/courses
router.get('/semesters/:semesterId/courses', authenticateToken, getSemesterCourses);

// GET  /api/students/:studentId/courses  — all courses with grades across all semesters
router.get('/students/:studentId/courses', authenticateToken, getAllCoursesWithGrades);

// POST /api/courses
router.post('/courses', authenticateToken, createCourse);

// PUT  /api/courses/:id
router.put('/courses/:id', authenticateToken, updateCourse);

// DELETE /api/courses/:id
router.delete('/courses/:id', authenticateToken, deleteCourse);

module.exports = router;