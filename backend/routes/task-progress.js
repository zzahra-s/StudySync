const express = require('express');
const router = express.Router();
const { getConnectionPool } = require('../db');

router.get('/students/:studentId/task-progress', async (req, res) => {
  const { studentId } = req.params;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();
    request.input('studentId', parseInt(studentId));

    const result = await request.query(`
      SELECT progress_id as id, total_tasks as totalTasks, completed_tasks as completedTasks,
             percentage, updated_at as updatedAt
      FROM TaskProgress
      WHERE student_id = @studentId
    `);

    const data = result.recordset?.[0] || {
      totalTasks: 0,
      completedTasks: 0,
      percentage: 0,
      updatedAt: new Date().toISOString()
    };

    res.json(data);
  } catch (err) {
    console.error('Error fetching task progress:', err);
    res.status(500).json({ message: 'Failed to fetch task progress', error: err.message });
  }
});

router.post('/students/:studentId/task-progress', async (req, res) => {
  const { studentId } = req.params;
  const { total_tasks, completed_tasks } = req.body;

  try {
    const pool = await getConnectionPool();
    const request = pool.request();

    request.input('studentId', parseInt(studentId));
    request.input('totalTasks', total_tasks);
    request.input('completedTasks', completed_tasks);
    request.input('percentage', total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0);

    // Check if record exists
    const checkResult = await pool.request()
      .input('studentId', parseInt(studentId))
      .query('SELECT progress_id FROM TaskProgress WHERE student_id = @studentId');

    if (checkResult.recordset.length > 0) {
      // Update
      await request.query(`
        UPDATE TaskProgress
        SET total_tasks = @totalTasks, completed_tasks = @completedTasks, percentage = @percentage,
            updated_at = GETDATE()
        WHERE student_id = @studentId
      `);
    } else {
      // Insert
      await request.query(`
        INSERT INTO TaskProgress (student_id, total_tasks, completed_tasks, percentage)
        VALUES (@studentId, @totalTasks, @completedTasks, @percentage)
      `);
    }

    res.json({ message: 'Task progress updated successfully' });
  } catch (err) {
    console.error('Error updating task progress:', err);
    res.status(500).json({ message: 'Failed to update task progress', error: err.message });
  }
});

module.exports = router;
