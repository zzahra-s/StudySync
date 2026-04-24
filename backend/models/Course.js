const { sql, poolPromise } = require('../config/database');

class Course {
    static async create(courseData) {
        const { semester_id, course_code, course_name, credit_hours, instructor_name } = courseData;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('semester_id', sql.Int, semester_id)
            .input('course_code', sql.VarChar(20), course_code)
            .input('course_name', sql.VarChar(100), course_name)
            .input('credit_hours', sql.Decimal(3, 1), credit_hours)
            .input('instructor_name', sql.VarChar(100), instructor_name || null)
            .query(`
                INSERT INTO Courses (semester_id, course_code, course_name, credit_hours, instructor_name)
                OUTPUT INSERTED.course_id
                VALUES (@semester_id, @course_code, @course_name, @credit_hours, @instructor_name)
            `);
        return result.recordset[0].course_id;
    }

    static async findBySemesterId(semester_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('semester_id', sql.Int, semester_id)
            .query(`
                SELECT * FROM Courses
                WHERE semester_id = @semester_id
                ORDER BY course_code
            `);
        return result.recordset;
    }

    static async findById(course_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('course_id', sql.Int, course_id)
            .query(`
                SELECT c.*, s.semester_name, s.student_id
                FROM Courses c
                JOIN Semesters s ON c.semester_id = s.semester_id
                WHERE c.course_id = @course_id
            `);
        return result.recordset[0];
    }

    static async update(course_id, updateData) {
        const { course_code, course_name, credit_hours, instructor_name } = updateData;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('course_id', sql.Int, course_id)
            .input('course_code', sql.VarChar(20), course_code)
            .input('course_name', sql.VarChar(100), course_name)
            .input('credit_hours', sql.Decimal(3, 1), credit_hours)
            .input('instructor_name', sql.VarChar(100), instructor_name || null)
            .query(`
                UPDATE Courses
                SET course_code = @course_code,
                    course_name = @course_name,
                    credit_hours = @credit_hours,
                    instructor_name = @instructor_name
                WHERE course_id = @course_id
            `);
        return result.rowsAffected[0] > 0;
    }

    static async delete(course_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('course_id', sql.Int, course_id)
            .query('DELETE FROM Courses WHERE course_id = @course_id');
        return result.rowsAffected[0] > 0;
    }

    static async getCoursesWithGrades(student_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('student_id', sql.Int, student_id)
            .query(`
                SELECT c.*, g.letter_grade, gp.grade_points, s.semester_name
                FROM Courses c
                JOIN Semesters s ON c.semester_id = s.semester_id
                LEFT JOIN Grades g ON c.course_id = g.course_id
                LEFT JOIN GradePoints gp ON g.letter_grade = gp.letter_grade
                WHERE s.student_id = @student_id
                ORDER BY s.start_date DESC, c.course_code
            `);
        return result.recordset;
    }
}

module.exports = Course;
