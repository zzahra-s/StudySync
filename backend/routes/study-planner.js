const express = require('express');
const router = express.Router();

const dummyPlanner = [
  { id: '1', title: 'Review chapter 5 notes', status: 'Pending' },
  { id: '2', title: 'Plan study blocks for math', status: 'Completed' }
];

router.get('/study-planner', (req, res) => {
  res.json(dummyPlanner);
});

router.post('/study-planner', (req, res) => {
  res.json({ message: 'Study-plan item created', data: req.body });
});

router.put('/study-planner/:id', (req, res) => {
  res.json({ message: `Study-plan item ${req.params.id} updated`, data: req.body });
});

router.delete('/study-planner/:id', (req, res) => {
  res.json({ message: `Study-plan item ${req.params.id} deleted` });
});

module.exports = router;
