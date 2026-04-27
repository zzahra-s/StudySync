const express = require('express');
const router = express.Router();
const { getConnectionPool } = require('../db');

router.get('/students/:studentId/top-courses', async (req, res) => {
  const { studentId } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('studentId', parseInt(studentId));

    const result = await request.query(`
      SELECT tc.top_course_id as id, tc.course, tc.grade, tc.created_at as createdAt,
             c.course_name as fullCourseName, c.course_code as courseCode
      FROM TopCourses tc
      LEFT JOIN Courses c ON tc.course_id = c.course_id
      WHERE tc.student_id = @studentId
      ORDER BY tc.created_at DESC
    `);

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching top courses:', err);
    res.status(500).json({ message: 'Failed to fetch top courses', error: err.message });
  }
});

router.post('/top-courses', async (req, res) => {
  const { student_id, course_id, course, grade } = req.body;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('student_id', student_id);
    request.input('course_id', course_id || null);
    request.input('course', course);
    request.input('grade', grade);

    const result = await request.query(`
      INSERT INTO TopCourses (student_id, course_id, course, grade)
      OUTPUT INSERTED.top_course_id
      VALUES (@student_id, @course_id, @course, @grade)
    `);

    res.json({
      message: 'Top course added successfully',
      top_course_id: result.recordset[0].top_course_id
    });
  } catch (err) {
    console.error('Error adding top course:', err);
    res.status(500).json({ message: 'Failed to add top course', error: err.message });
  }
});

router.put('/top-courses/:id', async (req, res) => {
  const { id } = req.params;
  const { course, grade } = req.body;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('id', parseInt(id));
    request.input('course', course);
    request.input('grade', grade);

    await request.query(`
      UPDATE TopCourses
      SET course = @course, grade = @grade
      WHERE top_course_id = @id
    `);

    res.json({ message: 'Top course updated successfully' });
  } catch (err) {
    console.error('Error updating top course:', err);
    res.status(500).json({ message: 'Failed to update top course', error: err.message });
  }
});

router.delete('/top-courses/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('id', parseInt(id));
    await request.query('DELETE FROM TopCourses WHERE top_course_id = @id');

    res.json({ message: 'Top course deleted successfully' });
  } catch (err) {
    console.error('Error deleting top course:', err);
    res.status(500).json({ message: 'Failed to delete top course', error: err.message });
  }
});

module.exports = router;
