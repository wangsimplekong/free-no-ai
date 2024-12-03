import api from '../lib/api';
import type { MemberPlan } from '../types/member.types';

class MemberService {
  private readonly baseUrl = '/api/member';

  async getPlans(): Promise<MemberPlan[]> {
    const response = await api.get(`${this.baseUrl}/plans`);
    return response.data.data;
  }
}

export const memberService = new MemberService();
export default memberService;