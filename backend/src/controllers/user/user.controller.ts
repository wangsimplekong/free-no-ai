import { Request, Response } from 'express';
import { UserService } from '../../services/user/user.service';
import { VerificationService } from '../../services/verification/verification.service';
import { logger } from '../../utils/logger';
import { successResponse, errorResponse } from '../../utils/response.util';
import { UpdateProfileDTO } from '../../dto/user/user.dto';
import { VerifyType, VerifyBusinessType } from '../../types/auth/auth.types';

export class UserController {
  constructor(
    private userService: UserService,
    private verificationService: VerificationService
  ) {}

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const profileData: UpdateProfileDTO = {
        nickname: req.body.nickname,
        avatarUrl: req.body.avatar
      };

      const updatedUser = await this.userService.updateProfile(userId, profileData);

      res.json(successResponse(updatedUser, '个人信息更新成功'));
    } catch (error) {
      logger.error('Failed to update profile:', error);
      res.status(400).json(errorResponse(
        error instanceof Error ? error.message : '个人信息更新失败'
      ));
    }
  }

  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { newPassword, username } = req.body;

      // Update password
      await this.userService.updatePassword(userId, newPassword);

      // Clear verification code cache
      await this.verificationService.clearVerificationCode(
        username,
        VerifyType.SMS,
        VerifyBusinessType.RESET_PASSWORD
      );

      res.json(successResponse(null, '密码更新成功'));
    } catch (error) {
      logger.error('Failed to update password:', error);
      res.status(400).json(errorResponse(
        error instanceof Error ? error.message : '密码更新失败'
      ));
    }
  }
}