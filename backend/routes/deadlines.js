const express = require('express');
const router = express.Router();
const { getConnectionPool } = require('../db');

router.get('/students/:studentId/deadlines', async (req, res) => {
  const { studentId } = req.params;
  const { status } = req.query;

  try {
    const pool = await getConnectionPool();
    let query = `
      SELECT d.deadline_id as id, d.title, d.due_date as dueDate, d.status, d.priority,
             d.allocated_study_hours as allocatedStudyHours, c.course_name as course,
             c.course_code as courseCode
      FROM Deadlines d
      JOIN Courses c ON d.course_id = c.course_id
      JOIN Semesters s ON c.semester_id = s.semester_id
      WHERE s.student_id = @studentId
    `;

    if (status) {
      query += " AND d.status = @status";
    }

    query += " ORDER BY d.due_date ASC";

    const request = pool.request();
    request.input('studentId', parseInt(studentId));
    if (status) {
      request.input('status', status);
    }

    const result = await request.query(query);
    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching deadlines:', err);
    res.status(500).json({ message: 'Failed to fetch deadlines', error: err.message });
  }
});

router.post('/deadlines', async (req, res) => {
  const { title, due_date, status, course_id, priority, allocated_study_hours } = req.body;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('title', title);
    request.input('due_date', due_date);
    request.input('status', status || 'pending');
    request.input('course_id', course_id);
    request.input('priority', priority || 'medium');
    request.input('allocated_study_hours', allocated_study_hours || 0);

    const result = await request.query(`
      INSERT INTO Deadlines (title, due_date, status, course_id, priority, allocated_study_hours)
      OUTPUT INSERTED.deadline_id
      VALUES (@title, @due_date, @status, @course_id, @priority, @allocated_study_hours)
    `);

    res.json({
      message: 'Deadline created successfully',
      deadline_id: result.recordset[0].deadline_id
    });
  } catch (err) {
    console.error('Error creating deadline:', err);
    res.status(500).json({ message: 'Failed to create deadline', error: err.message });
  }
});

router.put('/deadlines/:id', async (req, res) => {
  const { id } = req.params;
  const { title, due_date, status, course_id, priority, allocated_study_hours } = req.body;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('id', parseInt(id));
    request.input('title', title);
    request.input('due_date', due_date);
    request.input('status', status);
    request.input('course_id', course_id);
    request.input('priority', priority);
    request.input('allocated_study_hours', allocated_study_hours);

    await request.query(`
      UPDATE Deadlines
      SET title = @title, due_date = @due_date, status = @status,
          course_id = @course_id, priority = @priority,
          allocated_study_hours = @allocated_study_hours
      WHERE deadline_id = @id
    `);

    res.json({ message: 'Deadline updated successfully' });
  } catch (err) {
    console.error('Error updating deadline:', err);
    res.status(500).json({ message: 'Failed to update deadline', error: err.message });
  }
});

router.delete('/deadlines/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('id', parseInt(id));

    await request.query('DELETE FROM Deadlines WHERE deadline_id = @id');

    res.json({ message: 'Deadline deleted successfully' });
  } catch (err) {
    console.error('Error deleting deadline:', err);
    res.status(500).json({ message: 'Failed to delete deadline', error: err.message });
  }
});

module.exports = router;
