const { sql, poolPromise } = require('../config/Database');

const getTaskProgress = async (studentId) => {
  const pool = await poolPromise;
  const result = await pool.request().input('studentId', sql.Int, studentId).query(`
      SELECT
        COUNT(*) AS total_tasks,
        ISNULL(SUM(CASE WHEN d.status = 'Completed' THEN 1 ELSE 0 END), 0) AS completed_tasks
      FROM Deadlines d
      INNER JOIN Courses c ON d.course_id = c.course_id
      INNER JOIN Semesters s ON c.semester_id = s.semester_id
      WHERE s.student_id = @studentId;
    `);

  const row = result.recordset[0] || {};
  const totalTasks = Number(row.total_tasks || 0);
  const completedTasks = Number(row.completed_tasks || 0);
  const completionPercentage =
    totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(2)) : 0;

  return {
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    completion_percentage: completionPercentage,
  };
};

module.exports = {
  getTaskProgress,
};
