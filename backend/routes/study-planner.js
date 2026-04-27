const express = require('express');
const router = express.Router();
const { getConnectionPool } = require('../db');

router.get('/students/:studentId/study-planner', async (req, res) => {
  const { studentId } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('studentId', parseInt(studentId));

    const result = await request.query(`
      SELECT task_id as id, title, course, due_date as dueDate, description, status, created_at as createdAt
      FROM StudyPlannerTasks
      WHERE student_id = @studentId
      ORDER BY due_date ASC
    `);

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching study planner:', err);
    res.status(500).json({ message: 'Failed to fetch study planner tasks', error: err.message });
  }
});

router.post('/study-planner', async (req, res) => {
  const { student_id, title, course, due_date, description, status } = req.body;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('student_id', student_id);
    request.input('title', title);
    request.input('course', course);
    request.input('due_date', due_date);
    request.input('description', description || '');
    request.input('status', status || 'pending');

    const result = await request.query(`
      INSERT INTO StudyPlannerTasks (student_id, title, course, due_date, description, status)
      OUTPUT INSERTED.task_id
      VALUES (@student_id, @title, @course, @due_date, @description, @status)
    `);

    res.json({
      message: 'Task created successfully',
      task_id: result.recordset[0].task_id
    });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
});

router.put('/study-planner/:id', async (req, res) => {
  const { id } = req.params;
  const { title, course, due_date, description, status } = req.body;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('id', parseInt(id));
    request.input('title', title);
    request.input('course', course);
    request.input('due_date', due_date);
    request.input('description', description);
    request.input('status', status);

    await request.query(`
      UPDATE StudyPlannerTasks
      SET title = @title, course = @course, due_date = @due_date, description = @description, status = @status
      WHERE task_id = @id
    `);

    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
});

router.delete('/study-planner/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('id', parseInt(id));
    await request.query('DELETE FROM StudyPlannerTasks WHERE task_id = @id');

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
});

module.exports = router;
