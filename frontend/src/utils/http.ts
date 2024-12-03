import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',  // API 的基础路径
  timeout: 10000,   // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 如果响应包含 data 字段，直接返回 data
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 处理 401 未授权
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // 返回错误信息
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

// HTTP 工具类
export const http = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.get(url, config);
  },

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.post(url, data, config);
  },

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.put(url, data, config);
  },

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.delete(url, config);
  },

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.patch(url, data, config);
  }
}; 