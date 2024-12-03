export interface MemberPlan {
  id: string;
  name: string;
  level: number;
  period_type: number;
  price: number;
  detection_quota: number;
  rewrite_quota: number;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface MemberPlanResponse {
  code: number;
  message: string;
  data: MemberPlan[];
  timestamp: number;
}