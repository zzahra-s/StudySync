const deadlineModel = require('../models/DeadlineModel');
const taskProgressModel = require('../models/TaskProgressModel');
const { authenticateToken } = require('../middleware/auth');

const getDeadlinesByCourse = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const deadlines = await deadlineModel.getDeadlinesByCourse(courseId);
    return res.json({ success: true, data: deadlines });
  } catch (error) {
    console.error('getDeadlinesByCourse error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch deadlines by course' });
  }
};

const getDeadlinesByStudent = async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      upcoming: req.query.upcoming === 'true',
      overdue: req.query.overdue === 'true'
    };
    const deadlines = await deadlineModel.getDeadlinesByStudent(studentId, filters);
    return res.json({ success: true, data: deadlines });
  } catch (error) {
    console.error('getDeadlinesByStudent error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch deadlines by student' });
  }
};

const createDeadline = async (req, res) => {
  try {
    const { course_id, title, due_date, status, priority, allocated_study_hours } = req.body;
    const newDeadline = await deadlineModel.createDeadline({
      courseId: Number(course_id),
      title,
      dueDate: due_date,
      status,
      priority,
      allocatedStudyHours: allocated_study_hours !== undefined ? parseFloat(allocated_study_hours) : 0
    });
    return res.status(201).json({ success: true, data: newDeadline });
  } catch (error) {
    console.error('createDeadline error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create deadline' });
  }
};

const updateDeadline = async (req, res) => {
  try {
    const deadlineId = Number(req.params.id);
    const { title, due_date, status, priority, allocated_study_hours } = req.body;
    const result = await deadlineModel.updateDeadline(deadlineId, {
      title,
      dueDate: due_date,
      status,
      priority,
      allocatedStudyHours: allocated_study_hours !== undefined ? parseFloat(allocated_study_hours) : undefined
    });
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Deadline not found or no change' });
    }
    return res.json({ success: true, data: 'Deadline updated successfully' });
  } catch (error) {
    console.error('updateDeadline error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update deadline' });
  }
};

const deleteDeadline = async (req, res) => {
  try {
    const deadlineId = Number(req.params.id);
    const result = await deadlineModel.deleteDeadline(deadlineId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Deadline not found' });
    }
    return res.json({ success: true, data: 'Deadline deleted successfully' });
  } catch (error) {
    console.error('deleteDeadline error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete deadline' });
  }
};

const getStudyPlanner = async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }
    const planner = await taskProgressModel.getStudyPlanner(studentId);
    res.json({ success: true, data: planner });
  } catch (error) {
    console.error('getStudyPlanner error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch study planner' });
  }
};

module.exports = {
  getDeadlinesByCourse,
  getDeadlinesByStudent,
  createDeadline,
  updateDeadline,
  deleteDeadline,
  getStudyPlanner
};

