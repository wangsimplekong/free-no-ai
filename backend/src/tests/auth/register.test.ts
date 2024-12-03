import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { AuthController } from '../../controllers/auth/auth.controller';
import { AuthService } from '../../services/auth/auth.service';
import { registerValidator } from '../../validators/auth.validator';
import { validateRequest } from '../../middlewares/validate.middleware';

describe('Registration Endpoint', () => {
  let app: express.Application;
  let mockAuthService: AuthService;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockAuthService = {
      register: vi.fn(),
      loginByPhone: vi.fn(),
      refreshToken: vi.fn(),
      logout: vi.fn(),
    } as any;

    const authController = new AuthController(mockAuthService);

    app.post('/api/auth/register', 
      registerValidator,
      validateRequest,
      authController.register
    );
  });

  it('should successfully register a new user', async () => {
    const mockUser = {
      id: '1',
      phone: '13800138000',
      nickname: 'Test User'
    };

    const mockResponse = {
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      user: mockUser
    };

    vi.mocked(mockAuthService.register).mockResolvedValueOnce(mockResponse);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '13800138000',
        code: '123456',
        name: 'Test User'
      });

    expect(response.status).toBe(201);
    expect(response.body.code).toBe(200);
    expect(response.body.message).toBe('Registration successful');
    expect(response.body.data).toEqual(mockResponse);
  });

  it('should validate phone number format', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '12345', // Invalid phone number
        code: '123456',
        name: 'Test User'
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        msg: 'Invalid phone number format'
      })
    );
  });

  it('should validate verification code', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '13800138000',
        code: '123', // Invalid code length
        name: 'Test User'
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        msg: 'Verification code must be 6 digits'
      })
    );
  });

  it('should handle registration failure', async () => {
    vi.mocked(mockAuthService.register).mockRejectedValueOnce(
      new Error('Registration failed')
    );

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '13800138000',
        code: '123456',
        name: 'Test User'
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(400);
    expect(response.body.message).toBe('Registration failed');
  });
});