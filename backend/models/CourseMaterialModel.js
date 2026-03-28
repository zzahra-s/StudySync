const pool = require('../config/Database');

const getMaterialsByCourse = async (courseId) => {
  const query = `
    SELECT material_id, course_id, material_name, file_path, uploaded_at
    FROM CourseMaterials
    WHERE course_id = ?
    ORDER BY uploaded_at DESC
  `;
  const [rows] = await pool.query(query, [courseId]);
  return rows;
};

const getMaterialById = async (materialId) => {
  const query = `
    SELECT material_id, course_id, material_name, file_path, uploaded_at
    FROM CourseMaterials
    WHERE material_id = ?
  `;
  const [rows] = await pool.query(query, [materialId]);
  return rows[0] || null;
};

const createMaterial = async ({ courseId, materialName, filePath }) => {
  const query = `
    INSERT INTO CourseMaterials (course_id, material_name, file_path)
    VALUES (?, ?, ?)
  `;
  const [result] = await pool.query(query, [courseId, materialName, filePath]);
  return {
    material_id: result.insertId,
    course_id: courseId,
    material_name: materialName,
    file_path: filePath,
    uploaded_at: new Date()
  };
};

const deleteMaterial = async (materialId) => {
  const query = `DELETE FROM CourseMaterials WHERE material_id = ?`;
  const [result] = await pool.query(query, [materialId]);
  return result;
};

const getMaterialCountPerCourse = async () => {
  const query = `
    SELECT c.course_code, COUNT(cm.material_id) AS material_count
    FROM Courses c
    LEFT JOIN CourseMaterials cm ON c.course_id = cm.course_id
    GROUP BY c.course_id, c.course_code
  `;
  const [rows] = await pool.query(query);
  return rows;
};

module.exports = {
  getMaterialsByCourse,
  getMaterialById,
  createMaterial,
  deleteMaterial,
  getMaterialCountPerCourse
};