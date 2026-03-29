const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const materialController = require('../controllers/materialController');

const router = express.Router({ mergeParams: true });

// GET /api/courses/:courseId/materials
router.get('/courses/:courseId/materials', authenticateToken, materialController.getMaterialsByCourse);

// POST /api/materials
router.post('/materials', [
  authenticateToken,
  body('course_id').isInt().withMessage('Valid course ID required'),
  body('material_name').trim().notEmpty().escape().withMessage('Material name required'),
  body('file_path').optional().trim().escape()
], materialController.createMaterial);

// DELETE /api/materials/:id
router.delete('/materials/:id', [
  authenticateToken,
  body('id').isInt().withMessage('Valid material ID required')
], materialController.deleteMaterial);

// GET /api/materials/count-per-course (optional)
router.get('/materials/count-per-course', authenticateToken, materialController.getMaterialCountPerCourse);

module.exports = router;

