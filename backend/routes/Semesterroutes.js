const express = require('express');
const { getStudentSemesters, createSemester, updateSemester, deleteSemester } = require('../controllers/Semestercontroller');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET  /api/students/:studentId/semesters
router.get('/students/:studentId/semesters', authenticateToken, getStudentSemesters);

// POST /api/semesters
router.post('/semesters', authenticateToken, createSemester);

// PUT  /api/semesters/:id
router.put('/semesters/:id', authenticateToken, updateSemester);

// DELETE /api/semesters/:id
router.delete('/semesters/:id', authenticateToken, deleteSemester);

module.exports = router;