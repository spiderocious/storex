/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
export const logger = {
  info: (message: string, ...args: any[]) => console.info(message, ...args),
  log: (message: string, ...args: any[]) => console.log(message, ...args),
  error: (message: string, ...args: any[]) => console.error(message, ...args),
  warn: (message: string, ...args: any[]) => console.warn(message, ...args),
};
