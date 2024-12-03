import { body } from 'express-validator';
import { RegisterSource, VerifyType, VerifyBusinessType } from '../types/auth/auth.types';

export const verificationValidator = [
  body('recipient')
    .notEmpty()
    .withMessage('Recipient is required')
    .custom((value, { req }) => {
      const type = req.body.type as VerifyType;
      if (type === VerifyType.SMS) {
        return /^\+?[1-9]\d{1,14}$/.test(value) || 
          'Invalid phone number format';
      }
      if (type === VerifyType.EMAIL) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 
          'Invalid email format';
      }
      return true;
    }),
  body('type')
    .isIn(Object.values(VerifyType))
    .withMessage('Invalid verification type'),
  body('purpose')
    .isIn(Object.values(VerifyBusinessType))
    .withMessage('Invalid verification purpose')
];

export const registerValidator = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .custom((value, { req }) => {
      const source = req.body.register_source;
      if (source === RegisterSource.PHONE) {
        return /^\+?[1-9]\d{1,14}$/.test(value) || 
          'Invalid phone number format';
      }
      if (source === RegisterSource.EMAIL) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 
          'Invalid email format';
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('code')
    .notEmpty()
    .withMessage('Verification code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits'),
  body('register_source')
    .isIn(Object.values(RegisterSource))
    .withMessage('Invalid register source')
];

// 密码登录验证器
export const loginValidator = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// 验证码登录验证器
export const loginWithCodeValidator = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  body('code')
    .notEmpty()
    .withMessage('Verification code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits')
];