const taskProgressModel = require('../models/TaskProgressModel');

const getTaskProgress = async (req, res) => {
  try {
    const progress = await taskProgressModel.getTaskProgress(req.params.studentId);
    return res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Task progress controller failed while trying to fetch progress:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

module.exports = {
  getTaskProgress,
};
