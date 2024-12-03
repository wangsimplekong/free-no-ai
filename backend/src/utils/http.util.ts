import axios from 'axios';
import { logger } from './logger';

export const createHttpClient = (baseURL: string, timeout = 30000) => {
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      logger.debug('Outgoing request', {
        url: config.url,
        method: config.method,
        timestamp: new Date().toISOString()
      });
      return config;
    },
    (error) => {
      logger.error('Request error', { error });
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      logger.debug('Response received', {
        status: response.status,
        timestamp: new Date().toISOString()
      });
      return response;
    },
    (error) => {
      logger.error('Response error', {
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      return Promise.reject(error);
    }
  );

  return client;
};