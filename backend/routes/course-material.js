const express = require('express');
const {
  getWeightagesByCourse,
  updateWeightagesByCourse
} = require('../controllers/CourseMaterialController');

const router = express.Router();

router.get('/courses/:courseId/course-material', getWeightagesByCourse);
router.put('/courses/:courseId/course-material', updateWeightagesByCourse);

module.exports = router;
