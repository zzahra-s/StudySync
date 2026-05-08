const { getConnectionPool } = require('../db');

const getWeightagesByCourse = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);
  if (!Number.isInteger(courseId)) {
    return res.status(400).json({ message: 'Valid courseId is required.' });
  }

  try {
    const pool = await getConnectionPool();
    const result = await pool.request()
      .input('courseId', courseId)
      .query(`
        SELECT TOP 1
          id,
          course_id AS courseId,
          quizzes_percentage AS quizzesPercentage,
          assignments_percentage AS assignmentsPercentage,
          midterm_percentage AS midtermPercentage,
          final_percentage AS finalPercentage
        FROM CourseMaterialWeightage
        WHERE course_id = @courseId
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Course material weightages not found.' });
    }

    return res.json(result.recordset[0]);
  } catch (error) {
    console.error('Failed to fetch course material weightages:', error);
    return res.status(500).json({ message: 'Failed to fetch course material weightages.' });
  }
};

const updateWeightagesByCourse = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);
  const {
    quizzesPercentage,
    assignmentsPercentage,
    midtermPercentage,
    finalPercentage
  } = req.body;

  if (!Number.isInteger(courseId)) {
    return res.status(400).json({ message: 'Valid courseId is required.' });
  }

  const values = [quizzesPercentage, assignmentsPercentage, midtermPercentage, finalPercentage]
    .map((value) => Number(value));

  if (values.some((value) => Number.isNaN(value) || value < 0 || value > 100)) {
    return res.status(400).json({ message: 'All percentages must be numbers from 0 to 100.' });
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  if (total !== 100) {
    return res.status(400).json({ message: 'Weightages must add up to 100.' });
  }

  try {
    const pool = await getConnectionPool();
    const updateResult = await pool.request()
      .input('courseId', courseId)
      .input('quizzesPercentage', values[0])
      .input('assignmentsPercentage', values[1])
      .input('midtermPercentage', values[2])
      .input('finalPercentage', values[3])
      .query(`
        UPDATE CourseMaterialWeightage
        SET
          quizzes_percentage = @quizzesPercentage,
          assignments_percentage = @assignmentsPercentage,
          midterm_percentage = @midtermPercentage,
          final_percentage = @finalPercentage,
          updated_at = GETDATE()
        WHERE course_id = @courseId
      `);

    if (!updateResult.rowsAffected[0]) {
      await pool.request()
        .input('courseId', courseId)
        .input('quizzesPercentage', values[0])
        .input('assignmentsPercentage', values[1])
        .input('midtermPercentage', values[2])
        .input('finalPercentage', values[3])
        .query(`
          INSERT INTO CourseMaterialWeightage (
            course_id,
            quizzes_percentage,
            assignments_percentage,
            midterm_percentage,
            final_percentage
          )
          VALUES (
            @courseId,
            @quizzesPercentage,
            @assignmentsPercentage,
            @midtermPercentage,
            @finalPercentage
          )
        `);
    }

    return res.json({ message: 'Weightages saved successfully.' });
  } catch (error) {
    console.error('Failed to update course material weightages:', error);
    return res.status(500).json({ message: 'Failed to update course material weightages.' });
  }
};

module.exports = {
  getWeightagesByCourse,
  updateWeightagesByCourse
};
