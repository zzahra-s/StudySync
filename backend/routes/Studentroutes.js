const express = require('express');
const { getProfile, updateProfile } = require('../controllers/studentcontroller');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/students/profile  — own profile from JWT
router.get('/profile', authenticateToken, getProfile);

// GET /api/students/:id
router.get('/:id', authenticateToken, getProfile);

// PUT /api/students/:id
router.put('/:id', authenticateToken, updateProfile);

module.exports = router;