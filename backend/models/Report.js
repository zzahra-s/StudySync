
const { sql, poolPromise } = require('../config/database');

class Report {
    // All grades a student has ever receiveed
    static async getCourseGrades(student_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('student_id', sql.Int, student_id)
            .query(`
                SELECT
                    s.semester_name,
                    s.start_date,
                    c.course_code,
                    c.course_name,
                    c.credit_hours,
                    g.letter_grade,
                    gp.grade_points,
                    g.comments
                FROM Students   st
                JOIN Semesters  s  ON st.student_id   = s.student_id
                JOIN Courses    c  ON s.semester_id   = c.semester_id
                JOIN Grades     g  ON c.course_id     = g.course_id
                JOIN GradePoints gp ON g.letter_grade = gp.letter_grade
                WHERE st.student_id = @student_id
                ORDER BY s.start_date, c.course_code
            `);
        return result.recordset;
    }

    // Number of courses per semester 
    static async getCoursesPerSemester(student_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('student_id', sql.Int, student_id)
            .query(`
                SELECT
                    s.semester_id,
                    s.semester_name,
                    s.start_date,
                    s.end_date,
                    COUNT(c.course_id) AS course_count,
                    ISNULL(SUM(c.credit_hours), 0) AS total_credit_hours
                FROM Semesters s
                LEFT JOIN Courses c ON s.semester_id = c.semester_id
                WHERE s.student_id = @student_id
                GROUP BY s.semester_id, s.semester_name, s.start_date, s.end_date
                ORDER BY s.start_date
            `);
        return result.recordset;
    }

    // ─── Courses with no grade yet (incomplete) ───────────────────────────────
    static async getIncompleteCourses(student_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('student_id', sql.Int, student_id)
            .query(`
                SELECT
                    s.semester_name,
                    c.course_id,
                    c.course_code,
                    c.course_name,
                    c.credit_hours,
                    c.instructor_name
                FROM Courses    c
                JOIN Semesters  s  ON c.semester_id = s.semester_id
                LEFT JOIN Grades g ON c.course_id   = g.course_id
                WHERE s.student_id = @student_id
                  AND g.grade_id IS NULL
                ORDER BY s.start_date, c.course_code
            `);
        return result.recordset;
    }
}

module.exports = Report;