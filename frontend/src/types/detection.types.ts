export interface DetectionRequest {
  content: string;
}

export interface DetectionResponse {
  ai_score: number;
  human_score: number;
}

export interface DetectionResult {
  code: number;
  message: string;
  data?: DetectionResponse;
  timestamp: number;
}