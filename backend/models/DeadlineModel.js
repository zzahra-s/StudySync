const { poolPromise } = require('../config/Database');

/**
 * Get deadlines by course
 */
const getDeadlinesByCourse = async (courseId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('courseId', poolPromise.sql.Int, courseId)
    .query(`
      SELECT 
        deadline_id,
        course_id,
        title,
        due_date,
        status,
        priority,
        allocated_study_hours
      FROM Deadlines
      WHERE course_id = @courseId
      ORDER BY due_date ASC
    `);
  return result.recordset;
};

/**
 * Get deadlines by student with filters
 */
const getDeadlinesByStudent = async (studentId, filters = {}) => {
  const pool = await poolPromise;
  
  let query = `
    SELECT 
      d.deadline_id,
      d.course_id,
      d.title,
      d.due_date,
      d.status,
      d.priority,
      d.allocated_study_hours,
      c.course_code,
      c.course_name
    FROM Deadlines d
    JOIN Courses c ON d.course_id = c.course_id
    JOIN Semesters s ON c.semester_id = s.semester_id
    WHERE s.student_id = @studentId
  `;

  const request = pool.request().input('studentId', poolPromise.sql.Int, studentId);

  if (filters.status) {
    query += ' AND d.status = @status';
    request.input('status', poolPromise.sql.VarChar(10), filters.status);
  }

  if (filters.priority) {
    query += ' AND d.priority = @priority';
    request.input('priority', poolPromise.sql.VarChar(10), filters.priority);
  }

  if (filters.upcoming === true) {
    query += " AND d.status = 'Pending' AND d.due_date BETWEEN GETDATE() AND DATEADD(day, 7, GETDATE())";
  }

  if (filters.overdue === true) {
    query += " AND d.status = 'Pending' AND d.due_date < GETDATE()";
  }

  query += ' ORDER BY d.due_date ASC';

  const result = await request.query(query);
  return result.recordset;
};

/**
 * Get single deadline
 */
const getDeadlineById = async (deadlineId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('deadlineId', poolPromise.sql.Int, deadlineId)
    .query(`
      SELECT 
        deadline_id,
        course_id,
        title,
        due_date,
        status,
        priority,
        allocated_study_hours
      FROM Deadlines
      WHERE deadline_id = @deadlineId
    `);
  return result.recordset[0] || null;
};

/**
 * Create deadline
 */
const createDeadline = async (deadlineData) => {
  const { courseId, title, dueDate, status = 'Pending', priority = 'Medium', allocatedStudyHours = 0 } = deadlineData;

  const pool = await poolPromise;
  const result = await pool.request()
    .input('courseId', poolPromise.sql.Int, courseId)
    .input('title', poolPromise.sql.NVarChar(150), title)
    .input('dueDate', poolPromise.sql.DateTime, dueDate)
    .input('status', poolPromise.sql.VarChar(10), status)
    .input('priority', poolPromise.sql.VarChar(10), priority)
    .input('allocatedStudyHours', poolPromise.sql.Decimal(4,1), allocatedStudyHours)
    .query(`
      INSERT INTO Deadlines (course_id, title, due_date, status, priority, allocated_study_hours)
      OUTPUT INSERTED.*
      VALUES (@courseId, @title, @dueDate, @status, @priority, @allocatedStudyHours)
    `);
  return result.recordset[0];
};

/**
 * Update deadline
 */
const updateDeadline = async (deadlineId, updateData) => {
  const pool = await poolPromise;
  let query = 'UPDATE Deadlines SET ';
  const request = pool.request().input('deadlineId', poolPromise.sql.Int, deadlineId);

  const updates = [];
  if (updateData.title !== undefined) {
    updates.push('title = @title');
    request.input('title', poolPromise.sql.NVarChar(150), updateData.title);
  }
  if (updateData.dueDate !== undefined) {
    updates.push('due_date = @dueDate');
    request.input('dueDate', poolPromise.sql.DateTime, updateData.dueDate);
  }
  if (updateData.status !== undefined) {
    updates.push('status = @status');
    request.input('status', poolPromise.sql.VarChar(10), updateData.status);
  }
  if (updateData.priority !== undefined) {
    updates.push('priority = @priority');
    request.input('priority', poolPromise.sql.VarChar(10), updateData.priority);
  }
  if (updateData.allocatedStudyHours !== undefined) {
    updates.push('allocated_study_hours = @allocatedStudyHours');
    request.input('allocatedStudyHours', poolPromise.sql.Decimal(4,1), updateData.allocatedStudyHours);
  }

  if (updates.length === 0) return { rowsAffected: 0 };

  query += updates.join(', ') + ' WHERE deadline_id = @deadlineId';
  const result = await request.query(query);
  return result;
};

/**
 * Delete deadline
 */
const deleteDeadline = async (deadlineId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('deadlineId', poolPromise.sql.Int, deadlineId)
    .query('DELETE FROM Deadlines WHERE deadline_id = @deadlineId');
  return result;
};

module.exports = {
  getDeadlinesByCourse,
  getDeadlinesByStudent,
  getDeadlineById,
  createDeadline,
  updateDeadline,
  deleteDeadline
};

