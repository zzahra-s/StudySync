
const { sql, poolPromise } = require('../config/database');

class GPAScenario {
//list scenarios
    static async findByStudentId(student_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('student_id', sql.Int, student_id)
            .query(`
                SELECT scenario_id, scenario_name, created_at
                FROM GPAScenarios
                WHERE student_id = @student_id
                ORDER BY created_at DESC
            `);
        return result.recordset;
    }
//get 1 scenario
    static async findById(scenario_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('scenario_id', sql.Int, scenario_id)
            .query(`
                SELECT scenario_id, student_id, scenario_name, created_at
                FROM GPAScenarios
                WHERE scenario_id = @scenario_id
            `);
        return result.recordset[0] || null;
    }
//create scenario
    static async create(student_id, scenario_name) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('student_id', sql.Int, student_id)
            .input('scenario_name', sql.VarChar(100), scenario_name)
            .query(`
                INSERT INTO GPAScenarios (student_id, scenario_name)
                OUTPUT INSERTED.scenario_id
                VALUES (@student_id, @scenario_name)
            `);
        return result.recordset[0].scenario_id;
    }

//update its name
    static async update(scenario_id, scenario_name) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('scenario_id', sql.Int, scenario_id)
            .input('scenario_name', sql.VarChar(100), scenario_name)
            .query(`
                UPDATE GPAScenarios
                SET scenario_name = @scenario_name
                WHERE scenario_id = @scenario_id
            `);
        return result.rowsAffected[0] > 0;
    }

//delete,cascades to scenariocourse
    static async delete(scenario_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('scenario_id', sql.Int, scenario_id)
            .query('DELETE FROM GPAScenarios WHERE scenario_id = @scenario_id');
        return result.rowsAffected[0] > 0;
    }
//get courses in a scenario
    static async getScenarioCourses(scenario_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('scenario_id', sql.Int, scenario_id)
            .query(`
                SELECT
                    sc.course_id,
                    c.course_code,
                    c.course_name,
                    c.credit_hours,
                    sc.expected_grade,
                    gp.grade_points
                FROM ScenarioCourses sc
                JOIN Courses     c  ON sc.course_id    = c.course_id
                JOIN GradePoints gp ON sc.expected_grade = gp.letter_grade
                WHERE sc.scenario_id = @scenario_id
            `);
        return result.recordset;
    }

//add course
    static async addCourse(scenario_id, course_id, expected_grade) {
        const pool = await poolPromise;
        // Upsert: if course already in scenario, update grade
        const existing = await pool.request()
            .input('scenario_id', sql.Int, scenario_id)
            .input('course_id', sql.Int, course_id)
            .query(`
                SELECT 1 FROM ScenarioCourses
                WHERE scenario_id = @scenario_id AND course_id = @course_id
            `);

        if (existing.recordset.length > 0) {
            await pool.request()
                .input('scenario_id', sql.Int, scenario_id)
                .input('course_id', sql.Int, course_id)
                .input('expected_grade', sql.VarChar(2), expected_grade)
                .query(`
                    UPDATE ScenarioCourses
                    SET expected_grade = @expected_grade
                    WHERE scenario_id = @scenario_id AND course_id = @course_id
                `);
            return { updated: true };
        }

        await pool.request()
            .input('scenario_id', sql.Int, scenario_id)
            .input('course_id', sql.Int, course_id)
            .input('expected_grade', sql.VarChar(2), expected_grade)
            .query(`
                INSERT INTO ScenarioCourses (scenario_id, course_id, expected_grade)
                VALUES (@scenario_id, @course_id, @expected_grade)
            `);
        return { updated: false };
    }
//remove course
    static async removeCourse(scenario_id, course_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('scenario_id', sql.Int, scenario_id)
            .input('course_id', sql.Int, course_id)
            .query(`
                DELETE FROM ScenarioCourses
                WHERE scenario_id = @scenario_id AND course_id = @course_id
            `);
        return result.rowsAffected[0] > 0;
    }

//project gpa
    static async getProjection(scenario_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('scenario_id', sql.Int, scenario_id)
            .query(`
                SELECT
                    gs.scenario_name,
                    ROUND(
                        SUM(c.credit_hours * gp.grade_points) / SUM(c.credit_hours),
                        2
                    ) AS projected_gpa,
                    COUNT(sc.course_id)  AS course_count,
                    SUM(c.credit_hours)  AS total_credit_hours
                FROM GPAScenarios gs
                JOIN ScenarioCourses sc ON gs.scenario_id   = sc.scenario_id
                JOIN Courses         c  ON sc.course_id     = c.course_id
                JOIN GradePoints     gp ON sc.expected_grade = gp.letter_grade
                WHERE gs.scenario_id = @scenario_id
                GROUP BY gs.scenario_name
            `);
        return result.recordset[0] || null;
    }
}

module.exports = GPAScenario;