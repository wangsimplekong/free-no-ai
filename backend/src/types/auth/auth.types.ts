export enum UserStatus {
  NORMAL = 1,
  DISABLED = 2,
}

// Verification Types
export enum VerifyType {
  SMS = 'SMS',
  EMAIL = 'EMAIL'
}

export enum RegisterSource {
  PHONE = 1,
  WECHAT = 2,
  EMAIL = 3,
  GOOGLE = 4
}

export enum VerifyBusinessType {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  RESET_PASSWORD = 'RESET_PASSWORD'
}

export interface DeviceInfo {
  deviceId?: string;
  platform?: string;
  userAgent?: string;
  ip?: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}