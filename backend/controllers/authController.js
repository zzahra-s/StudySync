const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { full_name, roll_number, email, password } = req.body;

    if (!full_name || !roll_number || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await Student.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student_id = await Student.create({
      full_name,
      roll_number,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student_id,
    });
  } catch (error) {
    if (error.number === 2627 || error.number === 2601) {
      return res.status(400).json({ success: false, message: 'Email or roll number already exists' });
    }

    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const student = await Student.findByEmail(email);
    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const storedPassword = student.password || '';
    const looksHashed = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');
    const isValidPassword = looksHashed
      ? await bcrypt.compare(password, storedPassword)
      : password === storedPassword;

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: student.student_id, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
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
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login };
