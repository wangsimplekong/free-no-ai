import api from '../lib/api';
import type { DetectionRequest, DetectionResult } from '../types/detection.types';

class DetectionService {
  private readonly baseUrl = '/api/v1/detection';

  /**
   * Analyze text content for AI detection
   * @param content Text content to analyze
   * @returns Detection result with AI and human scores
   * @throws Error if the request fails
   */
  async detectText(content: string): Promise<DetectionResult> {
    try {
      const request: DetectionRequest = { content };
      const response = await api.post<DetectionResult>(`${this.baseUrl}/text`, request);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to perform AI detection');
    }
  }

  /**
   * Validates text content before sending to API
   * @param content Text content to validate
   * @throws Error if validation fails
   */
  validateContent(content: string): void {
    if (!content) {
      throw new Error('Content is required');
    }

    if (typeof content !== 'string') {
      throw new Error('Content must be a string');
    }

    if (content.length < 1 || content.length > 5000) {
      throw new Error('Content length must be between 1 and 5000 characters');
    }
  }
}

export const detectionService = new DetectionService();
export default detectionService;