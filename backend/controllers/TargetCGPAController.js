const db = require('../config/Database');

class TargetCGPAController {
  // Save a new Target CGPA plan
  static async savePlan(req, res) {
    try {
      const { studentId } = req.params;
      const {
        currentCGPA,
        targetCGPA,
        remainingCredits,
        remainingSemesters,
        totalDegreeCredits,
        distributionMethod,
        isAchievable,
        requiredSGPA,
        maxPossibleCGPA,
        semesters
      } = req.body;

      // Validate required fields
      if (
        !studentId ||
        currentCGPA === undefined ||
        targetCGPA === undefined ||
        remainingCredits === undefined ||
        remainingSemesters === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const query = `
        INSERT INTO TargetCGPAPlan (
          student_id,
          current_cgpa,
          target_cgpa,
          remaining_credits,
          remaining_semesters,
          total_degree_credits,
          distribution_method,
          is_achievable,
          required_sgpa,
          max_possible_cgpa
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        SELECT SCOPE_IDENTITY() as plan_id;
      `;

      const params = [
        studentId,
        currentCGPA,
        targetCGPA,
        remainingCredits,
        remainingSemesters,
        totalDegreeCredits || 120,
        distributionMethod || 'equal',
        isAchievable ? 1 : 0,
        requiredSGPA || null,
        maxPossibleCGPA || null
      ];

      const result = await db.query(query, params);
      const planId = result.recordset[0].plan_id;

      // If custom distribution, save semester data
      if (semesters && semesters.length > 0) {
        for (let i = 0; i < semesters.length; i++) {
          const sem = semesters[i];
          const semQuery = `
            INSERT INTO TargetCGPASemesters (
              plan_id,
              semester_number,
              semester_name,
              credits,
              required_sgpa,
              is_achievable
            )
            VALUES (?, ?, ?, ?, ?, ?);
          `;

          const semParams = [
            planId,
            i + 1,
            sem.name,
            sem.credits,
            parseFloat(sem.requiredSGPA),
            sem.achievable ? 1 : 0
          ];

          await db.query(semQuery, semParams);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Target CGPA plan saved successfully',
        planId: planId
      });
    } catch (error) {
      console.error('Error saving Target CGPA plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving plan',
        error: error.message
      });
    }
  }

  // Get all plans for a student
  static async getStudentPlans(req, res) {
    try {
      const { studentId } = req.params;

      const query = `
        SELECT TOP 1
          plan_id,
          student_id,
          current_cgpa,
          target_cgpa,
          remaining_credits,
          remaining_semesters,
          total_degree_credits,
          distribution_method,
          is_achievable,
          required_sgpa,
          max_possible_cgpa,
          created_at,
          updated_at
        FROM TargetCGPAPlan
        WHERE student_id = ?
        ORDER BY created_at DESC;
      `;

      const result = await db.query(query, [studentId]);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: true,
          message: 'No plans found',
          plan: null
        });
      }

      const plan = result.recordset[0];

      // If custom distribution, fetch semester data
      if (plan.distribution_method === 'custom') {
        const semQuery = `
          SELECT
            semester_number,
            semester_name,
            credits,
            required_sgpa,
            is_achievable
          FROM TargetCGPASemesters
          WHERE plan_id = ?
          ORDER BY semester_number;
        `;

        const semResult = await db.query(semQuery, [plan.plan_id]);
        plan.semesters = semResult.recordset;
      }

      res.status(200).json({
        success: true,
        plan: plan
      });
    } catch (error) {
      console.error('Error fetching Target CGPA plans:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching plans',
        error: error.message
      });
    }
  }

  // Get specific plan by ID
  static async getPlanById(req, res) {
    try {
      const { planId } = req.params;

      const query = `
        SELECT
          plan_id,
          student_id,
          current_cgpa,
          target_cgpa,
          remaining_credits,
          remaining_semesters,
          total_degree_credits,
          distribution_method,
          is_achievable,
          required_sgpa,
          max_possible_cgpa,
          created_at,
          updated_at
        FROM TargetCGPAPlan
        WHERE plan_id = ?;
      `;

      const result = await db.query(query, [planId]);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }

      const plan = result.recordset[0];

      // If custom distribution, fetch semester data
      if (plan.distribution_method === 'custom') {
        const semQuery = `
          SELECT
            semester_number,
            semester_name,
            credits,
            required_sgpa,
            is_achievable
          FROM TargetCGPASemesters
          WHERE plan_id = ?
          ORDER BY semester_number;
        `;

        const semResult = await db.query(semQuery, [planId]);
        plan.semesters = semResult.recordset;
      }

      res.status(200).json({
        success: true,
        plan: plan
      });
    } catch (error) {
      console.error('Error fetching Target CGPA plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching plan',
        error: error.message
      });
    }
  }

  // Update existing plan
  static async updatePlan(req, res) {
    try {
      const { planId } = req.params;
      const {
        currentCGPA,
        targetCGPA,
        remainingCredits,
        remainingSemesters,
        totalDegreeCredits,
        isAchievable,
        requiredSGPA,
        maxPossibleCGPA,
        semesters
      } = req.body;

      const query = `
        UPDATE TargetCGPAPlan
        SET
          current_cgpa = ?,
          target_cgpa = ?,
          remaining_credits = ?,
          remaining_semesters = ?,
          total_degree_credits = ?,
          is_achievable = ?,
          required_sgpa = ?,
          max_possible_cgpa = ?,
          updated_at = GETDATE()
        WHERE plan_id = ?;
      `;

      const params = [
        currentCGPA,
        targetCGPA,
        remainingCredits,
        remainingSemesters,
        totalDegreeCredits || 120,
        isAchievable ? 1 : 0,
        requiredSGPA || null,
        maxPossibleCGPA || null,
        planId
      ];

      await db.query(query, params);

      // Delete existing semester data if updating
      if (semesters && semesters.length > 0) {
        await db.query('DELETE FROM TargetCGPASemesters WHERE plan_id = ?', [planId]);

        // Insert new semester data
        for (let i = 0; i < semesters.length; i++) {
          const sem = semesters[i];
          const semQuery = `
            INSERT INTO TargetCGPASemesters (
              plan_id,
              semester_number,
              semester_name,
              credits,
              required_sgpa,
              is_achievable
            )
            VALUES (?, ?, ?, ?, ?, ?);
          `;

          const semParams = [
            planId,
            i + 1,
            sem.name,
            sem.credits,
            parseFloat(sem.requiredSGPA),
            sem.achievable ? 1 : 0
          ];

          await db.query(semQuery, semParams);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Plan updated successfully'
      });
    } catch (error) {
      console.error('Error updating Target CGPA plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating plan',
        error: error.message
      });
    }
  }

  // Delete plan
  static async deletePlan(req, res) {
    try {
      const { planId } = req.params;

      const query = 'DELETE FROM TargetCGPAPlan WHERE plan_id = ?';
      await db.query(query, [planId]);

      res.status(200).json({
        success: true,
        message: 'Plan deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting Target CGPA plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting plan',
        error: error.message
      });
    }
  }
}

module.exports = TargetCGPAController;
