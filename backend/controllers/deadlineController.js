const deadlineModel = require('../models/DeadlineModel');

const handleServerError = (res, error, action) => {
  console.error(`Deadline controller failed while trying to ${action}:`, error);
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

const getDeadlinesByCourse = async (req, res) => {
  try {
    const deadlines = await deadlineModel.getDeadlinesByCourse(req.params.courseId);
    return res.json({
      success: true,
      data: deadlines,
    });
  } catch (error) {
    return handleServerError(res, error, 'fetch deadlines by course');
  }
};

const getDeadlinesByStudent = async (req, res) => {
  try {
    const deadlines = await deadlineModel.getDeadlinesByStudent(req.params.studentId, {
      status: req.query.status,
      priority: req.query.priority,
      upcoming: req.query.upcoming,
      overdue: req.query.overdue,
    });

    return res.json({
      success: true,
      data: deadlines,
    });
  } catch (error) {
    return handleServerError(res, error, 'fetch deadlines by student');
  }
};

const createDeadline = async (req, res) => {
  try {
    const deadline = await deadlineModel.createDeadline(req.body);
    return res.status(201).json({
      success: true,
      data: deadline,
    });
  } catch (error) {
    return handleServerError(res, error, 'create a deadline');
  }
};

const updateDeadline = async (req, res) => {
  try {
    const updatedDeadline = await deadlineModel.updateDeadline(req.params.id, req.body);

    if (!updatedDeadline) {
      return res.status(404).json({
        success: false,
        error: 'Deadline not found',
      });
    }

    return res.json({
      success: true,
      data: updatedDeadline,
    });
  } catch (error) {
    return handleServerError(res, error, 'update a deadline');
  }
};

const deleteDeadline = async (req, res) => {
  try {
    const deleted = await deadlineModel.deleteDeadline(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Deadline not found',
      });
    }

    return res.json({
      success: true,
      data: {
        message: 'Deadline deleted successfully',
      },
    });
  } catch (error) {
    return handleServerError(res, error, 'delete a deadline');
  }
};

const getStudyPlanner = async (req, res) => {
  try {
    const planner = await deadlineModel.getStudyPlanner(req.params.studentId);
    return res.json({
      success: true,
      data: planner,
    });
  } catch (error) {
    return handleServerError(res, error, 'fetch the study planner');
  }
};

const getStudyHoursByCourse = async (req, res) => {
  try {
    const studyHours = await deadlineModel.getStudyHoursPerCourse(req.params.studentId);
    return res.json({
      success: true,
      data: studyHours,
    });
  } catch (error) {
    return handleServerError(res, error, 'fetch study hours');
  }
};

const getTopCoursesByStudyHours = async (req, res) => {
  try {
    const topCourses = await deadlineModel.getTopCoursesByStudyHours(req.params.studentId);
    return res.json({
      success: true,
      data: topCourses,
    });
  } catch (error) {
    return handleServerError(res, error, 'fetch top courses by study hours');
  }
};

module.exports = {
  getDeadlinesByCourse,
  getDeadlinesByStudent,
  createDeadline,
  updateDeadline,
  deleteDeadline,
  getStudyPlanner,
  getStudyHoursByCourse,
  getTopCoursesByStudyHours,
};
