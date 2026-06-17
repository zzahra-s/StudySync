const { TargetCGPAPlanModel, calculatePlan } = require('../models/TargetCGPAPlan');
const GPA = require('../models/GPA');

class TargetCGPAController {

  // POST /api/students/:studentId/target-cgpa-plan
  // Body: { targetCGPA, remainingCredits, remainingSemesters, completedCredits,
  //         distributionMethod, semesters (optional array) }
  static async savePlan(req, res) {
    try {
      const studentId = parseInt(req.params.studentId, 10);

      // Auth guard: student can only save their own plan
      if (req.user.id !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const {
        targetCGPA,
        remainingCredits,
        remainingSemesters,
        completedCredits,   // frontend sends this; we also try fetching from DB
        distributionMethod = 'equal',
        semesters = []
      } = req.body;

      // ── Validation ─────────────────────────────────────────────
      if (targetCGPA === undefined || targetCGPA === null)
        return res.status(400).json({ message: 'targetCGPA is required' });
      if (remainingCredits === undefined || remainingCredits === null || remainingCredits <= 0)
        return res.status(400).json({ message: 'remainingCredits must be a positive number' });
      if (remainingSemesters === undefined || remainingSemesters === null || remainingSemesters <= 0)
        return res.status(400).json({ message: 'remainingSemesters must be a positive number' });
      if (parseFloat(targetCGPA) < 0 || parseFloat(targetCGPA) > 4.0)
        return res.status(400).json({ message: 'targetCGPA must be between 0 and 4.0' });

      if (distributionMethod === 'custom' && semesters.length > 0) {
        const total = semesters.reduce((sum, s) => sum + parseInt(s.credits, 10), 0);
        if (total !== parseInt(remainingCredits, 10)) {
          return res.status(400).json({
            message: `Sum of custom semester credits (${total}) must equal remaining credits (${remainingCredits})`
          });
        }
      }

      // ── Fetch live CGPA data from the DB ───────────────────────
      let currentCGPA = parseFloat(completedCredits !== undefined ? 0 : 0);
      let liveCompletedCredits = completedCredits !== undefined ? parseInt(completedCredits, 10) : 0;

      try {
        const cgpaData = await GPA.getCGPA(studentId);
        if (cgpaData && cgpaData.cgpa !== null) {
          currentCGPA = parseFloat(cgpaData.cgpa);
          liveCompletedCredits = parseFloat(cgpaData.total_credit_hours) || liveCompletedCredits;
        }
      } catch (e) {
        // If no graded courses yet, user must provide current CGPA manually
        if (req.body.currentCGPA !== undefined) {
          currentCGPA = parseFloat(req.body.currentCGPA);
        }
      }

      // If user explicitly passes currentCGPA, honour it (override DB lookup)
      if (req.body.currentCGPA !== undefined && req.body.currentCGPA !== null) {
        currentCGPA = parseFloat(req.body.currentCGPA);
      }

      const totalDegreeCredits = (liveCompletedCredits + parseInt(remainingCredits, 10));

      // ── Run corrected calculation ───────────────────────────────
      const calc = calculatePlan(
        currentCGPA,
        liveCompletedCredits,
        parseFloat(targetCGPA),
        parseInt(remainingCredits, 10),
        parseInt(remainingSemesters, 10),
        distributionMethod === 'custom' ? semesters : []
      );

      // ── Persist to DB ──────────────────────────────────────────
      const planId = await TargetCGPAPlanModel.upsert(
        studentId,
        {
          currentCGPA,
          targetCGPA:          parseFloat(targetCGPA),
          remainingCredits:    parseInt(remainingCredits, 10),
          remainingSemesters:  parseInt(remainingSemesters, 10),
          totalDegreeCredits,
          distributionMethod,
          isAchievable:        calc.achievable,
          requiredSGPA:        calc.requiredSGPA,
          maxPossibleCGPA:     calc.maxPossible
        },
        calc.semesters
      );

      return res.status(201).json({
        success: true,
        planId,
        currentCGPA,
        completedCredits: liveCompletedCredits,
        ...calc
      });

    } catch (error) {
      console.error('TargetCGPA savePlan error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // GET /api/students/:studentId/target-cgpa-plan
  static async getStudentPlans(req, res) {
    try {
      const studentId = parseInt(req.params.studentId, 10);

      if (req.user.id !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const plan = await TargetCGPAPlanModel.findByStudent(studentId);
      if (!plan) {
        return res.status(200).json({ success: true, plan: null, message: 'No plan found' });
      }

      return res.status(200).json({ success: true, plan });

    } catch (error) {
      console.error('TargetCGPA getStudentPlans error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // DELETE /api/students/:studentId/target-cgpa-plan
  static async deletePlan(req, res) {
    try {
      const studentId = parseInt(req.params.studentId, 10);
      if (req.user.id !== studentId) return res.status(403).json({ message: 'Access denied' });

      const deleted = await TargetCGPAPlanModel.deleteByStudent(studentId);
      if (!deleted) return res.status(404).json({ message: 'No plan found to delete' });

      return res.status(200).json({ success: true, message: 'Plan deleted successfully' });

    } catch (error) {
      console.error('TargetCGPA deletePlan error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // GET /api/cgpa/calculate — stateless quick calculation (no DB save)
  static async quickCalculate(req, res) {
    try {
      const {
        currentCGPA, completedCredits, targetCGPA,
        remainingCredits, remainingSemesters, semesters
      } = req.body;

      const calc = calculatePlan(
        parseFloat(currentCGPA),
        parseInt(completedCredits, 10),
        parseFloat(targetCGPA),
        parseInt(remainingCredits, 10),
        parseInt(remainingSemesters, 10),
        semesters || []
      );

      return res.status(200).json(calc);
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = TargetCGPAController;
