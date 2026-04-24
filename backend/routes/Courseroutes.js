const express = require('express');
const { getSemesterCourses, createCourse, updateCourse, deleteCourse, getAllCoursesWithGrades } = require('../controllers/Coursecontroller');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

//get/api/semesters/:semesterId/courses
router.get('/semesters/:semesterId/courses', authenticateToken, getSemesterCourses);

//get/api/students/:studentId/courses  — all courses with grades across all semesters
router.get('/students/:studentId/courses', authenticateToken, getAllCoursesWithGrades);

//post/api/courses
router.post('/courses', authenticateToken, createCourse);

//put/api/courses/:id
router.put('/courses/:id', authenticateToken, updateCourse);

// delete/api/courses/:id
router.delete('/courses/:id', authenticateToken, deleteCourse);

module.exports = router;