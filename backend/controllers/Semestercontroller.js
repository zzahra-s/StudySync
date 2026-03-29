const Semester = require('../models/Semester');

const getStudentSemesters = async (req, res) => {
    try {
        const student_id = parseInt(req.params.studentId);

        if (req.user.id !== student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const semesters = await Semester.findByStudentId(student_id);
        res.json(semesters);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
        res.status(500).json({ message: 'Server error' });
    }
};

const createSemester = async (req, res) => {
    try {
        const { student_id, semester_name, start_date, end_date } = req.body;

        if (!student_id || !semester_name) {
            return res.status(400).json({ message: 'student_id and semester_name are required' });
        }

        if (req.user.id !== parseInt(student_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const semester_id = await Semester.create({
            student_id,
            semester_name,
            start_date: start_date || null,
            end_date: end_date || null,
        });

        res.status(201).json({
            message: 'Semester created successfully',
            semester_id,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
        // Unique constraint: (student_id, semester_name)
        if (error.number === 2627 || error.number === 2601) {
            return res.status(400).json({ message: 'Semester name already exists for this student' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

const updateSemester = async (req, res) => {
    try {
        const semester_id = parseInt(req.params.id);
        const { semester_name, start_date, end_date } = req.body;

        const semester = await Semester.findById(semester_id);
        if (!semester) {
            return res.status(404).json({ message: 'Semester not found' });
        }

        if (req.user.id !== semester.student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (!semester_name) {
            return res.status(400).json({ message: 'semester_name is required' });
        }

        const updated = await Semester.update(semester_id, { semester_name, start_date, end_date });

        if (updated) {
            res.json({ message: 'Semester updated successfully' });
        } else {
            res.status(404).json({ message: 'Semester not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteSemester = async (req, res) => {
    try {
        const semester_id = parseInt(req.params.id);

        const semester = await Semester.findById(semester_id);
        if (!semester) {
            return res.status(404).json({ message: 'Semester not found' });
        }

        if (req.user.id !== semester.student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const deleted = await Semester.delete(semester_id);

        if (deleted) {
            res.json({ message: 'Semester deleted successfully' });
        } else {
            res.status(404).json({ message: 'Semester not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getStudentSemesters, createSemester, updateSemester, deleteSemester };