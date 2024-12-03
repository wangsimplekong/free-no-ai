export interface ReductionRequest {
  text: string;
}

export interface ReductionResponse {
  text: string;
}

export interface ReductionResult {
  code: number;
  message: string;
  data?: ReductionResponse;
  timestamp: number;
}