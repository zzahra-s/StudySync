const { sql, poolPromise } = require('../config/database');

class Grade {
    static async createOrUpdate(gradeData) {
        const { course_id, letter_grade, comments } = gradeData;
        const pool = await poolPromise;

        // Check if grade exists (course_id is unique in Grades table)
        const existing = await pool.request()
            .input('course_id', sql.Int, course_id)
            .query('SELECT grade_id FROM Grades WHERE course_id = @course_id');

        if (existing.recordset.length > 0) {
            await pool.request()
                .input('course_id', sql.Int, course_id)
                .input('letter_grade', sql.VarChar(2), letter_grade)
                .input('comments', sql.VarChar(500), comments || null)
                .query(`
                    UPDATE Grades
                    SET letter_grade = @letter_grade, comments = @comments
                    WHERE course_id = @course_id
                `);
            return { id: existing.recordset[0].grade_id, updated: true };
        } else {
            const result = await pool.request()
                .input('course_id', sql.Int, course_id)
                .input('letter_grade', sql.VarChar(2), letter_grade)
                .input('comments', sql.VarChar(500), comments || null)
                .query(`
                    INSERT INTO Grades (course_id, letter_grade, comments)
                    OUTPUT INSERTED.grade_id
                    VALUES (@course_id, @letter_grade, @comments)
                `);
            return { id: result.recordset[0].grade_id, updated: false };
        }
    }

    static async findByCourseId(course_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('course_id', sql.Int, course_id)
            .query(`
                SELECT g.*, gp.grade_points
                FROM Grades g
                JOIN GradePoints gp ON g.letter_grade = gp.letter_grade
                WHERE g.course_id = @course_id
            `);
        return result.recordset[0];
    }

    static async update(grade_id, gradeData) {
        const { letter_grade, comments } = gradeData;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('grade_id', sql.Int, grade_id)
            .input('letter_grade', sql.VarChar(2), letter_grade)
            .input('comments', sql.VarChar(500), comments || null)
            .query(`
                UPDATE Grades
                SET letter_grade = @letter_grade, comments = @comments
                WHERE grade_id = @grade_id
            `);
        return result.rowsAffected[0] > 0;
    }

    static async getGradePoints() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM GradePoints ORDER BY grade_points DESC');
        return result.recordset;
    }
}

module.exports = Grade;