import { platform } from 'os';

export const aigcFileConfig = {
  apiUrl: 'https://test-gateway.laibokeji.com/similar-dispatch-center',
  reduceUrl: 'https://test-gateway.laibokeji.com/reduce-center',
  reduceApiKey: 'E370ZCUR',
  apiKey: 'ODXE7G24',
  reducePlatformKey: 'a8f880b5-d895-48b0-ba5e-8280005d8019',
  platformKey: '8aaa04bc9130929b019130c64dda0002',
  maxFileSize: 31457280, // 30MB
  allowedFileTypes: ['pdf', 'doc', 'docx', 'txt'],
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  defaultParams: {
    originType: 'DOC',
    aigcType: 1,
  },
  reduce: {
    type: 5, // AIGC降重
    reportKind: 'aigc',
    checkThesis: false,
  },
} as const;
