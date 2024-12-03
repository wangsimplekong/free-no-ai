import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { memberRoutes } from '../../routes/member.routes';
import { authMiddleware } from '../../middlewares/auth.middleware';

vi.mock('../../middlewares/auth.middleware', () => ({
  authMiddleware: vi.fn((req, res, next) => {
    req.user = { id: 'user-123' };
    next();
  })
}));

describe('Member Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/member', memberRoutes);
  });

  describe('POST /api/member/subscribe', () => {
    const validSubscribeData = {
      plan_id: '123e4567-e89b-12d3-a456-426614174000',
      duration: 1,
      auto_renew: true
    };

    it('should require authentication', async () => {
      vi.mocked(authMiddleware).mockImplementationOnce((req, res, next) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .post('/api/member/subscribe')
        .send(validSubscribeData);

      expect(response.status).toBe(401);
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/member/subscribe')
        .send({
          plan_id: 'invalid-uuid',
          duration: -1,
          auto_renew: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/member/quota', () => {
    it('should require authentication', async () => {
      vi.mocked(authMiddleware).mockImplementationOnce((req, res, next) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .get('/api/member/quota');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/member/quota/consume', () => {
    const validConsumeData = {
      quota_type: 1,
      amount: 100
    };

    it('should require authentication', async () => {
      vi.mocked(authMiddleware).mockImplementationOnce((req, res, next) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .post('/api/member/quota/consume')
        .send(validConsumeData);

      expect(response.status).toBe(401);
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/member/quota/consume')
        .send({
          quota_type: 999,
          amount: -1
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/member/status', () => {
    it('should require authentication', async () => {
      vi.mocked(authMiddleware).mockImplementationOnce((req, res, next) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .get('/api/member/status');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/member/renew', () => {
    it('should require authentication', async () => {
      vi.mocked(authMiddleware).mockImplementationOnce((req, res, next) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .post('/api/member/renew')
        .send({ auto_renew: true });

      expect(response.status).toBe(401);
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/member/renew')
        .send({ auto_renew: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });
});