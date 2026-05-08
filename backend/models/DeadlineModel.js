const pool = require('../config/Database');

const getDeadlinesByCourse = async (courseId) => {
  const query = `
    SELECT 
      deadline_id,
      course_id,
      title,
      due_date,
      status,
      priority,
      allocated_study_hours
    FROM Deadlines
    WHERE course_id = ?
    ORDER BY due_date ASC
  `;
  const [rows] = await pool.query(query, [courseId]);
  return rows;
};

const getDeadlinesByStudent = async (studentId, filters = {}) => {
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
    WHERE s.student_id = ?
  `;

  const params = [studentId];

  if (filters.status) {
    query += ` AND d.status = ?`;
    params.push(filters.status);
  }

  if (filters.priority) {
    query += ` AND d.priority = ?`;
    params.push(filters.priority);
  }

  if (filters.upcoming === true) {
    query += ` AND d.status = 'Pending' AND d.due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)`;
  }

  if (filters.overdue === true) {
    query += ` AND d.status = 'Pending' AND d.due_date < NOW()`;
  }

  query += ` ORDER BY d.due_date ASC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

const getDeadlineById = async (deadlineId) => {
  const query = `
    SELECT 
      deadline_id,
      course_id,
      title,
      due_date,
      status,
      priority,
      allocated_study_hours
    FROM Deadlines
    WHERE deadline_id = ?
  `;
  const [rows] = await pool.query(query, [deadlineId]);
  return rows[0] || null;
};

const createDeadline = async (deadlineData) => {
  const { courseId, title, dueDate, status = 'Pending', priority = 'Medium', allocatedStudyHours = 0 } = deadlineData;

  const query = `
    INSERT INTO Deadlines (course_id, title, due_date, status, priority, allocated_study_hours)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(query, [
    courseId,
    title,
    dueDate,
    status,
    priority,
    allocatedStudyHours
  ]);

  return {
    deadline_id: result.insertId,
    course_id: courseId,
    title,
    due_date: dueDate,
    status,
    priority,
    allocated_study_hours: allocatedStudyHours
  };
};

const updateDeadline = async (deadlineId, updateData) => {
  const fields = [];
  const values = [];

  if (updateData.title !== undefined) {
    fields.push('title = ?');
    values.push(updateData.title);
  }
  if (updateData.dueDate !== undefined) {
    fields.push('due_date = ?');
    values.push(updateData.dueDate);
  }
  if (updateData.status !== undefined) {
    fields.push('status = ?');
    values.push(updateData.status);
  }
  if (updateData.priority !== undefined) {
    fields.push('priority = ?');
    values.push(updateData.priority);
  }
  if (updateData.allocatedStudyHours !== undefined) {
    fields.push('allocated_study_hours = ?');
    values.push(updateData.allocatedStudyHours);
  }

  if (fields.length === 0) {
    return { affectedRows: 0 };
  }

  values.push(deadlineId);
  const query = `UPDATE Deadlines SET ${fields.join(', ')} WHERE deadline_id = ?`;

  const [result] = await pool.query(query, values);
  return result;
};

const deleteDeadline = async (deadlineId) => {
  const query = `DELETE FROM Deadlines WHERE deadline_id = ?`;
  const [result] = await pool.query(query, [deadlineId]);
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
