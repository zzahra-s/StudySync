const express = require('express');
const router = express.Router();
const { getConnectionPool } = require('../db');

router.get('/students/:studentId/study-hours', async (req, res) => {
  const { studentId } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('studentId', parseInt(studentId));

    const result = await request.query(`
      SELECT hour_id as id, date, hours, subject, course, created_at as createdAt
      FROM StudyHours
      WHERE student_id = @studentId
      ORDER BY date DESC
    `);

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching study hours:', err);
    res.status(500).json({ message: 'Failed to fetch study hours', error: err.message });
  }
});

router.post('/study-hours', async (req, res) => {
  const { student_id, date, hours, subject, course } = req.body;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('student_id', student_id);
    request.input('date', date);
    request.input('hours', hours);
    request.input('subject', subject);
    request.input('course', course);

    const result = await request.query(`
      INSERT INTO StudyHours (student_id, date, hours, subject, course)
      OUTPUT INSERTED.hour_id
      VALUES (@student_id, @date, @hours, @subject, @course)
    `);

    res.json({
      message: 'Study hours logged successfully',
      hour_id: result.recordset[0].hour_id
    });
  } catch (err) {
    console.error('Error logging study hours:', err);
    res.status(500).json({ message: 'Failed to log study hours', error: err.message });
  }
});

router.put('/study-hours/:id', async (req, res) => {
  const { id } = req.params;
  const { date, hours, subject, course } = req.body;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('id', parseInt(id));
    request.input('date', date);
    request.input('hours', hours);
    request.input('subject', subject);
    request.input('course', course);

    await request.query(`
      UPDATE StudyHours
      SET date = @date, hours = @hours, subject = @subject, course = @course
      WHERE hour_id = @id
    `);

    res.json({ message: 'Study hours updated successfully' });
  } catch (err) {
    console.error('Error updating study hours:', err);
    res.status(500).json({ message: 'Failed to update study hours', error: err.message });
  }
});

router.delete('/study-hours/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('id', parseInt(id));
    await request.query('DELETE FROM StudyHours WHERE hour_id = @id');

    res.json({ message: 'Study hours deleted successfully' });
  } catch (err) {
    console.error('Error deleting study hours:', err);
    res.status(500).json({ message: 'Failed to delete study hours', error: err.message });
  }
});

module.exports = router;
