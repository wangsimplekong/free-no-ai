import api from '../lib/api';
import type {
  LoginRequest,
  LoginWithCodeRequest,
  RegisterRequest,
  AuthResponse,
  VerificationRequest,
  UserBenefits
} from '../types/auth.types';

class AuthService {
  /**
   * Register with email/phone and password
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  }

  /**
   * Login with email/phone and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  }

  /**
   * Login with verification code
   */
  async loginWithCode(data: LoginWithCodeRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/loginWithCode', data);
    return response.data;
  }

  /**
   * Send verification code
   */
  async sendVerification(data: VerificationRequest): Promise<void> {
    await api.post('/api/auth/verification/send', data);
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
  }

  /**
   * Get user benefits
   */
  async getUserBenefits(): Promise<UserBenefits | null> {
    try {
      const response = await api.get<{
        code: number;
        message: string;
        data: UserBenefits;
      }>('/api/benefits/user');
      return response.data.data;
    } catch (error) {
      if ((error as any)?.response?.status === 401) {
        return null;
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;