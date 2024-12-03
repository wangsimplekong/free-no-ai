import crypto from 'crypto';

export const generateSalt = (length: number = 32): string => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

export const hashPassword = (password: string, salt: string): string => {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
};

export const verifyPassword = (password: string, salt: string, hashedPassword: string): boolean => {
  const hash = hashPassword(password, salt);
  return hash === hashedPassword;
};