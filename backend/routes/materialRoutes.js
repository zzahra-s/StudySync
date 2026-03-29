const express = require('express');
const materialController = require('../controllers/materialController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateRequest,
  validateCourseIdParam,
  validateMaterialIdParam,
  validateMaterial,
} = require('../middleware/validation');

const router = express.Router();

router.get(
  '/courses/:courseId/materials',
  authenticateToken,
  validateCourseIdParam,
  validateRequest,
  materialController.getMaterialsByCourse
);

router.get(
  '/materials/count-per-course',
  authenticateToken,
  materialController.getMaterialCountPerCourse
);

router.post(
  '/materials',
  authenticateToken,
  validateMaterial,
  validateRequest,
  materialController.createMaterial
);

router.delete(
  '/materials/:id',
  authenticateToken,
  validateMaterialIdParam,
  validateRequest,
  materialController.deleteMaterial
);

module.exports = router;
