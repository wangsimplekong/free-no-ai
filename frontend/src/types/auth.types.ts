export interface User {
  id: string;
  username: string;
  nickname: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserBenefits {
  membership: {
    planName: string;
    planId: string;
    level: number;
    expireTime: string;
    createdTime: string;
    status: number;
    price: number;
    period_type: 1 | 2;
  };
  quotas: {
    detection: {
      total: number;
      used: number;
      remaining: number;
      expireTime: string;
    };
    rewrite: {
      total: number;
      used: number;
      remaining: number;
      expireTime: string;
    };
  };
}

export interface AuthResponse {
  code: number;
  message: string;
  data?: {
    state: {
      user: User;
      token: string;
      refreshToken: string;
      isAuthenticated: boolean;
    };
    version: number;
  };
  timestamp: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
  code: string;
  register_source: RegisterSource;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginWithCodeRequest {
  username: string;
  code: string;
}

export enum VerificationType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  WECHAT = 'WECHAT'
}

export enum RegisterSource {
  PHONE = 1,
  WECHAT = 2,
  EMAIL = 3,
  GOOGLE = 4
}

export enum VerificationPurpose {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  RESET_PASSWORD = 'RESET_PASSWORD'
}

export interface VerificationRequest {
  recipient: string;
  type: VerificationType;
  purpose: VerificationPurpose;
}

export interface ErrorResponse {
  code: number;
  message: string;
  timestamp: number;
}