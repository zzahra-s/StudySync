const express = require('express');
const TargetCGPAController = require('../controllers/TargetCGPAController');
const { authenticateToken: auth } = require('../middleware/auth');

const router = express.Router();

// Save / update a plan for a student (upsert)
router.post('/students/:studentId/target-cgpa-plan', auth, (req, res) =>
  TargetCGPAController.savePlan(req, res)
);

// Get the latest saved plan for a student
router.get('/students/:studentId/target-cgpa-plan', auth, (req, res) =>
  TargetCGPAController.getStudentPlans(req, res)
);

// Delete a student's plan
router.delete('/students/:studentId/target-cgpa-plan', auth, (req, res) =>
  TargetCGPAController.deletePlan(req, res)
);

// Stateless quick-calculate (no DB save, no auth required for simplicity)
router.post('/cgpa/calculate', auth, (req, res) =>
  TargetCGPAController.quickCalculate(req, res)
);

module.exports = router;
