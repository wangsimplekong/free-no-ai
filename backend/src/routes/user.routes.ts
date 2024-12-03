import { Router } from 'express';
import { UserController } from '../controllers/user/user.controller';
import { UserService } from '../services/user/user.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { userValidator } from '../validators/user.validator';

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

// Profile update route
router.post(
  '/profile',
  authMiddleware,
  userValidator.updateProfile,
  validateRequest,
  userController.updateProfile.bind(userController)
);

// Password update route
router.post(
  '/password',
  authMiddleware,
  userValidator.updatePassword,
  validateRequest,
  userController.updatePassword.bind(userController)
);

export const userRoutes = router;