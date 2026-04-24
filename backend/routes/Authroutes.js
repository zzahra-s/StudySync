const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

//post/api/auth/register
router.post('/register', register);

//post/api/auth/login
router.post('/login', login);

module.exports = router;
