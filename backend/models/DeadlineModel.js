const { sql, poolPromise } = require('../config/Database');

const getDeadlinesByCourse = async (courseId) => {
  const pool = await poolPromise;
  const result = await pool.request().input('courseId', sql.Int, courseId).query(`
      SELECT
        d.deadline_id,
        d.course_id,
        d.title,
        d.due_date,
        d.status,
        d.priority,
        d.allocated_study_hours
      FROM Deadlines d
      WHERE d.course_id = @courseId
      ORDER BY d.due_date ASC;
    `);

  return result.recordset;
};

const getDeadlinesByStudent = async (studentId, filters = {}) => {
  const pool = await poolPromise;
  const request = pool.request().input('studentId', sql.Int, studentId);
  const conditions = ['s.student_id = @studentId'];

  if (filters.status) {
    conditions.push('d.status = @status');
    request.input('status', sql.VarChar(10), filters.status);
  }

  if (filters.priority) {
    conditions.push('d.priority = @priority');
    request.input('priority', sql.VarChar(10), filters.priority);
  }

  if (filters.upcoming) {
    conditions.push("d.status = 'Pending'");
    conditions.push('d.due_date >= GETDATE()');
    conditions.push('d.due_date <= DATEADD(day, 7, GETDATE())');
  }

  if (filters.overdue) {
    conditions.push("d.status = 'Pending'");
    conditions.push('d.due_date < GETDATE()');
  }

  const result = await request.query(`
      SELECT
        d.deadline_id,
        d.course_id,
        d.title,
        d.due_date,
        d.status,
        d.priority,
        d.allocated_study_hours,
        c.course_code,
        c.course_name,
        c.instructor_name,
        s.semester_id,
        s.semester_name
      FROM Deadlines d
      INNER JOIN Courses c ON d.course_id = c.course_id
      INNER JOIN Semesters s ON c.semester_id = s.semester_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY d.due_date ASC;
    `);

  return result.recordset;
};

const createDeadline = async (deadlineData) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('course_id', sql.Int, deadlineData.course_id)
    .input('title', sql.VarChar(150), deadlineData.title)
    .input('due_date', sql.DateTime, new Date(deadlineData.due_date))
    .input('status', sql.VarChar(10), deadlineData.status || 'Pending')
    .input('priority', sql.VarChar(10), deadlineData.priority || 'Medium')
    .input('allocated_study_hours', sql.Decimal(4, 1), deadlineData.allocated_study_hours ?? 0)
    .query(`
      INSERT INTO Deadlines (course_id, title, due_date, status, priority, allocated_study_hours)
      OUTPUT
        INSERTED.deadline_id,
        INSERTED.course_id,
        INSERTED.title,
        INSERTED.due_date,
        INSERTED.status,
        INSERTED.priority,
        INSERTED.allocated_study_hours
      VALUES (@course_id, @title, @due_date, @status, @priority, @allocated_study_hours);
    `);

  return result.recordset[0];
};

const updateDeadline = async (deadlineId, updates) => {
  const pool = await poolPromise;
  const request = pool.request().input('deadline_id', sql.Int, deadlineId);
  const assignments = [];

  if (updates.title !== undefined) {
    assignments.push('title = @title');
    request.input('title', sql.VarChar(150), updates.title);
  }

  if (updates.due_date !== undefined) {
    assignments.push('due_date = @due_date');
    request.input('due_date', sql.DateTime, new Date(updates.due_date));
  }

  if (updates.status !== undefined) {
    assignments.push('status = @status');
    request.input('status', sql.VarChar(10), updates.status);
  }

  if (updates.priority !== undefined) {
    assignments.push('priority = @priority');
    request.input('priority', sql.VarChar(10), updates.priority);
  }

  if (updates.allocated_study_hours !== undefined) {
    assignments.push('allocated_study_hours = @allocated_study_hours');
    request.input('allocated_study_hours', sql.Decimal(4, 1), updates.allocated_study_hours);
  }

  if (updates.course_id !== undefined) {
    assignments.push('course_id = @course_id');
    request.input('course_id', sql.Int, updates.course_id);
  }

  if (assignments.length === 0) {
    return null;
  }

  const result = await request.query(`
      UPDATE Deadlines
      SET ${assignments.join(', ')}
      OUTPUT
        INSERTED.deadline_id,
        INSERTED.course_id,
        INSERTED.title,
        INSERTED.due_date,
        INSERTED.status,
        INSERTED.priority,
        INSERTED.allocated_study_hours
      WHERE deadline_id = @deadline_id;
    `);

  return result.recordset[0] || null;
};

const deleteDeadline = async (deadlineId) => {
  const pool = await poolPromise;
  const result = await pool.request().input('deadlineId', sql.Int, deadlineId).query(`
      DELETE FROM Deadlines
      WHERE deadline_id = @deadlineId;
    `);

  return result.rowsAffected[0] > 0;
};

const getStudyPlanner = async (studentId) => {
  const pool = await poolPromise;
  const result = await pool.request().input('studentId', sql.Int, studentId).query(`
      SELECT
        d.deadline_id,
        d.title AS task_name,
        d.due_date,
        d.priority,
        d.allocated_study_hours,
        c.course_id,
        c.course_code,
        c.course_name,
        c.instructor_name,
        s.semester_name
      FROM Deadlines d
      INNER JOIN Courses c ON d.course_id = c.course_id
      INNER JOIN Semesters s ON c.semester_id = s.semester_id
      WHERE s.student_id = @studentId
        AND d.status = 'Pending'
      ORDER BY d.due_date ASC;
    `);

  return result.recordset;
};

const getStudyHoursPerCourse = async (studentId) => {
  const pool = await poolPromise;
  const result = await pool.request().input('studentId', sql.Int, studentId).query(`
      SELECT
        c.course_id,
        c.course_code,
        c.course_name,
        CAST(ISNULL(SUM(d.allocated_study_hours), 0) AS DECIMAL(6, 1)) AS total_hours
      FROM Courses c
      INNER JOIN Semesters s ON c.semester_id = s.semester_id
      LEFT JOIN Deadlines d ON c.course_id = d.course_id
      WHERE s.student_id = @studentId
      GROUP BY c.course_id, c.course_code, c.course_name
      ORDER BY total_hours DESC, c.course_code ASC;
    `);

  return result.recordset;
};

const getTopCoursesByStudyHours = async (studentId) => {
  const pool = await poolPromise;
  const result = await pool.request().input('studentId', sql.Int, studentId).query(`
      SELECT TOP 3
        c.course_id,
        c.course_code,
        c.course_name,
        CAST(SUM(d.allocated_study_hours) AS DECIMAL(6, 1)) AS total_hours
      FROM Courses c
      INNER JOIN Semesters s ON c.semester_id = s.semester_id
      INNER JOIN Deadlines d ON c.course_id = d.course_id
      WHERE s.student_id = @studentId
      GROUP BY c.course_id, c.course_code, c.course_name
      ORDER BY total_hours DESC, c.course_code ASC;
    `);

  return result.recordset;
};

module.exports = {
  getDeadlinesByCourse,
  getDeadlinesByStudent,
  createDeadline,
  updateDeadline,
  deleteDeadline,
  getStudyPlanner,
  getStudyHoursPerCourse,
  getTopCoursesByStudyHours,
};
