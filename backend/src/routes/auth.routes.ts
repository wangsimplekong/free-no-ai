import { Router } from 'express';
import { AuthController } from '../controllers/auth/auth.controller';
import { AuthService } from '../services/auth/auth.service';
import { TokenService } from '../services/auth/token.service';
import { UserRepository } from '../repositories/auth/user.repository';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { registerValidator, loginValidator, loginWithCodeValidator } from '../validators/auth.validator';
import { verificationValidator } from '../validators/verification.validator';
import { logger } from '../utils/logger';
import { VerificationService } from '../services/verification/verification.service';

const router = Router();

// Initialize dependencies
const userRepository = new UserRepository();
const tokenService = new TokenService();
const verificationService = new VerificationService();
const authService = new AuthService(userRepository, tokenService, verificationService);
const authController = new AuthController(authService, verificationService);

// Log middleware for auth routes
router.use((req, res, next) => {
  logger.info('Auth route accessed', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  next();
});

// Verification routes
router.post(
  '/verification/send',
  verificationValidator.sendVerification,
  validateRequest,
  authController.sendVerification
);

// Auth routes
router.post(
  '/register',
  registerValidator,
  validateRequest,
  authController.register
);

router.post(
  '/login',
  loginValidator,
  validateRequest,
  authController.login
);

router.post(
  '/loginWithCode',
  loginWithCodeValidator,
  validateRequest,
  authController.loginWithCode
);

// Logout route - requires authentication
router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

export const authRoutes = router;