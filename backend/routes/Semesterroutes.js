const express = require('express');
const { getStudentSemesters, createSemester, updateSemester, deleteSemester } = require('../controllers/Semestercontroller');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

//get/api/students/:studentId/semesters
router.get('/students/:studentId/semesters', authenticateToken, getStudentSemesters);

//post/api/semesters
router.post('/semesters', authenticateToken, createSemester);

//put/api/semesters/:id
router.put('/semesters/:id', authenticateToken, updateSemester);

//delete/api/semesters/:id
router.delete('/semesters/:id', authenticateToken, deleteSemester);

module.exports = router;