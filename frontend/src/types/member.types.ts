export interface MemberPlan {
  id: string;
  name: string;
  level: number;
  period_type: 1 | 2; // 1: Monthly, 2: Yearly
  price: number;
  detection_quota: number;
  rewrite_quota: number;
  status: number;
  created_at: string;
  updated_at: string;
}