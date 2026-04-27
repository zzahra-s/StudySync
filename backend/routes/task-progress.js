const express = require('express');
const router = express.Router();

const dummyProgress = [
  { id: '1', task: 'Finish project outline', progress: '50%' },
  { id: '2', task: 'Complete practice quiz', progress: '100%' }
];

router.get('/task-progress', (req, res) => {
  res.json(dummyProgress);
});

router.post('/task-progress', (req, res) => {
  res.json({ message: 'Task progress added', data: req.body });
});

router.put('/task-progress/:id', (req, res) => {
  res.json({ message: `Task progress ${req.params.id} updated`, data: req.body });
});

router.delete('/task-progress/:id', (req, res) => {
  res.json({ message: `Task progress ${req.params.id} deleted` });
});

module.exports = router;
