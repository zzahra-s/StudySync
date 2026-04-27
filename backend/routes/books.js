const express = require('express');
const router = express.Router();

const dummyBooks = [
  { id: '1', title: 'StudySync Guide', author: 'StudySync Team' },
  { id: '2', title: 'Exam Prep Handbook', author: 'Academic Success' }
];

router.get('/books', (req, res) => {
  res.json(dummyBooks);
});

router.post('/books', (req, res) => {
  res.json({ message: 'Book added', data: req.body });
});

router.put('/books/:id', (req, res) => {
  res.json({ message: `Book ${req.params.id} updated`, data: req.body });
});

router.delete('/books/:id', (req, res) => {
  res.json({ message: `Book ${req.params.id} deleted` });
});

module.exports = router;
