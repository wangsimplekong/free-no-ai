export enum MemberStatus {
  NORMAL = 1,
  EXPIRED = 2,
  CANCELLED = 3
}

export enum PlanLevel {
  BASIC = 1,
  STANDARD = 2,
  PREMIUM = 3
}

export enum PeriodType {
  MONTHLY = 1,
  YEARLY = 2
}

export enum QuotaType {
  DETECTION = 1,
  REWRITE = 2
}

export enum QuotaChangeType {
  CONSUME = 1,
  RECHARGE = 2,
  EXPIRE = 3,
  REFUND = 4
}

export interface Member {
  id: string;
  user_id: string;
  plan_id: string;
  status: MemberStatus;
  start_time: Date;
  expire_time: Date;
  auto_renew: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MemberPlan {
  id: string;
  name: string;
  level: PlanLevel;
  period_type: PeriodType;
  price: number;
  detection_quota: number;
  rewrite_quota: number;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserQuota {
  id: string;
  user_id: string;
  quota_type: QuotaType;
  total_quota: number;
  used_quota: number;
  expire_time: Date;
  created_at: Date;
  updated_at: Date;
}

export interface QuotaRecord {
  id: string;
  user_id: string;
  quota_type: QuotaType;
  change_type: QuotaChangeType;
  change_amount: number;
  before_amount: number;
  after_amount: number;
  order_id?: string;
  remark?: string;
  created_at: Date;
}