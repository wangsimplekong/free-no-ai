import { body, query } from 'express-validator';
import { VerifyType } from '../models/verification.model';

const VERIFICATION_TYPES = ['SMS', 'EMAIL', 'WECHAT'] as const;
type VerificationType = typeof VERIFICATION_TYPES[number];

export const verificationValidator = {
  sendVerification: [
    body('recipient')
      .notEmpty()
      .withMessage('Recipient is required')
      .custom((value, { req }) => {
        const type = req.body.type as VerificationType;
        if (type === 'SMS') {
          return /^\+?[1-9]\d{1,14}$/.test(value) || 
            'Invalid phone number format';
        }
        if (type === 'EMAIL') {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 
            'Invalid email format';
        }
        return true;
      }),
    body('type')
      .isIn(VERIFICATION_TYPES)
      .withMessage('Invalid verification type'),
    body('purpose')
      .isIn(Object.values(VerifyType))
      .withMessage('Invalid verification purpose'),
    body('userId')
      .optional()
      .isUUID()
      .withMessage('Invalid user ID format')
  ],

  verifyCode: [
    body('verificationId')
      .notEmpty()
      .withMessage('Verification ID is required')
      .isInt()
      .withMessage('Invalid verification ID format'),
    body('code')
      .notEmpty()
      .withMessage('Verification code is required')
      .isString()
      .withMessage('Code must be a string')
      .isLength({ min: 6, max: 6 })
      .withMessage('Code must be 6 characters long'),
    body('type')
      .isIn(VERIFICATION_TYPES)
      .withMessage('Invalid verification type'),
    body('verifyType')
      .isIn(Object.values(VerifyType))
      .withMessage('Invalid verify type')
  ],

  wechatCallback: [
    query('code')
      .notEmpty()
      .withMessage('Authorization code is required'),
    query('state')
      .notEmpty()
      .withMessage('State parameter is required')
      .isUUID()
      .withMessage('Invalid state format'),
    body('verificationId')
      .notEmpty()
      .withMessage('Verification ID is required')
      .isInt()
      .withMessage('Invalid verification ID format')
  ],

  requireVerification: [
    body('verificationId')
      .notEmpty()
      .withMessage('Verification ID is required')
      .isInt()
      .withMessage('Invalid verification ID format'),
    body('verificationType')
      .isIn(VERIFICATION_TYPES)
      .withMessage('Invalid verification type'),
    body('verifyType')
      .optional()
      .isIn(Object.values(VerifyType))
      .withMessage('Invalid verify type')
  ],

  optionalVerification: [
    body('verificationId')
      .optional()
      .isInt()
      .withMessage('Invalid verification ID format'),
    body('verificationType')
      .optional()
      .isIn(VERIFICATION_TYPES)
      .withMessage('Invalid verification type'),
    body('verifyType')
      .optional()
      .isIn(Object.values(VerifyType))
      .withMessage('Invalid verify type')
  ]
};