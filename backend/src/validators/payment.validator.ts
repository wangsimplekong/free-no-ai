import { body, param } from 'express-validator';

export const paymentValidator = {
  createPayment: [
    body('orderNo').notEmpty().withMessage('订单号不能为空'),
    body('orderId').notEmpty().withMessage('订单ID不能为空'),
    body('subject').notEmpty().withMessage('订单标题不能为空'),
    body('body').notEmpty().withMessage('订单描述不能为空'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('订单金额必须大于0'),
    body('userId').notEmpty().withMessage('用户ID不能为空')
  ],

  paymentCallback: [
    body('order_id').notEmpty().withMessage('订单号不能为空'),
    body('trade_no').notEmpty().withMessage('交易号不能为空'),
    body('pay_status')
      .isIn(['0', '-1'])
      .withMessage('无效的交易状态'),
    body('sign').notEmpty().withMessage('签名不能为空')
  ],

  getStatus: [
    param('orderNo').notEmpty().withMessage('订单号不能为空')
  ],

  refreshUrl: [
    param('orderId').notEmpty().withMessage('订单ID不能为空')
  ],

  completePayment: [
    body('orderId')
      .notEmpty()
      .withMessage('订单ID不能为空')
  ]
};