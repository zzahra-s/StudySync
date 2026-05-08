const Grade = require('../models/Grade');
const Course = require('../models/Course');

const addOrUpdateGrade = async (req, res) => {
    try {
        const course_id = parseInt(req.params.courseId);
        const { letter_grade, comments } = req.body;

        if (!letter_grade) {
            return res.status(400).json({ message: 'letter_grade is required' });
        }

        // Verify course exists and belongs to this student
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (req.user.id !== course.student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await Grade.createOrUpdate({ course_id, letter_grade, comments });

        res.json({
            message: result.updated ? 'Grade updated successfully' : 'Grade added successfully',
            grade_id: result.id,
        });
    } catch (error) {
        console.error('Add/update grade error:', error);
        // FK violation,invalid letter_grade not in GradePoints table
        if (error.number === 547) {
            return res.status(400).json({ message: 'Invalid letter grade. Must be one of: A, A-, B+, B, B-, C+, C, F' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

const getCourseGrade = async (req, res) => {
    try {
        const course_id = parseInt(req.params.courseId);
        // Verify course belongs to the student
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (req.user.id !== course.student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const grade = await Grade.findByCourseId(course_id);
        if (!grade) {
            return res.status(404).json({ message: 'No grade recorded for this course yet' });
        }

        res.json(grade);
    } catch (error) {
        console.error('Get grade error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateGrade = async (req, res) => {
    try {
        const grade_id = parseInt(req.params.id);
        const { letter_grade, comments } = req.body;

        if (!letter_grade) {
            return res.status(400).json({ message: 'letter_grade is required' });
        }

        const updated = await Grade.update(grade_id, { letter_grade, comments });

        if (updated) {
            res.json({ message: 'Grade updated successfully' });
        } else {
            res.status(404).json({ message: 'Grade not found' });
        }
    } catch (error) {
        console.error('Update grade error:', error);
        if (error.number === 547) {
            return res.status(400).json({ message: 'Invalid letter grade. Must be one of: A, A-, B+, B, B-, C+, C, F' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

const getGradePoints = async (req, res) => {
    try {
        const gradePoints = await Grade.getGradePoints();
        res.json(gradePoints);
    } catch (error) {
        console.error('Get grade points error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addOrUpdateGrade, getCourseGrade, updateGrade, getGradePoints };