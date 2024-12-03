import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../services/auth/auth.service';
import { PhoneService } from '../../services/auth/phone.service';
import { TokenService } from '../../services/auth/token.service';
import { UserRepository } from '../../repositories/auth/user.repository';
import { RegisterSource } from '../../types/auth/auth.types';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let phoneService: PhoneService;
  let tokenService: TokenService;

  beforeEach(() => {
    userRepository = {
      findByPhone: vi.fn(),
      create: vi.fn(),
      updateLastLogin: vi.fn(),
    } as any;

    phoneService = {
      verifyCode: vi.fn(),
    } as any;

    tokenService = {
      generateTokens: vi.fn(),
      refreshTokens: vi.fn(),
      revokeTokens: vi.fn(),
    } as any;

    authService = new AuthService(userRepository, phoneService, tokenService);
  });

  describe('loginByPhone', () => {
    const validLoginDto = {
      phone: '13800138000',
      code: '123456',
      deviceInfo: {
        deviceId: 'test-device',
        platform: 'test',
        userAgent: 'test-agent',
        ip: '127.0.0.1',
      },
    };

    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        f_id: '1',
        f_username: 'testuser',
        f_avatar_url: 'test-avatar',
      };
      const mockTokens = {
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 3600,
      };

      vi.mocked(phoneService.verifyCode).mockResolvedValueOnce(true);
      vi.mocked(userRepository.findByPhone).mockResolvedValueOnce(mockUser);
      vi.mocked(tokenService.generateTokens).mockResolvedValueOnce(mockTokens);

      const result = await authService.loginByPhone(validLoginDto);

      expect(phoneService.verifyCode).toHaveBeenCalledWith(
        validLoginDto.phone,
        validLoginDto.code
      );
      expect(userRepository.findByPhone).toHaveBeenCalledWith(validLoginDto.phone);
      expect(tokenService.generateTokens).toHaveBeenCalledWith(mockUser.f_id);
      expect(result).toEqual({
        token: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        user: {
          id: mockUser.f_id,
          nickname: mockUser.f_username,
          avatarUrl: mockUser.f_avatar_url,
        },
      });
    });

    it('should throw error when verification code is invalid', async () => {
      vi.mocked(phoneService.verifyCode).mockResolvedValueOnce(false);

      await expect(authService.loginByPhone(validLoginDto)).rejects.toThrow(
        'Invalid verification code'
      );
      expect(userRepository.findByPhone).not.toHaveBeenCalled();
      expect(tokenService.generateTokens).not.toHaveBeenCalled();
    });

    it('should throw error when user is not found', async () => {
      vi.mocked(phoneService.verifyCode).mockResolvedValueOnce(true);
      vi.mocked(userRepository.findByPhone).mockResolvedValueOnce(null);

      await expect(authService.loginByPhone(validLoginDto)).rejects.toThrow(
        'User not found'
      );
      expect(tokenService.generateTokens).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const validRegisterDto = {
      phone: '13800138000',
      code: '123456',
      nickname: 'testuser',
      deviceInfo: {
        deviceId: 'test-device',
        platform: 'test',
        userAgent: 'test-agent',
        ip: '127.0.0.1',
      },
    };

    it('should successfully register a new user', async () => {
      const mockUser = {
        f_id: '1',
        f_username: validRegisterDto.nickname,
        f_avatar_url: null,
      };
      const mockTokens = {
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 3600,
      };

      vi.mocked(phoneService.verifyCode).mockResolvedValueOnce(true);
      vi.mocked(userRepository.create).mockResolvedValueOnce(mockUser);
      vi.mocked(tokenService.generateTokens).mockResolvedValueOnce(mockTokens);

      const result = await authService.register(validRegisterDto);

      expect(phoneService.verifyCode).toHaveBeenCalledWith(
        validRegisterDto.phone,
        validRegisterDto.code
      );
      expect(userRepository.create).toHaveBeenCalledWith({
        f_username: validRegisterDto.nickname,
        f_phone: validRegisterDto.phone,
        f_register_source: RegisterSource.PHONE,
        f_register_ip: validRegisterDto.deviceInfo.ip,
        f_is_active: true,
      });
      expect(result).toEqual({
        token: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        user: {
          id: mockUser.f_id,
          nickname: mockUser.f_username,
          avatarUrl: mockUser.f_avatar_url,
        },
      });
    });

    it('should throw error when verification code is invalid during registration', async () => {
      vi.mocked(phoneService.verifyCode).mockResolvedValueOnce(false);

      await expect(authService.register(validRegisterDto)).rejects.toThrow(
        'Invalid verification code'
      );
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(tokenService.generateTokens).not.toHaveBeenCalled();
    });
  });
});