const express = require('express');
const router = express.Router();
const { getConnectionPool } = require('../db');

router.get('/students/:studentId/materials', async (req, res) => {
  const { studentId } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('studentId', parseInt(studentId));

    const result = await request.query(`
      SELECT m.material_id as id, m.file_name as fileName, m.description,
             m.upload_date as uploadDate, m.url, c.course_name as course,
             c.course_code as courseCode
      FROM Materials m
      LEFT JOIN Courses c ON m.course_id = c.course_id
      WHERE m.student_id = @studentId
      ORDER BY m.upload_date DESC
    `);

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching materials:', err);
    res.status(500).json({ message: 'Failed to fetch materials', error: err.message });
  }
});

router.get('/courses/:courseId/materials', async (req, res) => {
  const { courseId } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('courseId', parseInt(courseId));

    const result = await request.query(`
      SELECT material_id as id, file_name as fileName, description, upload_date as uploadDate, url
      FROM Materials
      WHERE course_id = @courseId
      ORDER BY upload_date DESC
    `);

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching materials for course:', err);
    res.status(500).json({ message: 'Failed to fetch materials for course', error: err.message });
  }
});

router.post('/materials', async (req, res) => {
  const { student_id, course_id, file_name, description, url } = req.body;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('student_id', student_id);
    request.input('course_id', course_id || null);
    request.input('file_name', file_name);
    request.input('description', description || '');
    request.input('url', url || null);

    const result = await request.query(`
      INSERT INTO Materials (student_id, course_id, file_name, description, url)
      OUTPUT INSERTED.material_id
      VALUES (@student_id, @course_id, @file_name, @description, @url)
    `);

    res.json({
      message: 'Material uploaded successfully',
      material_id: result.recordset[0].material_id
    });
  } catch (err) {
    console.error('Error uploading material:', err);
    res.status(500).json({ message: 'Failed to upload material', error: err.message });
  }
});

router.put('/materials/:id', async (req, res) => {
  const { id } = req.params;
  const { file_name, description, url } = req.body;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('id', parseInt(id));
    request.input('file_name', file_name);
    request.input('description', description);
    request.input('url', url);

    await request.query(`
      UPDATE Materials
      SET file_name = @file_name, description = @description, url = @url
      WHERE material_id = @id
    `);

    res.json({ message: 'Material updated successfully' });
  } catch (err) {
    console.error('Error updating material:', err);
    res.status(500).json({ message: 'Failed to update material', error: err.message });
  }
});

router.delete('/materials/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('id', parseInt(id));
    await request.query('DELETE FROM Materials WHERE material_id = @id');

    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    console.error('Error deleting material:', err);
    res.status(500).json({ message: 'Failed to delete material', error: err.message });
  }
});

module.exports = router;
