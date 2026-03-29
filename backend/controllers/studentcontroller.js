const Student = require('../models/Student');

const getProfile = async (req, res) => {
    try {
        // Use param ID if provided, otherwise the logged-in user's ID
        const student_id = parseInt(req.params.id) || req.user.id;

        // Only allow viewing own profile
        if (req.user.id !== student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const student = await Student.findById(student_id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const student_id = parseInt(req.params.id);

        if (req.user.id !== student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { full_name, email } = req.body;
        if (!full_name || !email) {
            return res.status(400).json({ message: 'full_name and email are required' });
        }

        const updated = await Student.update(student_id, { full_name, email });
        if (!updated) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
        if (error.number === 2627 || error.number === 2601) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getProfile, updateProfile };