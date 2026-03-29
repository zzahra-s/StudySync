const courseMaterialModel = require('../models/CourseMaterialModel');

const handleServerError = (res, error, action) => {
  console.error(`Material controller failed while trying to ${action}:`, error);
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

const getMaterialsByCourse = async (req, res) => {
  try {
    const materials = await courseMaterialModel.getMaterialsByCourse(req.params.courseId);
    return res.json({
      success: true,
      data: materials,
    });
  } catch (error) {
    return handleServerError(res, error, 'fetch materials by course');
  }
};

const createMaterial = async (req, res) => {
  try {
    const material = await courseMaterialModel.createMaterial(req.body);
    return res.status(201).json({
      success: true,
      data: material,
    });
  } catch (error) {
    return handleServerError(res, error, 'create a material');
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const deleted = await courseMaterialModel.deleteMaterial(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Material not found',
      });
    }

    return res.json({
      success: true,
      data: {
        message: 'Material deleted successfully',
      },
    });
  } catch (error) {
    return handleServerError(res, error, 'delete a material');
  }
};

const getMaterialCountPerCourse = async (req, res) => {
  try {
    const counts = await courseMaterialModel.countMaterialsPerCourse();
    return res.json({
      success: true,
      data: counts,
    });
  } catch (error) {
    return handleServerError(res, error, 'count materials per course');
  }
};

module.exports = {
  getMaterialsByCourse,
  createMaterial,
  deleteMaterial,
  getMaterialCountPerCourse,
};
