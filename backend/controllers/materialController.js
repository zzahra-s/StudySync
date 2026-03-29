const courseMaterialModel = require('../models/CourseMaterialModel');

const getMaterialsByCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, error: 'Invalid course ID' });
    }
    const materials = await courseMaterialModel.getMaterialsByCourse(courseId);
    res.json({ success: true, data: materials });
  } catch (error) {
    console.error('getMaterialsByCourse error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch materials' });
  }
};

const createMaterial = async (req, res) => {
  try {
    const { course_id, material_name, file_path } = req.body;
    
    if (!course_id || !material_name) {
      return res.status(400).json({ success: false, error: 'course_id and material_name required' });
    }

    const newMaterial = await courseMaterialModel.createMaterial({
      courseId: parseInt(course_id),
      materialName: material_name,
      filePath: file_path || ''
    });
    
    res.status(201).json({ success: true, data: newMaterial });
  } catch (error) {
    console.error('createMaterial error:', error);
    res.status(500).json({ success: false, error: 'Failed to create material' });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const materialId = parseInt(req.params.id);
    if (isNaN(materialId)) {
      return res.status(400).json({ success: false, error: 'Invalid material ID' });
    }
    
    const result = await courseMaterialModel.deleteMaterial(materialId);
    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }
    
    res.json({ success: true, data: 'Material deleted successfully' });
  } catch (error) {
    console.error('deleteMaterial error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete material' });
  }
};

const getMaterialCountPerCourse = async (req, res) => {
  try {
    const counts = await courseMaterialModel.getMaterialCountPerCourse();
    res.json({ success: true, data: counts });
  } catch (error) {
    console.error('getMaterialCountPerCourse error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch material counts' });
  }
};

module.exports = {
  getMaterialsByCourse,
  createMaterial,
  deleteMaterial,
  getMaterialCountPerCourse
};

