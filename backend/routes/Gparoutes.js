
const express = require('express');
const { getCGPA, getSemesterGPA, getAverageGPA } = require('../controllers/gpaController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// get/api/students/:studentId/cgpa
router.get('/students/:studentId/cgpa', authenticateToken, getCGPA);

//get/api/students/:studentId/semester-gpa
router.get('/students/:studentId/semester-gpa', authenticateToken, getSemesterGPA);

// get/api/admin/average-gpa
router.get('/admin/average-gpa', authenticateToken, getAverageGPA);

module.exports = router;