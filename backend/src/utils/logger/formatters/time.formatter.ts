export const getTimestamp = (): string => {
  return new Date().toISOString();
};

export const formatDuration = (duration: number): string => {
  return `${duration}ms`;
};