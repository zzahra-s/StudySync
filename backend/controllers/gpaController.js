
const GPA = require('../models/GPA');

//GET /api/students/:studentId/cgpa
const getCGPA = async (req, res) => {
    try {
        const student_id = parseInt(req.params.studentId);

        // A student can only see their own cgpa
        if (req.user.id !== student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const data = await GPA.getCGPA(student_id);

        if (!data) {
            // Student exists but has no graded courses yet
            return res.json({
                full_name: null,
                cgpa: null,
                graded_courses: 0,
                total_credit_hours: 0,
                message: 'No graded courses found. Add grades to calculate CGPA.',
            });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// GET /api/students/:studentId/semester-gpa 
const getSemesterGPA = async (req, res) => {
    try {
        const student_id = parseInt(req.params.studentId);

        if (req.user.id !== student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const data = await GPA.getSemesterGPA(student_id);

        if (data.length === 0) {
            return res.json({
                semesters: [],
                message: 'No graded semesters found.',
            });
        }

        res.json({ semesters: data });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

//GET /api/admin/average-gpa 
const getAverageGPA = async (req, res) => {
    try {
        const data = await GPA.getOverallAverageCGPA();
        res.json(data);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = { getCGPA, getSemesterGPA, getAverageGPA };