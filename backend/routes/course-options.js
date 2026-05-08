const express = require('express');
const { getConnectionPool } = require('../db');

const router = express.Router();

router.get('/students/:studentId/course-options', async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  if (!Number.isInteger(studentId)) {
    return res.status(400).json({ message: 'Valid studentId is required.' });
  }

  try {
    const pool = await getConnectionPool();
    const result = await pool.request()
      .input('studentId', studentId)
      .query(`
        SELECT
          c.course_id AS id,
          c.course_name AS courseName,
          c.course_code AS courseCode
        FROM Courses c
        INNER JOIN Semesters s ON s.semester_id = c.semester_id
        WHERE s.student_id = @studentId
        ORDER BY c.course_name ASC
      `);

    return res.json(result.recordset || []);
  } catch (error) {
    console.error('Failed to fetch student courses:', error);
    return res.status(500).json({ message: 'Failed to fetch courses.' });
  }
});

module.exports = router;
