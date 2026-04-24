

const { sql, poolPromise } = require('../config/database');

class GPA {
    static async getCGPA(student_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('student_id', sql.Int, student_id)
            .query(`
                SELECT
                    st.full_name,
                    ROUND(
                        SUM(c.credit_hours * gp.grade_points) / SUM(c.credit_hours),
                        2
                    ) AS cgpa,
                    COUNT(DISTINCT c.course_id) AS graded_courses,
                    SUM(c.credit_hours)          AS total_credit_hours
                FROM Students st
                JOIN Semesters  s  ON st.student_id   = s.student_id
                JOIN Courses    c  ON s.semester_id   = c.semester_id
                JOIN Grades     g  ON c.course_id     = g.course_id
                JOIN GradePoints gp ON g.letter_grade = gp.letter_grade
                WHERE st.student_id = @student_id
                GROUP BY st.full_name
            `);
        return result.recordset[0] || null;
    }

    static async getSemesterGPA(student_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('student_id', sql.Int, student_id)
            .query(`
                SELECT
                    s.semester_id,
                    s.semester_name,
                    s.start_date,
                    s.end_date,
                    ROUND(
                        SUM(c.credit_hours * gp.grade_points) / SUM(c.credit_hours),
                        2
                    ) AS semester_gpa,
                    COUNT(c.course_id)  AS graded_courses,
                    SUM(c.credit_hours) AS total_credit_hours
                FROM Semesters s
                JOIN Courses     c  ON s.semester_id   = c.semester_id
                JOIN Grades      g  ON c.course_id     = g.course_id
                JOIN GradePoints gp ON g.letter_grade  = gp.letter_grade
                WHERE s.student_id = @student_id
                GROUP BY s.semester_id, s.semester_name, s.start_date, s.end_date
                ORDER BY s.start_date
            `);
        return result.recordset;
    }

    //Admin: avg cgpa for all students
    static async getOverallAverageCGPA() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT ROUND(AVG(sub.cgpa), 2) AS overall_avg_cgpa
            FROM (
                SELECT
                    st.student_id,
                    SUM(c.credit_hours * gp.grade_points) / SUM(c.credit_hours) AS cgpa
                FROM Students   st
                JOIN Semesters  s  ON st.student_id   = s.student_id
                JOIN Courses    c  ON s.semester_id   = c.semester_id
                JOIN Grades     g  ON c.course_id     = g.course_id
                JOIN GradePoints gp ON g.letter_grade = gp.letter_grade
                GROUP BY st.student_id
            ) AS sub
        `);
        return result.recordset[0];
    }
}

module.exports = GPA;