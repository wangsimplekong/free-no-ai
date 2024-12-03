export interface UserBenefits {
  membership: {
    planName: string;
    level: number;
    expireTime: string;
    status: number;
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

export interface BenefitsResponse {
  code: number;
  message: string;
  data: UserBenefits;
  timestamp: number;
}