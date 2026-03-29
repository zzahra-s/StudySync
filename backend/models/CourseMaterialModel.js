const { poolPromise } = require('../config/Database');

/**
 * Get materials for a course
 */
const getMaterialsByCourse = async (courseId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('courseId', poolPromise.sql.Int, courseId)
    .query(`
      SELECT material_id, course_id, material_name, file_path, uploaded_at
      FROM CourseMaterials
      WHERE course_id = @courseId
      ORDER BY uploaded_at DESC
    `);
  return result.recordset;
};

/**
 * Get single material
 */
const getMaterialById = async (materialId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('materialId', poolPromise.sql.Int, materialId)
    .query(`
      SELECT material_id, course_id, material_name, file_path, uploaded_at
      FROM CourseMaterials
      WHERE material_id = @materialId
    `);
  return result.recordset[0] || null;
};

/**
 * Create material
 */
const createMaterial = async ({ courseId, materialName, filePath }) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('courseId', poolPromise.sql.Int, courseId)
    .input('materialName', poolPromise.sql.NVarChar, materialName)
    .input('filePath', poolPromise.sql.NVarChar(500), filePath)
    .query(`
      INSERT INTO CourseMaterials (course_id, material_name, file_path)
      OUTPUT INSERTED.*
      VALUES (@courseId, @materialName, @filePath)
    `);
  return result.recordset[0];
};

/**
 * Delete material
 */
const deleteMaterial = async (materialId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('materialId', poolPromise.sql.Int, materialId)
    .query('DELETE FROM CourseMaterials WHERE material_id = @materialId');
  return result;
};

/**
 * Count materials per course
 */
const getMaterialCountPerCourse = async () => {
  const pool = await poolPromise;
  const result = await pool.query(`
    SELECT c.course_code, COUNT(cm.material_id) AS material_count
    FROM Courses c
    LEFT JOIN CourseMaterials cm ON c.course_id = cm.course_id
    GROUP BY c.course_id, c.course_code
  `);
  return result.recordset;
};

module.exports = {
  getMaterialsByCourse,
  getMaterialById,
  createMaterial,
  deleteMaterial,
  getMaterialCountPerCourse
};

