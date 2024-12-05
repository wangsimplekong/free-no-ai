import { Router } from 'express';
import { AigcReduceController } from '../controllers/aigc/reduce.controller';
import { AigcReduceService } from '../services/aigc/reduce.service';
import { validateRequest } from '../middlewares/validate.middleware';
import { aigcValidator } from '../validators/aigc.validator';
import { authMiddleware } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// Initialize dependencies
const aigcService = new AigcReduceService();
const aigcController = new AigcReduceController(aigcService);

// Log middleware for AIGC routes
router.use((req, res, next) => {
  logger.info('AIGC route accessed', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// AIGC routes
router.post(
  '/reduce/text',
  authMiddleware,
  aigcValidator.reduceText,
  validateRequest,
  aigcController.reduceText
);

export const aigcRoutes = router;