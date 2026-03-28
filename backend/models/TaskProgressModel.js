const pool = require('../config/Database');

const getTaskProgress = async (studentId) => {
  const query = `
    SELECT
      COUNT(*) AS total_tasks,
      SUM(CASE WHEN d.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks,
      IF(COUNT(*) = 0, 0, ROUND(100.0 * SUM(CASE WHEN d.status = 'Completed' THEN 1 ELSE 0 END) / COUNT(*), 2)) AS completion_percentage
    FROM Deadlines d
    JOIN Courses c ON d.course_id = c.course_id
    JOIN Semesters s ON c.semester_id = s.semester_id
    WHERE s.student_id = ?
  `;

  const [rows] = await pool.query(query, [studentId]);
  return rows[0] || { total_tasks: 0, completed_tasks: 0, completion_percentage: 0 };
};

const getStudyHoursByCourse = async (studentId) => {
  const query = `
    SELECT c.course_code, c.course_name, SUM(d.allocated_study_hours) AS total_hours
    FROM Courses c
    JOIN Deadlines d ON c.course_id = d.course_id
    JOIN Semesters s ON c.semester_id = s.semester_id
    WHERE s.student_id = ?
    GROUP BY c.course_id, c.course_code, c.course_name
    ORDER BY total_hours DESC
  `;

  const [rows] = await pool.query(query, [studentId]);
  return rows;
};

const getTopCoursesByStudyHours = async (studentId) => {
  const query = `
    SELECT c.course_code, c.course_name, SUM(d.allocated_study_hours) AS total_hours
    FROM Courses c
    JOIN Deadlines d ON c.course_id = d.course_id
    JOIN Semesters s ON c.semester_id = s.semester_id
    WHERE s.student_id = ?
    GROUP BY c.course_id, c.course_code, c.course_name
    ORDER BY total_hours DESC
    LIMIT 3
  `;

  const [rows] = await pool.query(query, [studentId]);
  return rows;
};

module.exports = {
  getTaskProgress,
  getStudyHoursByCourse,
  getTopCoursesByStudyHours
};