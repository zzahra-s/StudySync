
const Report = require('../models/Report');

//GET /api/students/:studentId/course-grades 
const getCourseGrades = async (req, res) => {
    try {
        const student_id = parseInt(req.params.studentId);
        if (req.user.id !== student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const grades = await Report.getCourseGrades(student_id);
        res.json(grades);
    } catch (error) {
        console.error('Get course grades error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//GET /api/students/:studentId/courses-per-semester
const getCoursesPerSemester = async (req, res) => {
    try {
        const student_id = parseInt(req.params.studentId);
        if (req.user.id !== student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const data = await Report.getCoursesPerSemester(student_id);
        res.json(data);
    } catch (error) {
        console.error('Get courses per semester error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//GET /api/students/:studentId/incomplete-courses
const getIncompleteCourses = async (req, res) => {
    try {
        const student_id = parseInt(req.params.studentId);
        if (req.user.id !== student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const courses = await Report.getIncompleteCourses(student_id);
        res.json(courses);
    } catch (error) {
        console.error('Get incomplete courses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getCourseGrades, getCoursesPerSemester, getIncompleteCourses };