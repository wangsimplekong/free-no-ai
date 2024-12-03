export const aigcFileConfig = {
  apiUrl: 'https://test-gateway.laibokeji.com/similar-dispatch-center',
  apiKey: 'ODXE7G24',
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
} as const;
