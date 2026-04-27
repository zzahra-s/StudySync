const express = require('express');
const router = express.Router();

const dummyMaterials = [
  { id: '1', title: 'Chapter 3 notes', type: 'Notes' },
  { id: '2', title: 'Practice exam', type: 'Worksheet' }
];

router.get('/materials', (req, res) => {
  res.json(dummyMaterials);
});

router.post('/materials', (req, res) => {
  res.json({ message: 'Material added', data: req.body });
});

router.put('/materials/:id', (req, res) => {
  res.json({ message: `Material ${req.params.id} updated`, data: req.body });
});

router.delete('/materials/:id', (req, res) => {
  res.json({ message: `Material ${req.params.id} deleted` });
});

module.exports = router;
