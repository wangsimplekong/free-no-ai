import { Router } from 'express';
import { OrderController } from '../controllers/order/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { orderValidator } from '../validators/order.validator';

const router = Router();

// Initialize controller
const orderController = new OrderController();

// Order routes
router.post(
  '/create',
  authMiddleware,
  orderValidator.createOrder,
  validateRequest,
  orderController.createOrder
);

router.get(
  '/list',
  authMiddleware,
  orderValidator.getOrders,
  validateRequest,
  orderController.getOrders
);

router.get(
  '/detail/:orderId',
  authMiddleware,
  orderValidator.getOrderDetail,
  validateRequest,
  orderController.getOrderDetail
);

export const orderRoutes = router;