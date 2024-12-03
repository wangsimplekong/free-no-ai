import { Router } from 'express';
import { AigcFileReductionController } from '../controllers/reduction/file-reduction.controller';
import { AigcFileReductionService } from '../services/aigc/file-reduction.service';
import { validateRequest } from '../middlewares/validate.middleware';
import { fileReductionValidator } from '../validators/file-reduction.validator';
import { logger } from '../utils/logger';

const router = Router();

// Initialize services and controllers
const reductionService = new AigcFileReductionService();
const reductionController = new AigcFileReductionController(reductionService);

// Log middleware
router.use((req, res, next) => {
  logger.info('Reduction route accessed', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// File reduction routes
router.post(
  '/task/list',
  fileReductionValidator.getHistory,
  validateRequest,
  reductionController.getReductionHistory
);

router.post(
  '/submit',
  fileReductionValidator.submitReduction,
  validateRequest,
  reductionController.submitReduction
);

router.post(
  '/query',
  fileReductionValidator.queryResults,
  validateRequest,
  reductionController.queryResults
);

export const reductionRoutes = router;