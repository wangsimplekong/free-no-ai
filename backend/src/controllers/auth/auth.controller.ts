import { Request, Response } from 'express';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterDTO, LoginDTO, LoginWithCodeDTO } from '../../dto/auth/auth.dto';
import { logger } from '../../utils/logger';
import { successResponse, errorResponse } from '../../utils/response.util';
import { v4 as uuidv4 } from 'uuid';
import { VerificationService } from '../../services/verification/verification.service';
import { VerifyType, VerifyBusinessType } from '../../types/auth/auth.types';

export class AuthController {
  constructor(
    private authService: AuthService,
    private verificationService: VerificationService
  ) {}

  public sendVerification = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      logger.info('Verification code request received', {
        requestId,
        recipient: req.body.recipient,
        type: req.body.type,
        purpose: req.body.purpose,
        ip: req.ip
      });

      const result = await this.verificationService.sendVerificationCode(
        req.body.recipient,
        req.body.type as VerifyType,
        req.body.purpose as VerifyBusinessType
      );

      logger.info('Verification code sent successfully', {
        requestId,
        recipient: req.body.recipient
      });

      res.status(200).json(successResponse({
        success: result
      }, 'Verification code sent'));
    } catch (error) {
      logger.error('Failed to send verification code', {
        requestId,
        error,
        recipient: req.body.recipient
      });

      const message = error instanceof Error ? error.message : 'Failed to send verification code';
      res.status(400).json(errorResponse(message));
    }
  };

  public register = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      logger.info('Registration attempt', {
        requestId,
        context: 'AuthController.register',
        username: req.body.username,
        registerSource: req.body.register_source,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      const registerDto: RegisterDTO = {
        username: req.body.username,
        password: req.body.password,
        code: req.body.code,
        registerSource: req.body.register_source,
        registerIp: req.ip,
        registerDevice: req.headers['user-agent']
      };

      const result = await this.authService.register(registerDto);

      logger.info('Registration successful', {
        requestId,
        context: 'AuthController.register',
        userId: result.user.id
      });

      res.status(201).json(successResponse(result, 'Registration successful'));
    } catch (error) {
      logger.error('Registration failed', {
        requestId,
        context: 'AuthController.register',
        error,
        request: {
          username: req.body.username,
          registerSource: req.body.register_source,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      });

      res.status(400).json(errorResponse(
        error instanceof Error ? error.message : 'Registration failed'
      ));
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      logger.info('Login attempt', {
        requestId,
        context: 'AuthController.login',
        username: req.body.username,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      const loginDto: LoginDTO = {
        username: req.body.username,
        password: req.body.password,
        loginIp: req.ip,
        loginDevice: req.headers['user-agent']
      };

      const result = await this.authService.login(loginDto);

      logger.info('Login successful', {
        requestId,
        context: 'AuthController.login',
        userId: result.user.id
      });

      res.status(200).json(successResponse(result, 'Login successful'));
    } catch (error) {
      logger.error('Login failed', {
        requestId,
        context: 'AuthController.login',
        error,
        request: {
          username: req.body.username,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      });

      res.status(400).json(errorResponse(
        error instanceof Error ? error.message : 'Login failed'
      ));
    }
  };

  public loginWithCode = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      logger.info('Code login attempt', {
        requestId,
        context: 'AuthController.loginWithCode',
        username: req.body.username,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      const loginDto: LoginWithCodeDTO = {
        username: req.body.username,
        code: req.body.code,
        loginIp: req.ip,
        loginDevice: req.headers['user-agent']
      };

      const result = await this.authService.loginWithCode(loginDto);

      logger.info('Code login successful', {
        requestId,
        context: 'AuthController.loginWithCode',
        userId: result.user.id
      });

      res.status(200).json(successResponse(result, 'Login successful'));
    } catch (error) {
      logger.error('Code login failed', {
        requestId,
        context: 'AuthController.loginWithCode',
        error,
        request: {
          username: req.body.username,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      });

      res.status(400).json(errorResponse(
        error instanceof Error ? error.message : 'Login failed'
      ));
    }
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      const userId = (req as any).user.id;
      
      logger.info('Logout attempt', {
        requestId,
        context: 'AuthController.logout',
        userId,
        ip: req.ip
      });

      await this.authService.logout(userId);

      logger.info('Logout successful', {
        requestId,
        context: 'AuthController.logout',
        userId
      });

      res.status(200).json(successResponse(null, 'Logout successful'));
    } catch (error) {
      logger.error('Logout failed', {
        requestId,
        context: 'AuthController.logout',
        error,
        userId: (req as any).user?.id
      });

      res.status(400).json(errorResponse(
        error instanceof Error ? error.message : 'Logout failed'
      ));
    }
  };
}