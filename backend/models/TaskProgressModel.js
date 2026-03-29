const { poolPromise } = require('../config/Database');

/**
 * Get overall task progress for student
 */
const getTaskProgress = async (studentId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('studentId', poolPromise.sql.Int, studentId)
    .query(`
      SELECT
        COUNT(*) AS total_tasks,
        SUM(CASE WHEN d.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks,
        CASE 
          WHEN COUNT(*) = 0 THEN 0 
          ELSE ROUND(100.0 * SUM(CASE WHEN d.status = 'Completed' THEN 1 ELSE 0 END) / COUNT(*), 2) 
        END AS completion_percentage
      FROM Deadlines d
      JOIN Courses c ON d.course_id = c.course_id
      JOIN Semesters s ON c.semester_id = s.semester_id
      WHERE s.student_id = @studentId
    `);
  return result.recordset[0] || { total_tasks: 0, completed_tasks: 0, completion_percentage: 0 };
};

/**
 * Get study hours per course for student
 */
const getStudyHoursByCourse = async (studentId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('studentId', poolPromise.sql.Int, studentId)
    .query(`
      SELECT c.course_code, c.course_name, ISNULL(SUM(d.allocated_study_hours), 0) AS total_hours
      FROM Courses c
      JOIN Semesters s ON c.semester_id = s.semester_id
      LEFT JOIN Deadlines d ON c.course_id = d.course_id
      WHERE s.student_id = @studentId
      GROUP BY c.course_id, c.course_code, c.course_name
      ORDER BY total_hours DESC
    `);
  return result.recordset;
};

/**
 * Get top 3 courses by study hours
 */
const getTopCoursesByStudyHours = async (studentId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('studentId', poolPromise.sql.Int, studentId)
    .query(`
      SELECT TOP 3 c.course_code, c.course_name, ISNULL(SUM(d.allocated_study_hours), 0) AS total_hours
      FROM Courses c
      JOIN Semesters s ON c.semester_id = s.semester_id
      LEFT JOIN Deadlines d ON c.course_id = d.course_id
      WHERE s.student_id = @studentId
      GROUP BY c.course_id, c.course_code, c.course_name
      ORDER BY total_hours DESC
    `);
  return result.recordset;
};

module.exports = {
  getTaskProgress,
  getStudyHoursByCourse,
  getTopCoursesByStudyHours
};

