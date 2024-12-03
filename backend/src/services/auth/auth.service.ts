import { UserRepository } from '../../repositories/auth/user.repository';
import { TokenService } from './token.service';
import { RegisterDTO, LoginDTO, LoginWithCodeDTO, LoginResultDTO } from '../../dto/auth/auth.dto';
import { logger } from '../../utils/logger';
import { generateSalt, hashPassword, verifyPassword } from '../../utils/crypto.util';
import { VerificationService } from '../verification/verification.service';
import { RegisterSource, VerifyType, VerifyBusinessType } from '../../types/auth/auth.types';
import { validatePhoneNumber } from '../../utils/verification/sms.util';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService,
    private verificationService: VerificationService
  ) {}

  async register(params: RegisterDTO): Promise<LoginResultDTO> {
    try {
      // Determine verification type based on register source
      const verifyType = params.registerSource === RegisterSource.PHONE ? VerifyType.SMS : VerifyType.EMAIL;

      // Verify the code first
      const isValid = await this.verificationService.validateCode(
        params.username,
        params.code,
        verifyType,
        VerifyBusinessType.REGISTER
      );

      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Check if user exists
      const existingUser = await this.userRepository.findByUsername(params.username);
      if (existingUser) {
        throw new Error('Username already registered');
      }

      // Generate salt and hash password
      const salt = generateSalt();
      const hashedPassword = hashPassword(params.password, salt);

      // Create user
      const user = await this.userRepository.createUser({
        username: params.username,
        password: hashedPassword,
        salt,
        status: 1,
        register_source: params.registerSource,
        register_ip: params.registerIp,
        register_device: params.registerDevice
      });

      // Create corresponding record based on register source
      switch (params.registerSource) {
        case RegisterSource.PHONE:
          await this.userRepository.createPhoneRecord({
            user_id: user.id,
            phone: params.username,
            is_active: true,
            bind_time: new Date()
          });
          break;

        case RegisterSource.EMAIL:
          await this.userRepository.createEmailRecord({
            user_id: user.id,
            email: params.username,
            is_active: true,
            is_verified: true,
            bind_time: new Date(),
            verify_time: new Date()
          });
          break;
      }

      // Generate tokens
      const tokenInfo = await this.tokenService.generateTokens(user.id);

      // Log the registration
      await this.userRepository.createLoginLog({
        user_id: user.id,
        login_type: params.registerSource,
        login_ip: params.registerIp,
        login_device: params.registerDevice,
        login_status: 1
      });

      // Clear verification code only after successful registration
      await this.verificationService.clearVerificationCode(
        params.username,
        verifyType,
        VerifyBusinessType.REGISTER
      );

      return {
        token: tokenInfo.accessToken,
        refreshToken: tokenInfo.refreshToken,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at
        }
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(params: LoginDTO): Promise<LoginResultDTO> {
    try {
      // Find user
      const user = await this.userRepository.findByUsername(params.username);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = verifyPassword(params.password, user.salt, user.password);
      if (!isValidPassword) {
        await this.userRepository.createLoginLog({
          user_id: user.id,
          login_type: user.register_source,
          login_ip: params.loginIp,
          login_device: params.loginDevice,
          login_status: 2,
          fail_reason: 'Invalid password'
        });
        throw new Error('Invalid credentials');
      }

      // Check user status
      if (user.status !== 1) {
        throw new Error('Account is disabled');
      }

      // Generate tokens
      const tokenInfo = await this.tokenService.generateTokens(user.id);

      // Update last login
      await this.userRepository.updateLastLogin(user.id, params.loginIp);

      // Log successful login
      await this.userRepository.createLoginLog({
        user_id: user.id,
        login_type: user.register_source,
        login_ip: params.loginIp,
        login_device: params.loginDevice,
        login_status: 1
      });

      return {
        token: tokenInfo.accessToken,
        refreshToken: tokenInfo.refreshToken,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async loginWithCode(params: LoginWithCodeDTO): Promise<LoginResultDTO> {
    try {
      // Find user
      const user = await this.userRepository.findByUsername(params.username);
      if (!user) {
        throw new Error('User not found');
      }

      // Determine verification type based on username format
      const verifyType = validatePhoneNumber(params.username) ? VerifyType.SMS : VerifyType.EMAIL;

      // Verify code
      const isValidCode = await this.verificationService.validateCode(
        params.username,
        params.code,
        verifyType,
        VerifyBusinessType.LOGIN
      );

      if (!isValidCode) {
        await this.userRepository.createLoginLog({
          user_id: user.id,
          login_type: user.register_source,
          login_ip: params.loginIp,
          login_device: params.loginDevice,
          login_status: 2,
          fail_reason: 'Invalid verification code'
        });
        throw new Error('Invalid verification code');
      }

      // Check user status
      if (user.status !== 1) {
        throw new Error('Account is disabled');
      }

      // Generate tokens
      const tokenInfo = await this.tokenService.generateTokens(user.id);

      // Update last login
      await this.userRepository.updateLastLogin(user.id, params.loginIp);

      // Log successful login
      await this.userRepository.createLoginLog({
        user_id: user.id,
        login_type: user.register_source,
        login_ip: params.loginIp,
        login_device: params.loginDevice,
        login_status: 1
      });

      // Clear verification code only after successful login
      await this.verificationService.clearVerificationCode(
        params.username,
        verifyType,
        VerifyBusinessType.LOGIN
      );

      return {
        token: tokenInfo.accessToken,
        refreshToken: tokenInfo.refreshToken,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at
        }
      };
    } catch (error) {
      logger.error('Code login error:', error);
      throw error;
    }
  }

  async logout(userId: string | null): Promise<void> {
    try {
      if (!userId) {
        logger.info('No active session to logout');
        return;
      }

      logger.info('Processing logout', {
        userId,
        timestamp: new Date().toISOString()
      });

      // Revoke all tokens for the user
      await this.tokenService.revokeTokens(userId);

      logger.info('Logout successful', {
        userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Logout failed:', error);
      // We don't throw the error here to ensure the logout always succeeds from the client perspective
      logger.warn('Continuing despite logout error');
    }
  }
}