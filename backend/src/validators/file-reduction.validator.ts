import { body } from 'express-validator';
import { ReduceTaskStatus } from '../types/file-reduction.types';

export const fileReductionValidator = {
  getHistory: [
    body('userId')
      .notEmpty()
      .withMessage('User ID is required')
      .isString()
      .withMessage('User ID must be a string'),
    body('pageNum')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page number must be a positive integer'),
    body('pageSize')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Page size must be between 1 and 100'),
    body('startTime')
      .optional()
      .isISO8601()
      .withMessage('Start time must be a valid ISO 8601 date'),
    body('endTime')
      .optional()
      .isISO8601()
      .withMessage('End time must be a valid ISO 8601 date'),
    body('status')
      .optional()
      .isInt()
      .isIn([-1, 0, 1, 2, 3])
      .withMessage('Invalid status value')
  ],

  submitReduction: [
    body('taskId')
      .notEmpty()
      .withMessage('Task ID is required')
      .isString()
      .withMessage('Task ID must be a string'),
    body('userId')
      .notEmpty()
      .withMessage('User ID is required')
      .isString()
      .withMessage('User ID must be a string'),
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isString()
      .withMessage('Title must be a string')
      .isLength({ max: 255 })
      .withMessage('Title must be less than 255 characters'),
    body('wordCount')
      .notEmpty()
      .withMessage('Word count is required')
      .isInt({ min: 1 })
      .withMessage('Word count must be a positive integer')
  ],

  queryResults: [
    body('taskIds')
      .notEmpty()
      .withMessage('Task IDs are required')
      .isArray()
      .withMessage('Task IDs must be an array')
      .custom((value) => value.length > 0)
      .withMessage('At least one task ID is required')
  ]
};