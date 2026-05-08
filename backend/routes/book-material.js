const express = require('express');
const { getBooksByCourse } = require('../controllers/BookMaterialController');

const router = express.Router();

router.get('/courses/:courseId/book-materials', getBooksByCourse);

module.exports = router;
