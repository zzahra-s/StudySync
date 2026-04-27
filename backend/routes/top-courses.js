const express = require('express');
const router = express.Router();

const dummyTopCourses = [
  { id: '1', course: 'Calculus', grade: 'A' },
  { id: '2', course: 'Physics', grade: 'A-' }
];

router.get('/top-courses', (req, res) => {
  res.json(dummyTopCourses);
});

router.post('/top-courses', (req, res) => {
  res.json({ message: 'Top course added', data: req.body });
});

router.put('/top-courses/:id', (req, res) => {
  res.json({ message: `Top course ${req.params.id} updated`, data: req.body });
});

router.delete('/top-courses/:id', (req, res) => {
  res.json({ message: `Top course ${req.params.id} deleted` });
});

module.exports = router;
