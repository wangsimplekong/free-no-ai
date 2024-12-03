import dotenv from 'dotenv';

dotenv.config();

export const aigcConfig = {
  apiUrl: 'https://test-gateway.laibokeji.com/openai-serivce/internal/openai/gpt',
  apiKey: 'GHYVXL4X',
  keyType: 'humanizer',
  model: 'ft:gpt-3.5-turbo-1106:personal:humanizer-zh-0424:9w0MzWrI',
  maxTextLength: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 30000,
  defaultParams: {
    stream: false,
    frequency_penalty: 0.1,
    presence_penalty: -0.1,
    temperature: 1.0,
    top_p: 0.999
  }
} as const;