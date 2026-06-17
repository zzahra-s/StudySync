const express = require('express');
const TargetCGPAController = require('../controllers/TargetCGPAController');
const auth = require('../middleware/auth');

const router = express.Router();

// Save a new Target CGPA plan
router.post('/students/:studentId/target-cgpa-plan', auth, async (req, res) => {
  await TargetCGPAController.savePlan(req, res);
});

// Get latest plan for a student
router.get('/students/:studentId/target-cgpa-plan', auth, async (req, res) => {
  await TargetCGPAController.getStudentPlans(req, res);
});

// Get specific plan by ID
router.get('/target-cgpa-plan/:planId', auth, async (req, res) => {
  await TargetCGPAController.getPlanById(req, res);
});

// Update an existing plan
router.put('/target-cgpa-plan/:planId', auth, async (req, res) => {
  await TargetCGPAController.updatePlan(req, res);
});

// Delete a plan
router.delete('/target-cgpa-plan/:planId', auth, async (req, res) => {
  await TargetCGPAController.deletePlan(req, res);
});

module.exports = router;
