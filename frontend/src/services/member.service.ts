import api from '../lib/api';
import type { MemberPlan } from '../types/member.types';

class MemberService {
  private readonly baseUrl = '/api/member';

  async getPlans(): Promise<MemberPlan[]> {
    try {
      const response = await api.get(`${this.baseUrl}/plans`);
      if (response.data?.code === 200 && Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      throw new Error(response.data?.message || '获取套餐信息失败');
    } catch (error) {
      throw error instanceof Error ? error : new Error('获取套餐信息失败');
    }
  }
}

export const memberService = new MemberService();
export default memberService;