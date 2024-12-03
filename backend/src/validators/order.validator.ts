import { body, query } from 'express-validator';
import { PayType } from '../types/order.types';

export const orderValidator = {
  createOrder: [
    body('plan_id')
      .isUUID()
      .withMessage('Invalid plan ID'),
    body('pay_type')
      .isIn(Object.values(PayType))
      .withMessage('Invalid payment type')
  ],

  getOrders: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('pageSize')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Page size must be between 1 and 100'),
    query('status')
      .optional()
      .isInt()
      .withMessage('Invalid status'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format')
  ]
};