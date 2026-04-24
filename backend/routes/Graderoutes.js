const express = require('express');
const { addOrUpdateGrade, getCourseGrade, updateGrade, getGradePoints } = require('../controllers/gradecontroller');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

//post/api/courses/:courseId/grade  — add or update grade for a course
router.post('/courses/:courseId/grade', authenticateToken, addOrUpdateGrade);

//get/api/courses/:courseId/grade
router.get('/courses/:courseId/grade', authenticateToken, getCourseGrade);

//put/api/grades/:id
router.put('/grades/:id', authenticateToken, updateGrade);

//get/api/grade-points  — reference table (no auth needed but kept consistent)
router.get('/grade-points', getGradePoints);

module.exports = router;