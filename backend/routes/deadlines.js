const express = require('express');
const router = express.Router();

const dummyDeadlines = [
  {
    id: '1',
    studentId: '1',
    title: 'Algebra I Final Review',
    course: 'Algebra I',
    dueDate: '2025-05-12',
    status: 'Pending'
  },
  {
    id: '2',
    studentId: '1',
    title: 'History Essay',
    course: 'World History',
    dueDate: '2025-05-14',
    status: 'Overdue'
  },
  {
    id: '3',
    studentId: '1',
    title: 'Biology Lab Report',
    course: 'Biology',
    dueDate: '2025-05-18',
    status: 'Completed'
  }
];

router.get('/students/:studentId/deadlines', (req, res) => {
  const { studentId } = req.params;
  const { status } = req.query;
  let results = dummyDeadlines.filter(item => item.studentId === studentId);

  if (status) {
    results = results.filter(item => item.status.toLowerCase() === status.toLowerCase());
  }

  res.json(results);
});

router.post('/deadlines', (req, res) => {
  res.json({ message: 'Deadline created', data: req.body });
});

router.put('/deadlines/:id', (req, res) => {
  res.json({ message: `Deadline ${req.params.id} updated`, data: req.body });
});

router.delete('/deadlines/:id', (req, res) => {
  res.json({ message: `Deadline ${req.params.id} deleted` });
});

module.exports = router;
