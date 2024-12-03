import { Request } from 'express';

export const formatRequest = (req: Request) => {
  return {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    params: req.params,
    query: req.query,
    headers: sanitizeHeaders(req.headers),
    body: sanitizeBody(req.body),
    ip: req.ip,
    userAgent: req.headers['user-agent']
  };
};

const sanitizeHeaders = (headers: Record<string, any>) => {
  const sanitized = { ...headers };
  if (sanitized.authorization) {
    sanitized.authorization = '[REDACTED]';
  }
  return sanitized;
};

const sanitizeBody = (body: Record<string, any>) => {
  const sanitized = { ...body };
  if (sanitized.password) {
    sanitized.password = '[REDACTED]';
  }
  return sanitized;
};