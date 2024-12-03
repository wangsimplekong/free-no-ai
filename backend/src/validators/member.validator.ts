import { body } from 'express-validator';
import { QuotaType } from '../types/member.types';

export const memberValidator = {
  subscribe: [
    body('userId')
      .notEmpty()
      .withMessage('User ID is required'),
    body('plan_id')
      .isUUID()
      .withMessage('Invalid plan ID'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer'),
    body('auto_renew')
      .isBoolean()
      .withMessage('Auto renew must be a boolean')
  ],

  consumeQuota: [
    body('userId')
      .notEmpty()
      .withMessage('User ID is required'),
    body('quota_type')
      .isIn(Object.values(QuotaType))
      .withMessage('Invalid quota type'),
    body('amount')
      .isInt({ min: 1 })
      .withMessage('Amount must be a positive integer')
  ],

  updateAutoRenew: [
    body('userId')
      .notEmpty()
      .withMessage('User ID is required'),
    body('auto_renew')
      .isBoolean()
      .withMessage('Auto renew must be a boolean')
  ]
};