import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { AuthController } from '../../controllers/auth/auth.controller';
import { AuthService } from '../../services/auth/auth.service';
import { PhoneLoginDTO } from '../../dto/auth/auth.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: any;
  let responseStatus: any;

  beforeEach(() => {
    authService = {
      loginByPhone: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn(),
      logout: vi.fn(),
    } as any;

    authController = new AuthController(authService);

    responseJson = vi.fn().mockReturnThis();
    responseStatus = vi.fn().mockReturnThis();

    mockResponse = {
      json: responseJson,
      status: responseStatus,
    };

    mockRequest = {
      body: {},
    };

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-27T10:00:00Z'));
  });

  describe('login', () => {
    const validLoginDto: PhoneLoginDTO = {
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
      const mockUser = { id: 1, username: 'testuser' };
      const mockResult = {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        user: mockUser,
      };

      mockRequest.body = validLoginDto;
      vi.mocked(authService.loginByPhone).mockResolvedValueOnce(mockResult);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(authService.loginByPhone).toHaveBeenCalledWith(validLoginDto);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        code: 200,
        message: 'Login successful',
        data: mockResult,
        timestamp: Date.now(),
      });
    });

    it('should handle login failure with invalid credentials', async () => {
      const error = new Error('Invalid verification code');
      mockRequest.body = validLoginDto;
      vi.mocked(authService.loginByPhone).mockRejectedValueOnce(error);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(authService.loginByPhone).toHaveBeenCalledWith(validLoginDto);
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        code: 400,
        message: 'Invalid verification code',
        timestamp: Date.now(),
      });
    });

    it('should handle login with missing required fields', async () => {
      mockRequest.body = { phone: '13800138000' }; // Missing code

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(authService.loginByPhone).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        code: 400,
        message: expect.any(String),
        timestamp: Date.now(),
      });
    });

    it('should handle internal server errors during login', async () => {
      const error = new Error('Database connection failed');
      mockRequest.body = validLoginDto;
      vi.mocked(authService.loginByPhone).mockRejectedValueOnce(error);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        code: 400,
        message: 'Database connection failed',
        timestamp: Date.now(),
      });
    });
  });
});