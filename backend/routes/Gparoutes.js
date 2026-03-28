
const express = require('express');
const { getCGPA, getSemesterGPA, getAverageGPA } = require('../controllers/gpaController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/students/:studentId/cgpa
router.get('/students/:studentId/cgpa', authenticateToken, getCGPA);

// GET /api/students/:studentId/semester-gpa
router.get('/students/:studentId/semester-gpa', authenticateToken, getSemesterGPA);

// GET /api/admin/average-gpa
router.get('/admin/average-gpa', authenticateToken, getAverageGPA);

module.exports = router;