

const express = require('express');
const {
    getStudentScenarios,
    createScenario,
    getScenario,
    updateScenario,
    deleteScenario,
    getProjection,
    addCourseToScenario,
    removeCourseFromScenario,
} = require('../controllers/scenarioController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET  /api/students/:studentId/scenarios list all scenarios for a student
router.get('/students/:studentId/scenarios', authenticateToken, getStudentScenarios);

// POST /api/scenarios           
router.post('/scenarios', authenticateToken, createScenario);

// GET  /api/scenarios/:scenarioId  get one scenario + its courses
router.get('/scenarios/:scenarioId', authenticateToken, getScenario);

// PUT  /api/scenarios/:scenarioId rename a scenario
router.put('/scenarios/:scenarioId', authenticateToken, updateScenario);

// DELETE /api/scenarios/:scenarioId delete a scenario
router.delete('/scenarios/:scenarioId', authenticateToken, deleteScenario);

// GET  /api/scenarios/:scenarioId/projection calculate projected GPA
router.get('/scenarios/:scenarioId/projection', authenticateToken, getProjection);

// POST /api/scenarios/:scenarioId/courses add/update a course in scenario
router.post('/scenarios/:scenarioId/courses', authenticateToken, addCourseToScenario);

// DELETE /api/scenarios/:scenarioId/courses/:courseId remove course from scenario
router.delete('/scenarios/:scenarioId/courses/:courseId', authenticateToken, removeCourseFromScenario);

module.exports = router;