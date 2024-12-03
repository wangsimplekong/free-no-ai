import { Router } from 'express';
import { PaymentController } from '../controllers/payment/payment.controller';
import { PaymentService } from '../services/payment/payment.service';
import { validateRequest } from '../middlewares/validate.middleware';
import { paymentValidator } from '../validators/payment.validator';

const router = Router();

// Initialize services and controller
const paymentService = new PaymentService();
const paymentController = new PaymentController(paymentService);

// Create payment
router.post(
  '/create',
  paymentValidator.createPayment,
  validateRequest,
  (req, res) => paymentController.createPayment(req, res)
);

// Payment callback
router.post(
  '/notify',
  paymentValidator.paymentCallback,
  validateRequest,
  (req, res) => paymentController.handleCallback(req, res)
);

// Get payment status
router.get(
  '/:orderNo/status',
  paymentValidator.getStatus,
  validateRequest,
  (req, res) => paymentController.getPaymentStatus(req, res)
);

// Refresh payment URL
router.post(
  '/:orderId/refresh',
  paymentValidator.refreshUrl,
  validateRequest,
  (req, res) => paymentController.refreshPaymentUrl(req, res)
);

// Complete payment
router.post(
  '/complete',
  paymentValidator.completePayment,
  validateRequest,
  (req, res) => paymentController.completePayment(req, res)
);

export const paymentRoutes = router;