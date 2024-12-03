import { Router } from 'express';
import memberController from '../controllers/member/member.controller';
import { MemberPlanController } from '../controllers/member/plan.controller';
import { MemberPlanService } from '../services/member/plan.service';
import { validateRequest } from '../middlewares/validate.middleware';
import { memberValidator } from '../validators/member.validator';
import { logger } from '../utils/logger';

const router = Router();

// Initialize services and controllers
const memberPlanService = new MemberPlanService();
const memberPlanController = new MemberPlanController(memberPlanService);

// Log middleware for member routes
router.use((req, res, next) => {
  logger.info('Member route accessed', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  next();
});

// Member plan routes
router.get('/plans', memberPlanController.getPlans);

// Member subscription
router.post(
  '/subscribe',
  memberValidator.subscribe,
  validateRequest,
  memberController.subscribe.bind(memberController)
);

// Quota status
router.get(
  '/quota',
  memberController.getQuotaStatus.bind(memberController)
);

// Consume quota
router.post(
  '/quota/consume',
  memberValidator.consumeQuota,
  validateRequest,
  memberController.consumeQuota.bind(memberController)
);

// Member status
router.get(
  '/status',
  memberController.getMemberStatus.bind(memberController)
);

// Update auto renew
router.post(
  '/renew',
  memberValidator.updateAutoRenew,
  validateRequest,
  memberController.updateAutoRenew.bind(memberController)
);

export const memberRoutes = router;