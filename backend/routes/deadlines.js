const express = require('express');
const router = express.Router();
const { getConnectionPool } = require('../db');

router.get('/students/:studentId/deadlines', async (req, res) => {
  const { studentId } = req.params;
  const { status, courseId } = req.query;

  try {
    const pool = await getConnectionPool();
    let query = `
      SELECT d.deadline_id as id, d.title, d.description, d.due_date as dueDate, d.status, d.priority,
             d.allocated_study_hours as allocatedStudyHours, d.course_id as courseId, c.course_name as course,
             c.course_code as courseCode
      FROM Deadlines d
      JOIN Courses c ON d.course_id = c.course_id
      JOIN Semesters s ON c.semester_id = s.semester_id
      WHERE s.student_id = @studentId
    `;

    if (status) {
      query += " AND LOWER(d.status) = LOWER(@status)";
    }
    if (courseId) {
      query += " AND d.course_id = @courseId";
    }

    query += " ORDER BY d.due_date ASC";

    const request = pool.request();
    request.input('studentId', parseInt(studentId));
    if (status) {
      request.input('status', status);
    }
    if (courseId) {
      request.input('courseId', parseInt(courseId, 10));
    }

    const result = await request.query(query);
    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching deadlines:', err);
    res.status(500).json({ message: 'Failed to fetch deadlines', error: err.message });
  }
});

router.post('/deadlines', async (req, res) => {
  const {
    title,
    description,
    due_date,
    status,
    course_id,
    priority,
    allocated_study_hours
  } = req.body;

  if (!course_id) {
    return res.status(400).json({ message: 'course_id is required.' });
  }

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('title', title);
    request.input('description', description || '');
    request.input('due_date', due_date);
    request.input('status', status || 'pending');
    request.input('course_id', course_id);
    request.input('priority', priority || 'medium');
    request.input('allocated_study_hours', allocated_study_hours || 0);

    const result = await request.query(`
      INSERT INTO Deadlines (title, description, due_date, status, course_id, priority, allocated_study_hours)
      OUTPUT INSERTED.deadline_id
      VALUES (@title, @description, @due_date, @status, @course_id, @priority, @allocated_study_hours)
    `);

    // Optional sync: new deadlines can appear in task manager todo list.
    await pool.request()
      .input('title', title)
      .input('courseId', course_id)
      .input('linkedDeadlineId', result.recordset[0].deadline_id)
      .query(`
        IF OBJECT_ID('TaskManager', 'U') IS NOT NULL
        BEGIN
          INSERT INTO TaskManager (user_id, course_id, title, status, linked_deadline_id)
          SELECT
            s.student_id,
            @courseId,
            @title,
            'todo',
            @linkedDeadlineId
          FROM Courses c
          INNER JOIN Semesters s ON s.semester_id = c.semester_id
          WHERE c.course_id = @courseId
        END
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
  const { title, description, due_date, status, course_id, priority, allocated_study_hours } = req.body;

  if (!title || !due_date || !status || !course_id) {
    return res.status(400).json({ message: 'title, due_date, status, and course_id are required.' });
  }

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('id', parseInt(id));
    request.input('title', title);
    request.input('description', description || '');
    request.input('due_date', due_date);
    request.input('status', status);
    request.input('course_id', course_id);
    request.input('priority', priority);
    request.input('allocated_study_hours', allocated_study_hours);

    const result = await request.query(`
      UPDATE Deadlines
      SET title = @title, description = @description, due_date = @due_date, status = @status,
          course_id = @course_id, priority = @priority,
          allocated_study_hours = @allocated_study_hours
      WHERE deadline_id = @id
    `);

    if (!result.rowsAffected[0]) {
      return res.status(404).json({ message: 'Deadline not found.' });
    }

    res.json({ message: 'Deadline updated successfully' });
  } catch (err) {
    console.error('Error updating deadline:', err);
    res.status(500).json({ message: 'Failed to update deadline', error: err.message });
  }
});

router.delete('/deadlines/:id', async (req, res) => {
  const { id } = req.params;
  const deadlineId = parseInt(id, 10);

  if (!Number.isInteger(deadlineId)) {
    return res.status(400).json({ message: 'Valid deadline id is required.' });
  }

  try {
    const pool = await getConnectionPool();
    // Prevent FK delete failures if linked tasks exist.
    await pool.request()
      .input('id', deadlineId)
      .query(`
        IF OBJECT_ID('TaskManager', 'U') IS NOT NULL
        BEGIN
          UPDATE TaskManager
          SET linked_deadline_id = NULL
          WHERE linked_deadline_id = @id
        END
      `);

    const result = await pool.request()
      .input('id', deadlineId)
      .query('DELETE FROM Deadlines WHERE deadline_id = @id');

    if (!result.rowsAffected[0]) {
      return res.status(404).json({ message: 'Deadline not found.' });
    }

    res.json({ message: 'Deadline deleted successfully' });
  } catch (err) {
    console.error('Error deleting deadline:', err);
    res.status(500).json({ message: 'Failed to delete deadline', error: err.message });
  }
});

module.exports = router;
