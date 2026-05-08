const { getConnectionPool } = require('../db');

const getTasksByCourse = async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  const courseId = parseInt(req.query.courseId, 10);

  if (!Number.isInteger(studentId) || !Number.isInteger(courseId)) {
    return res.status(400).json({ message: 'Valid studentId and courseId are required.' });
  }

  try {
    const pool = await getConnectionPool();
    const result = await pool.request()
      .input('studentId', studentId)
      .input('courseId', courseId)
      .query(`
        SELECT
          id,
          user_id AS userId,
          course_id AS courseId,
          title,
          status,
          linked_deadline_id AS linkedDeadlineId,
          created_at AS createdAt
        FROM TaskManager
        WHERE user_id = @studentId AND course_id = @courseId
        ORDER BY created_at DESC, id DESC
      `);

    return res.json(result.recordset || []);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

const addTask = async (req, res) => {
  const { userId, courseId, title, status } = req.body;
  const normalizedStatus = (status || 'todo').toLowerCase();

  if (!userId || !courseId || !title) {
    return res.status(400).json({ message: 'userId, courseId, and title are required.' });
  }

  if (!['todo', 'done'].includes(normalizedStatus)) {
    return res.status(400).json({ message: 'status must be todo or done.' });
  }

  try {
    const pool = await getConnectionPool();
    const result = await pool.request()
      .input('userId', parseInt(userId, 10))
      .input('courseId', parseInt(courseId, 10))
      .input('title', title)
      .input('status', normalizedStatus)
      .query(`
        INSERT INTO TaskManager (user_id, course_id, title, status)
        OUTPUT INSERTED.id
        VALUES (@userId, @courseId, @title, @status)
      `);

    return res.status(201).json({
      message: 'Task created successfully.',
      id: result.recordset[0].id
    });
  } catch (error) {
    console.error('Failed to create task:', error);
    return res.status(500).json({ message: 'Failed to create task.' });
  }
};

const updateTaskStatus = async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const { status } = req.body;
  const normalizedStatus = String(status || '').toLowerCase();

  if (!Number.isInteger(taskId) || !['todo', 'done'].includes(normalizedStatus)) {
    return res.status(400).json({ message: 'Valid task id and status are required.' });
  }

  try {
    const pool = await getConnectionPool();
    await pool.request()
      .input('id', taskId)
      .input('status', normalizedStatus)
      .query(`
        UPDATE TaskManager
        SET status = @status
        WHERE id = @id
      `);

    return res.json({ message: 'Task status updated successfully.' });
  } catch (error) {
    console.error('Failed to update task status:', error);
    return res.status(500).json({ message: 'Failed to update task status.' });
  }
};

const deleteTask = async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  if (!Number.isInteger(taskId)) {
    return res.status(400).json({ message: 'Valid task id is required.' });
  }

  try {
    const pool = await getConnectionPool();
    await pool.request()
      .input('id', taskId)
      .query('DELETE FROM TaskManager WHERE id = @id');

    return res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return res.status(500).json({ message: 'Failed to delete task.' });
  }
};

module.exports = {
  getTasksByCourse,
  addTask,
  updateTaskStatus,
  deleteTask
};
