const { sql, poolPromise } = require('../config/database');

// ─────────────────────────────────────────────────────────────────
// Pure calculation utility (no I/O)
// ─────────────────────────────────────────────────────────────────
function calculatePlan(currentCGPA, completedCredits, targetCGPA, remainingCredits, remainingSemesters, customSemesters = []) {
  const totalCredits = completedCredits + remainingCredits;

  // Edge cases
  if (remainingCredits <= 0) {
    return {
      achievable: true,
      requiredSGPA: currentCGPA,
      maxPossible: currentCGPA,
      semesters: [],
      message: `No remaining credits. Your current CGPA of ${currentCGPA.toFixed(2)} is your final CGPA.`
    };
  }
  if (remainingSemesters <= 0) {
    return {
      achievable: true,
      requiredSGPA: currentCGPA,
      maxPossible: currentCGPA,
      semesters: [],
      message: `No remaining semesters. Your current CGPA of ${currentCGPA.toFixed(2)} is your final CGPA.`
    };
  }

  // Core formula
  const requiredSGPA = (targetCGPA * totalCredits - currentCGPA * completedCredits) / remainingCredits;
  const maxPossible = (currentCGPA * completedCredits + 4.0 * remainingCredits) / totalCredits;

  if (requiredSGPA > 4.0) {
    return {
      achievable: false,
      requiredSGPA: null,
      maxPossible: parseFloat(maxPossible.toFixed(2)),
      semesters: [],
      message: `Target CGPA of ${targetCGPA.toFixed(2)} is unachievable. Maximum possible CGPA is ${maxPossible.toFixed(2)}. Please lower your target.`
    };
  }

  const sgpaRounded = parseFloat(requiredSGPA.toFixed(2));

  // Build semester breakdown — same SGPA for all semesters
  let semesters;
  if (customSemesters && customSemesters.length > 0) {
    semesters = customSemesters.map((s, i) => ({
      name: s.name || `Semester ${i + 1}`,
      credits: parseInt(s.credits, 10),
      requiredSGPA: sgpaRounded
    }));
  } else {
    const creditsPerSem = parseFloat((remainingCredits / remainingSemesters).toFixed(1));
    semesters = Array.from({ length: remainingSemesters }, (_, i) => ({
      name: `Semester ${i + 1}`,
      credits: creditsPerSem,
      requiredSGPA: sgpaRounded
    }));
  }

  return {
    achievable: true,
    requiredSGPA: sgpaRounded,
    maxPossible: parseFloat(maxPossible.toFixed(2)),
    semesters,
    message: `Score approximately ${sgpaRounded.toFixed(2)} SGPA each semester to reach your target CGPA of ${targetCGPA.toFixed(2)}.`
  };
}

// ─────────────────────────────────────────────────────────────────
// DB Model
// ─────────────────────────────────────────────────────────────────
class TargetCGPAPlanModel {

  static async upsert(studentId, planData, semesterRows = []) {
    const pool = await poolPromise;
    const {
      currentCGPA, targetCGPA, remainingCredits, remainingSemesters,
      totalDegreeCredits, distributionMethod, isAchievable, requiredSGPA, maxPossibleCGPA
    } = planData;

    // Check if plan already exists for this student
    const existing = await pool.request()
      .input('student_id', sql.Int, studentId)
      .query('SELECT plan_id FROM TargetCGPAPlan WHERE student_id = @student_id');

    let planId;

    if (existing.recordset.length > 0) {
      // UPDATE
      planId = existing.recordset[0].plan_id;
      await pool.request()
        .input('plan_id',             sql.Int,          planId)
        .input('current_cgpa',        sql.Decimal(4,2), currentCGPA)
        .input('target_cgpa',         sql.Decimal(4,2), targetCGPA)
        .input('remaining_credits',   sql.Int,          remainingCredits)
        .input('remaining_semesters', sql.Int,          remainingSemesters)
        .input('total_degree_credits',sql.Int,          totalDegreeCredits || 120)
        .input('distribution_method', sql.VarChar(20),  distributionMethod || 'equal')
        .input('is_achievable',       sql.Bit,          isAchievable ? 1 : 0)
        .input('required_sgpa',       sql.Decimal(4,2), requiredSGPA ?? null)
        .input('max_possible_cgpa',   sql.Decimal(4,2), maxPossibleCGPA ?? null)
        .query(`
          UPDATE TargetCGPAPlan SET
            current_cgpa         = @current_cgpa,
            target_cgpa          = @target_cgpa,
            remaining_credits    = @remaining_credits,
            remaining_semesters  = @remaining_semesters,
            total_degree_credits = @total_degree_credits,
            distribution_method  = @distribution_method,
            is_achievable        = @is_achievable,
            required_sgpa        = @required_sgpa,
            max_possible_cgpa    = @max_possible_cgpa,
            updated_at           = GETDATE()
          WHERE plan_id = @plan_id
        `);
    } else {
      // INSERT
      const ins = await pool.request()
        .input('student_id',          sql.Int,          studentId)
        .input('current_cgpa',        sql.Decimal(4,2), currentCGPA)
        .input('target_cgpa',         sql.Decimal(4,2), targetCGPA)
        .input('remaining_credits',   sql.Int,          remainingCredits)
        .input('remaining_semesters', sql.Int,          remainingSemesters)
        .input('total_degree_credits',sql.Int,          totalDegreeCredits || 120)
        .input('distribution_method', sql.VarChar(20),  distributionMethod || 'equal')
        .input('is_achievable',       sql.Bit,          isAchievable ? 1 : 0)
        .input('required_sgpa',       sql.Decimal(4,2), requiredSGPA ?? null)
        .input('max_possible_cgpa',   sql.Decimal(4,2), maxPossibleCGPA ?? null)
        .query(`
          INSERT INTO TargetCGPAPlan
            (student_id, current_cgpa, target_cgpa, remaining_credits, remaining_semesters,
             total_degree_credits, distribution_method, is_achievable, required_sgpa,
             max_possible_cgpa, created_at, updated_at)
          OUTPUT INSERTED.plan_id
          VALUES
            (@student_id, @current_cgpa, @target_cgpa, @remaining_credits, @remaining_semesters,
             @total_degree_credits, @distribution_method, @is_achievable, @required_sgpa,
             @max_possible_cgpa, GETDATE(), GETDATE())
        `);
      planId = ins.recordset[0].plan_id;
    }

    // Replace semester rows
    await pool.request()
      .input('plan_id', sql.Int, planId)
      .query('DELETE FROM TargetCGPASemesters WHERE plan_id = @plan_id');

    for (let i = 0; i < semesterRows.length; i++) {
      const s = semesterRows[i];
      await pool.request()
        .input('plan_id',         sql.Int,         planId)
        .input('semester_number', sql.Int,         i + 1)
        .input('semester_name',   sql.VarChar(100),s.name)
        .input('credits',         sql.Int,         parseInt(s.credits, 10))
        .input('required_sgpa',   sql.Decimal(4,2),s.requiredSGPA)
        .input('is_achievable',   sql.Bit,         s.requiredSGPA <= 4.0 ? 1 : 0)
        .query(`
          INSERT INTO TargetCGPASemesters
            (plan_id, semester_number, semester_name, credits, required_sgpa, is_achievable)
          VALUES
            (@plan_id, @semester_number, @semester_name, @credits, @required_sgpa, @is_achievable)
        `);
    }

    return planId;
  }

  static async findByStudent(studentId) {
    const pool = await poolPromise;
    const planResult = await pool.request()
      .input('student_id', sql.Int, studentId)
      .query(`
        SELECT TOP 1 * FROM TargetCGPAPlan
        WHERE student_id = @student_id
        ORDER BY updated_at DESC
      `);

    if (planResult.recordset.length === 0) return null;
    const plan = planResult.recordset[0];

    const semResult = await pool.request()
      .input('plan_id', sql.Int, plan.plan_id)
      .query(`
        SELECT * FROM TargetCGPASemesters
        WHERE plan_id = @plan_id
        ORDER BY semester_number
      `);

    plan.semesters = semResult.recordset;
    return plan;
  }

  static async deleteByStudent(studentId) {
    const pool = await poolPromise;
    // Cascade via FK will remove semesters automatically if set up,
    // otherwise delete semesters first
    const planResult = await pool.request()
      .input('student_id', sql.Int, studentId)
      .query('SELECT plan_id FROM TargetCGPAPlan WHERE student_id = @student_id');

    if (planResult.recordset.length === 0) return false;

    const planId = planResult.recordset[0].plan_id;
    await pool.request()
      .input('plan_id', sql.Int, planId)
      .query('DELETE FROM TargetCGPASemesters WHERE plan_id = @plan_id');
    await pool.request()
      .input('plan_id', sql.Int, planId)
      .query('DELETE FROM TargetCGPAPlan WHERE plan_id = @plan_id');

    return true;
  }
}

module.exports = { TargetCGPAPlanModel, calculatePlan };
