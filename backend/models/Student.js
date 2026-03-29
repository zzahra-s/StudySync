const { sql, poolPromise } = require('../config/Database');  // FIXED: Database.js

class Student {
    static async create(studentData) {
        const { full_name, roll_number, email, password } = studentData;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('full_name', sql.VarChar(100), full_name)
            .input('roll_number', sql.VarChar(100), roll_number)
            .input('email', sql.VarChar(100), email)
            .input('password', sql.VarChar(255), password)
            .query(`
                INSERT INTO Students (full_name, roll_number, email, password)
                OUTPUT INSERTED.student_id
                VALUES (@full_name, @roll_number, @email, @password)
            `);
        return result.recordset[0].student_id;
    }

    static async findByEmail(email) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.VarChar(100), email)
            .query('SELECT * FROM Students WHERE email = @email');
        return result.recordset[0];
    }

    static async findById(student_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('student_id', sql.Int, student_id)
            .query(`
                SELECT student_id, full_name, roll_number, email, created_at
                FROM Students WHERE student_id = @student_id
            `);
        return result.recordset[0];
    }

    static async update(student_id, updateData) {
        const { full_name, email } = updateData;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('student_id', sql.Int, student_id)
            .input('full_name', sql.VarChar(100), full_name)
            .input('email', sql.VarChar(100), email)
            .query(`
                UPDATE Students
                SET full_name = @full_name, email = @email
                WHERE student_id = @student_id
            `);
        return result.rowsAffected[0] > 0;
    }
}

module.exports = Student;

