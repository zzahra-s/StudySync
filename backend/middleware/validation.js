const { body, param, query, validationResult } = require('express-validator');

const deadlineStatuses = ['Pending', 'Completed'];
const deadlinePriorities = ['High', 'Medium', 'Low'];

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    success: false,
    error: 'Validation failed',
    details: errors.array().map((item) => ({
      field: item.path,
      message: item.msg,
    })),
  });
};

const requireAtLeastOneField = (fields, message) =>
  body().custom((value, { req }) => fields.some((field) => req.body[field] !== undefined)).withMessage(message);

const validateCourseIdParam = [
  param('courseId').toInt().isInt({ min: 1 }).withMessage('Course ID must be a positive integer'),
];

const validateStudentIdParam = [
  param('studentId').toInt().isInt({ min: 1 }).withMessage('Student ID must be a positive integer'),
];

const validateDeadlineIdParam = [
  param('id').toInt().isInt({ min: 1 }).withMessage('Deadline ID must be a positive integer'),
];

const validateMaterialIdParam = [
  param('id').toInt().isInt({ min: 1 }).withMessage('Material ID must be a positive integer'),
];

const validateBookIdParam = [
  param('id').toInt().isInt({ min: 1 }).withMessage('Book ID must be a positive integer'),
];

const validateDeadlineFilters = [
  query('status')
    .optional()
    .trim()
    .isIn(deadlineStatuses)
    .withMessage('Status must be Pending or Completed'),
  query('priority')
    .optional()
    .trim()
    .isIn(deadlinePriorities)
    .withMessage('Priority must be High, Medium, or Low'),
  query('upcoming')
    .optional()
    .isBoolean()
    .withMessage('Upcoming must be true or false')
    .toBoolean(),
  query('overdue')
    .optional()
    .isBoolean()
    .withMessage('Overdue must be true or false')
    .toBoolean(),
  query().custom((value, { req }) => {
    if (req.query.upcoming === true && req.query.overdue === true) {
      throw new Error('Upcoming and overdue filters cannot both be true');
    }

    return true;
  }),
];

const validateDeadline = [
  body('course_id').toInt().isInt({ min: 1 }).withMessage('Course ID must be a positive integer'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Title must be between 1 and 150 characters')
    .escape(),
  body('due_date')
    .trim()
    .custom((value) => !Number.isNaN(Date.parse(value)))
    .withMessage('due_date must be a valid date or date-time'),
  body('status')
    .optional()
    .trim()
    .isIn(deadlineStatuses)
    .withMessage('Status must be Pending or Completed'),
  body('priority')
    .optional()
    .trim()
    .isIn(deadlinePriorities)
    .withMessage('Priority must be High, Medium, or Low'),
  body('allocated_study_hours')
    .optional()
    .toFloat()
    .isFloat({ min: 0, max: 999.9 })
    .withMessage('Allocated study hours must be between 0 and 999.9'),
];

const validateDeadlineUpdate = [
  ...validateDeadlineIdParam,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Title must be between 1 and 150 characters')
    .escape(),
  body('due_date')
    .optional()
    .trim()
    .custom((value) => !Number.isNaN(Date.parse(value)))
    .withMessage('due_date must be a valid date or date-time'),
  body('status')
    .optional()
    .trim()
    .isIn(deadlineStatuses)
    .withMessage('Status must be Pending or Completed'),
  body('priority')
    .optional()
    .trim()
    .isIn(deadlinePriorities)
    .withMessage('Priority must be High, Medium, or Low'),
  body('allocated_study_hours')
    .optional()
    .toFloat()
    .isFloat({ min: 0, max: 999.9 })
    .withMessage('Allocated study hours must be between 0 and 999.9'),
  body('course_id')
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  requireAtLeastOneField(
    ['title', 'due_date', 'status', 'priority', 'allocated_study_hours', 'course_id'],
    'Provide at least one deadline field to update'
  ),
];

const validateMaterial = [
  body('course_id').toInt().isInt({ min: 1 }).withMessage('Course ID must be a positive integer'),
  body('material_name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Material name must be between 1 and 255 characters')
    .escape(),
  body('file_path')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('File path cannot exceed 500 characters'),
];

const validateBook = [
  body('course_id').toInt().isInt({ min: 1 }).withMessage('Course ID must be a positive integer'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters')
    .escape(),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Author must be between 1 and 200 characters')
    .escape(),
  body('isbn')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('ISBN must be between 1 and 20 characters'),
];

const validateBookUpdate = [
  ...validateBookIdParam,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters')
    .escape(),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Author must be between 1 and 200 characters')
    .escape(),
  body('isbn')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('ISBN must be between 1 and 20 characters'),
  body('course_id')
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  requireAtLeastOneField(
    ['title', 'author', 'isbn', 'course_id'],
    'Provide at least one book field to update'
  ),
];

const validateSearch = [
  query('q')
    .notEmpty()
    .withMessage('Query parameter q is required (example: /api/books/search?q=database)')
    .bail()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
];

module.exports = {
  validateRequest,
  validateCourseIdParam,
  validateStudentIdParam,
  validateDeadlineIdParam,
  validateMaterialIdParam,
  validateBookIdParam,
  validateDeadlineFilters,
  validateDeadline,
  validateDeadlineUpdate,
  validateMaterial,
  validateBook,
  validateBookUpdate,
  validateSearch,
};
