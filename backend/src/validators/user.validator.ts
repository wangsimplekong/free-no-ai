import { body } from 'express-validator';

export const userValidator = {
  updateProfile: [
    body('nickname')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('昵称长度必须在1-50个字符之间'),
    body('avatar')
      .optional()
      .isString()
      .trim()
      .isURL()
      .withMessage('头像必须是有效的URL地址')
  ],

  updatePassword: [
    body('newPassword')
      .notEmpty()
      .withMessage('新密码不能为空')
      .isString()
      .withMessage('新密码必须是字符串')
      .isLength({ min: 6 })
      .withMessage('新密码长度必须至少为6个字符'),
    body('username')
      .notEmpty()
      .withMessage('用户名不能为空')
      .isString()
      .withMessage('用户名必须是字符串')
  ]
};