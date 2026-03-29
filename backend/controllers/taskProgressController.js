const taskProgressModel = require('../models/TaskProgressModel');

const getTaskProgress = async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }
    
    const progress = await taskProgressModel.getTaskProgress(studentId);
    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('getTaskProgress error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch task progress' });
  }
};

const getStudyPlanner = async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }
    
    // Use student deadlines with pending filter (study planner = pending deadlines sorted by due date)
    const { getDeadlinesByStudent } = require('../models/DeadlineModel');
    const filters = { status: 'Pending' };
    const planner = await getDeadlinesByStudent(studentId, filters);
    
    res.json({ success: true, data: planner });
  } catch (error) {
    console.error('getStudyPlanner error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch study planner' });
  }
};

const getStudyHoursByCourse = async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }
    
    const hours = await taskProgressModel.getStudyHoursByCourse(studentId);
    res.json({ success: true, data: hours });
  } catch (error) {
    console.error('getStudyHoursByCourse error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch study hours' });
  }
};

const getTopCoursesByStudyHours = async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }
    
    const topCourses = await taskProgressModel.getTopCoursesByStudyHours(studentId);
    res.json({ success: true, data: topCourses });
  } catch (error) {
    console.error('getTopCoursesByStudyHours error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top courses' });
  }
};

module.exports = {
  getTaskProgress,
  getStudyPlanner,
  getStudyHoursByCourse,
  getTopCoursesByStudyHours
};

