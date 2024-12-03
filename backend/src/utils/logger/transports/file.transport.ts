import pino from 'pino';
import fs from 'fs';
import path from 'path';

export const createFileTransport = (filename: string) => {
  const logDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  return pino.destination({
    dest: path.join(logDir, filename),
    sync: false,
    mkdir: true
  });
};