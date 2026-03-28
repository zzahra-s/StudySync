const { sql, poolPromise } = require('../config/database');

class Semester {
    static async create(semesterData) {
        const { student_id, semester_name, start_date, end_date } = semesterData;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('student_id', sql.Int, student_id)
            .input('semester_name', sql.VarChar(50), semester_name)
            .input('start_date', sql.Date, start_date)
            .input('end_date', sql.Date, end_date)
            .query(`
                INSERT INTO Semesters (student_id, semester_name, start_date, end_date)
                OUTPUT INSERTED.semester_id
                VALUES (@student_id, @semester_name, @start_date, @end_date)
            `);
        return result.recordset[0].semester_id;
    }

    static async findByStudentId(student_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('student_id', sql.Int, student_id)
            .query(`
                SELECT * FROM Semesters
                WHERE student_id = @student_id
                ORDER BY start_date DESC
            `);
        return result.recordset;
    }

    static async findById(semester_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('semester_id', sql.Int, semester_id)
            .query('SELECT * FROM Semesters WHERE semester_id = @semester_id');
        return result.recordset[0];
    }

    static async update(semester_id, updateData) {
        const { semester_name, start_date, end_date } = updateData;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('semester_id', sql.Int, semester_id)
            .input('semester_name', sql.VarChar(50), semester_name)
            .input('start_date', sql.Date, start_date)
            .input('end_date', sql.Date, end_date)
            .query(`
                UPDATE Semesters
                SET semester_name = @semester_name,
                    start_date = @start_date,
                    end_date = @end_date
                WHERE semester_id = @semester_id
            `);
        return result.rowsAffected[0] > 0;
    }

    static async delete(semester_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('semester_id', sql.Int, semester_id)
            .query('DELETE FROM Semesters WHERE semester_id = @semester_id');
        return result.rowsAffected[0] > 0;
    }
}

module.exports = Semester;