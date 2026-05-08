const { getConnectionPool } = require('../db');

const getBooksByCourse = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);
  if (!Number.isInteger(courseId)) {
    return res.status(400).json({ message: 'Valid courseId is required.' });
  }

  try {
    const pool = await getConnectionPool();
    const result = await pool.request()
      .input('courseId', courseId)
      .query(`
        SELECT
          id,
          course_id AS courseId,
          title,
          author,
          description,
          pdf_link AS pdfLink
        FROM BookMaterial
        WHERE course_id = @courseId
        ORDER BY title ASC
      `);

    return res.json(result.recordset || []);
  } catch (error) {
    console.error('Failed to fetch book materials:', error);
    return res.status(500).json({ message: 'Failed to fetch book materials.' });
  }
};

module.exports = {
  getBooksByCourse
};
