import { Router } from 'express';
import { BenefitsController } from '../controllers/benefits/benefits.controller';
import { BenefitsService } from '../services/benefits/benefits.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// Initialize dependencies
const benefitsService = new BenefitsService();
const benefitsController = new BenefitsController(benefitsService);

// Log middleware
router.use((req, res, next) => {
  logger.info('Benefits route accessed', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Benefits routes
router.get(
  '/user',
  authMiddleware,
  benefitsController.getUserBenefits.bind(benefitsController)
);

export const benefitsRoutes = router;