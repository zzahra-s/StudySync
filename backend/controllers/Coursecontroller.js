const Course = require('../models/Course');
const Semester = require('../models/Semester');

const getSemesterCourses = async (req, res) => {
    try {
        const semester_id = parseInt(req.params.semesterId);

        const semester = await Semester.findById(semester_id);
        if (!semester) {
            return res.status(404).json({ message: 'Semester not found' });
        }

        if (req.user.id !== semester.student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const courses = await Course.findBySemesterId(semester_id);
        res.json(courses);
    } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
        res.status(500).json({ message: 'Server error' });
    }
};

const createCourse = async (req, res) => {
    try {
        const { semester_id, course_code, course_name, credit_hours, instructor_name } = req.body;

        if (!semester_id || !course_code || !course_name || !credit_hours) {
            return res.status(400).json({ message: 'semester_id, course_code, course_name, and credit_hours are required' });
        }

        const semester = await Semester.findById(semester_id);
        if (!semester) {
            return res.status(404).json({ message: 'Semester not found' });
        }

        if (req.user.id !== semester.student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const course_id = await Course.create({
            semester_id,
            course_code,
            course_name,
            credit_hours,
            instructor_name,
        });

        res.status(201).json({
            message: 'Course created successfully',
            course_id,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
        // Unique constraint: (semester_id, course_code)
        if (error.number === 2627 || error.number === 2601) {
            return res.status(400).json({ message: 'Course code already exists in this semester' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

const updateCourse = async (req, res) => {
    try {
        const course_id = parseInt(req.params.id);
        const { course_code, course_name, credit_hours, instructor_name } = req.body;

        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (req.user.id !== course.student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (!course_code || !course_name || !credit_hours) {
            return res.status(400).json({ message: 'course_code, course_name, and credit_hours are required' });
        }

        const updated = await Course.update(course_id, { course_code, course_name, credit_hours, instructor_name });

        if (updated) {
            res.json({ message: 'Course updated successfully' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const course_id = parseInt(req.params.id);

        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (req.user.id !== course.student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const deleted = await Course.delete(course_id);

        if (deleted) {
            res.json({ message: 'Course deleted successfully' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllCoursesWithGrades = async (req, res) => {
    try {
        const student_id = parseInt(req.params.studentId);

        if (req.user.id !== student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const courses = await Course.getCoursesWithGrades(student_id);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getSemesterCourses, createCourse, updateCourse, deleteCourse, getAllCoursesWithGrades };