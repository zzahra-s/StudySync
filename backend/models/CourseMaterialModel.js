const { sql, poolPromise } = require('../config/Database');

const getMaterialsByCourse = async (courseId) => {
  const pool = await poolPromise;
  const result = await pool.request().input('courseId', sql.Int, courseId).query(`
      SELECT
        cm.material_id,
        cm.course_id,
        cm.material_name,
        cm.file_path,
        cm.uploaded_at
      FROM CourseMaterials cm
      WHERE cm.course_id = @courseId
      ORDER BY cm.uploaded_at DESC, cm.material_id DESC;
    `);

  return result.recordset;
};

const createMaterial = async (materialData) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('course_id', sql.Int, materialData.course_id)
    .input('material_name', sql.VarChar(255), materialData.material_name)
    .input('file_path', sql.VarChar(500), materialData.file_path || null)
    .query(`
      INSERT INTO CourseMaterials (course_id, material_name, file_path)
      OUTPUT
        INSERTED.material_id,
        INSERTED.course_id,
        INSERTED.material_name,
        INSERTED.file_path,
        INSERTED.uploaded_at
      VALUES (@course_id, @material_name, @file_path);
    `);

  return result.recordset[0];
};

const deleteMaterial = async (materialId) => {
  const pool = await poolPromise;
  const result = await pool.request().input('materialId', sql.Int, materialId).query(`
      DELETE FROM CourseMaterials
      WHERE material_id = @materialId;
    `);

  return result.rowsAffected[0] > 0;
};

const countMaterialsPerCourse = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
      SELECT
        c.course_id,
        c.course_code,
        c.course_name,
        COUNT(cm.material_id) AS material_count
      FROM Courses c
      LEFT JOIN CourseMaterials cm ON c.course_id = cm.course_id
      GROUP BY c.course_id, c.course_code, c.course_name
      ORDER BY material_count DESC, c.course_code ASC;
    `);

  return result.recordset;
};

module.exports = {
  getMaterialsByCourse,
  createMaterial,
  deleteMaterial,
  countMaterialsPerCourse,
};
