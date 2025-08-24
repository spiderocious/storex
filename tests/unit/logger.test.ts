import { logger } from '@/utils/logger';

describe('Logger', () => {
  let consoleInfoSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('info', () => {
    it('should call console.info with message', () => {
      logger.info('test message');
      expect(consoleInfoSpy).toHaveBeenCalledWith('test message');
    });

    it('should call console.info with message and additional args', () => {
      logger.info('test message', { key: 'value' }, 123);
      expect(consoleInfoSpy).toHaveBeenCalledWith('test message', { key: 'value' }, 123);
    });
  });

  describe('log', () => {
    it('should call console.log with message', () => {
      logger.log('test message');
      expect(consoleLogSpy).toHaveBeenCalledWith('test message');
    });

    it('should call console.log with message and additional args', () => {
      logger.log('test message', { key: 'value' }, 123);
      expect(consoleLogSpy).toHaveBeenCalledWith('test message', { key: 'value' }, 123);
    });
  });

  describe('error', () => {
    it('should call console.error with message', () => {
      logger.error('test message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('test message');
    });

    it('should call console.error with message and additional args', () => {
      logger.error('test message', { key: 'value' }, 123);
      expect(consoleErrorSpy).toHaveBeenCalledWith('test message', { key: 'value' }, 123);
    });
  });

  describe('warn', () => {
    it('should call console.warn with message', () => {
      logger.warn('test message');
      expect(consoleWarnSpy).toHaveBeenCalledWith('test message');
    });

    it('should call console.warn with message and additional args', () => {
      logger.warn('test message', { key: 'value' }, 123);
      expect(consoleWarnSpy).toHaveBeenCalledWith('test message', { key: 'value' }, 123);
    });
  });
});
