import { createHttpClient } from '../../utils/http.util';
import { logger } from '../../utils/logger';
import { DetectionRequest, DetectionResponse } from '../../types/detection.types';
import { detectionConfig } from '../../config/detection.config';

export class AigcDetectionService {
  private httpClient;

  constructor() {
    this.httpClient = createHttpClient(detectionConfig.apiUrl, detectionConfig.timeout);
  }

  async detectText(params: DetectionRequest): Promise<DetectionResponse> {
    try {
      logger.info('Starting AIGC text detection', {
        contentLength: params.content.length,
        timestamp: new Date().toISOString()
      });

      const response = await this.httpClient.post<DetectionResponse>(
        `?key=${detectionConfig.apiKey}`,
        { text: params.content.trim() }
      );

      const { ai_score, human_score } = response.data;
      logger.info(response.data)

      if (typeof ai_score !== 'number' || typeof human_score !== 'number') {
        throw new Error('Invalid score values in response');
      }

      const result = {
        ai_score: Number(ai_score.toFixed(4)),
        human_score: Number(human_score.toFixed(4))
      };

      logger.info('AIGC detection completed successfully', {
        result,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      
      logger.error('AIGC detection failed', {
        error,
        content: params.content.substring(0, 100) + '...',
        timestamp: new Date().toISOString()
      });

      if (error.response?.data) {
        throw new Error(`Detection service error: ${error.response.data}`);
      }
      
      throw error;
    }
  }
}

export default new AigcDetectionService();