import { Router } from 'express';
import { AigcDetectionController } from '../controllers/detection/aigc.controller';
import { AigcFileDetectionController } from '../controllers/detection/file-detection.controller';
import { AigcDetectionService } from '../services/detection/aigc.service';
import { AigcFileDetectionService } from '../services/aigc/file-detection.service';
import { validateRequest } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { detectionValidator } from '../validators/detection.validator';
import { fileDetectionValidator } from '../validators/file-detection.validator';
import { logger } from '../utils/logger';

const router = Router();

// Initialize services
const aigcService = new AigcDetectionService();
const aigcFileService = new AigcFileDetectionService();

// Initialize controllers
const aigcController = new AigcDetectionController(aigcService);
const fileDetectionController = new AigcFileDetectionController(aigcFileService);

// Log middleware
router.use((req, res, next) => {
  logger.info('Detection route accessed', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Text detection routes (existing)
router.post(
  '/text',
  detectionValidator.detectText,
  validateRequest,
  aigcController.detectText
);

// File detection routes (new)
router.post(
  '/file/signature',
  authMiddleware,
  fileDetectionValidator.getSignature,
  validateRequest,
  fileDetectionController.getUploadSignature
);

router.post(
  '/file/parse',
  authMiddleware,
  fileDetectionValidator.parseDocument,
  validateRequest,
  fileDetectionController.parseDocument
);

router.post(
  '/file/submit',
  authMiddleware,
  fileDetectionValidator.submitDetection,
  validateRequest,
  fileDetectionController.submitDetection
);

router.post(
  '/file/query',
  authMiddleware,
  fileDetectionValidator.queryResults,
  validateRequest,
  fileDetectionController.queryResults
);

router.post(
  '/task/list',
  authMiddleware,
  fileDetectionValidator.getHistory,
  validateRequest,
  fileDetectionController.getDetectionHistory
);

export const detectionRoutes = router;