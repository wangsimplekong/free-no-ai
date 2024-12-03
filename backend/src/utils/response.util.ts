export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export const successResponse = <T>(data: T, message = 'Success'): ApiResponse<T> => ({
  code: 200,
  message,
  data,
  timestamp: Date.now()
});

export const errorResponse = (message: string, code = 400): ApiResponse => ({
  code,
  message,
  timestamp: Date.now()
});