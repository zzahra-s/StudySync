const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { full_name, roll_number, email, password } = req.body;
        if (!full_name || !roll_number || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await Student.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student_id = await Student.create({
            full_name,
            roll_number,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: 'Student registered successfully',
            student_id,
        });
    } catch (error) {
        console.error('Register error:', error);
        // Handle unique constraint violation (duplicate roll_number or email)
        if (error.number === 2627 || error.number === 2601) {
            return res.status(400).json({ message: 'Email or roll number already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find student
        const student = await Student.findByEmail(email);
        if (!student) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password. Support legacy plain-text seeded rows too.
        let isValidPassword = false;
        if (student.password && (student.password.startsWith('$2a$') || student.password.startsWith('$2b$') || student.password.startsWith('$2y$'))) {
            isValidPassword = await bcrypt.compare(password, student.password);
        } else {
            isValidPassword = password === student.password;
        }
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: student.student_id, email: student.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            student: {
                student_id: student.student_id,
                full_name: student.full_name,
                roll_number: student.roll_number,
                email: student.email,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login };
