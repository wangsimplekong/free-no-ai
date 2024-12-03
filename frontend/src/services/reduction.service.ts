import api from '../lib/api';
import type { ReductionRequest, ReductionResult } from '../types/reduction.types';

class ReductionService {
  private readonly baseUrl = '/api/v1/aigc';

  /**
   * Reduce text content for originality
   * @param text Text content to rewrite
   * @returns Reduction result with rewritten text
   * @throws Error if the request fails
   */
  async reduceText(text: string): Promise<ReductionResult> {
    try {
      const request: ReductionRequest = { text };
      const response = await api.post<ReductionResult>(`${this.baseUrl}/reduce/text`, request);
      
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from reduction service');
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to perform text reduction');
    }
  }

  /**
   * Validates text content before sending to API
   * @param text Text content to validate
   * @throws Error if validation fails
   */
  validateContent(text: string): void {
    if (!text) {
      throw new Error('内容不能为空');
    }

    if (typeof text !== 'string') {
      throw new Error('内容必须是文本格式');
    }

    if (text.length < 1 || text.length > 5000) {
      throw new Error('文本长度必须在1-5000字之间');
    }
  }
}

export const reductionService = new ReductionService();
export default reductionService;