const express = require('express');
const {
  getTasksByCourse,
  addTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/TaskManagerController');

const router = express.Router();

router.get('/students/:studentId/task-manager', getTasksByCourse);
router.post('/task-manager', addTask);
router.put('/task-manager/:id/status', updateTaskStatus);
router.delete('/task-manager/:id', deleteTask);

module.exports = router;
