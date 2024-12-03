export interface RegisterDTO {
  username: string;
  password: string;
  code: string;
  registerSource: number;
  registerIp: string;
  registerDevice?: string;
}

export interface LoginDTO {
  username: string;
  password: string;
  loginIp: string;
  loginDevice?: string;
}

export interface LoginWithCodeDTO {
  username: string;
  code: string;
  loginIp: string;
  loginDevice?: string;
}

export interface LoginResultDTO {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    nickname?: string;
    avatarUrl?: string;
    createdAt: Date;
  };
}