

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

//get/api/students/:studentId/scenarios list all scenarios for a student
router.get('/students/:studentId/scenarios', authenticateToken, getStudentScenarios);

//post/api/scenarios           
router.post('/scenarios', authenticateToken, createScenario);

//get/api/scenarios/:scenarioId  get one scenario + its courses
router.get('/scenarios/:scenarioId', authenticateToken, getScenario);

//put/api/scenarios/:scenarioId rename a scenario
router.put('/scenarios/:scenarioId', authenticateToken, updateScenario);

//delete/api/scenarios/:scenarioId delete a scenario
router.delete('/scenarios/:scenarioId', authenticateToken, deleteScenario);

//get/api/scenarios/:scenarioId/projection calculate projected GPA
router.get('/scenarios/:scenarioId/projection', authenticateToken, getProjection);

//post/api/scenarios/:scenarioId/courses add/update a course in scenario
router.post('/scenarios/:scenarioId/courses', authenticateToken, addCourseToScenario);

//delete/api/scenarios/:scenarioId/courses/:courseId remove course from scenario
router.delete('/scenarios/:scenarioId/courses/:courseId', authenticateToken, removeCourseFromScenario);

module.exports = router;