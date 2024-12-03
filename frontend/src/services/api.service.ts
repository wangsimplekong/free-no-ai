import api from '../lib/api';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

class ApiService {
  async get<T = any>(url: string, params?: object): Promise<ApiResponse<T>> {
    return api.get(url, { params });
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return api.post(url, data);
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return api.put(url, data);
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return api.delete(url);
  }
}

export const apiService = new ApiService();
export default apiService;