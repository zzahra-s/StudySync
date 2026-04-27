const express = require('express');
const router = express.Router();

const dummyHours = [
  { id: '1', date: '2025-05-10', hours: 2, subject: 'Math' },
  { id: '2', date: '2025-05-11', hours: 1.5, subject: 'English' }
];

router.get('/study-hours', (req, res) => {
  res.json(dummyHours);
});

router.post('/study-hours', (req, res) => {
  res.json({ message: 'Study hours logged', data: req.body });
});

router.put('/study-hours/:id', (req, res) => {
  res.json({ message: `Study hours ${req.params.id} updated`, data: req.body });
});

router.delete('/study-hours/:id', (req, res) => {
  res.json({ message: `Study hours ${req.params.id} deleted` });
});

module.exports = router;
