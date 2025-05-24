/**
 * Logging Service Tests
 */
import { EnhancedLoggingService } from './logging.service';
import { LogLevel, LoggingConfig } from './types';

// Mock supabase
jest.mock('../../supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnValue({ error: null })
  }
}));

describe('EnhancedLoggingService', () => {
  let loggingService: EnhancedLoggingService;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create service with memory destination for testing
    const config: Partial<LoggingConfig> = {
      destinations: ['memory'],
      minLevel: LogLevel.TRACE
    };
    loggingService = new EnhancedLoggingService(config);
    
    // Spy on console methods
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    // Restore console methods
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  test('should log messages at different levels', () => {
    loggingService.trace('Trace message');
    loggingService.debug('Debug message');
    loggingService.info('Info message');
    loggingService.warn('Warning message');
    loggingService.error('Error message');
    loggingService.fatal('Fatal message');
    
    const logs = loggingService.getLogs();
    expect(logs).toHaveLength(6);
    
    expect(logs[0].level).toBe(LogLevel.TRACE);
    expect(logs[0].message).toBe('Trace message');
    
    expect(logs[1].level).toBe(LogLevel.DEBUG);
    expect(logs[1].message).toBe('Debug message');
    
    expect(logs[2].level).toBe(LogLevel.INFO);
    expect(logs[2].message).toBe('Info message');
    
    expect(logs[3].level).toBe(LogLevel.WARN);
    expect(logs[3].message).toBe('Warning message');
    
    expect(logs[4].level).toBe(LogLevel.ERROR);
    expect(logs[4].message).toBe('Error message');
    
    expect(logs[5].level).toBe(LogLevel.FATAL);
    expect(logs[5].message).toBe('Fatal message');
  });

  test('should include context in log entries', () => {
    loggingService.info('Info with context', { user: 'test', action: 'login' });
    
    const logs = loggingService.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].context).toEqual({ user: 'test', action: 'login' });
  });

  test('should respect minimum log level', () => {
    // Reconfigure to only show warnings and above
    loggingService.configure({ minLevel: LogLevel.WARN });
    
    loggingService.trace('Trace message');
    loggingService.debug('Debug message');
    loggingService.info('Info message');
    loggingService.warn('Warning message');
    loggingService.error('Error message');
    
    const logs = loggingService.getLogs();
    // Should only see the warning and error entries
    expect(logs).toHaveLength(2);
    expect(logs[0].level).toBe(LogLevel.WARN);
    expect(logs[1].level).toBe(LogLevel.ERROR);
  });

  test('should include user and company ID in logs when set', () => {
    loggingService.setUser('user123', 'company456');
    loggingService.info('Message with user context');
    
    const logs = loggingService.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].userId).toBe('user123');
    expect(logs[0].companyId).toBe('company456');
  });

  test('should include global context in all logs', () => {
    loggingService.setGlobalContext({ app: 'test', version: '1.0.0' });
    loggingService.info('Message 1');
    loggingService.warn('Message 2', { local: 'context' });
    
    const logs = loggingService.getLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0].context).toEqual({ app: 'test', version: '1.0.0' });
    expect(logs[1].context).toEqual({ app: 'test', version: '1.0.0', local: 'context' });
  });

  test('should maintain session ID through session lifecycle', async () => {
    const sessionId = await loggingService.startSession('user123');
    expect(sessionId).toBeDefined();
    expect(loggingService.getSessionId()).toBe(sessionId);
    
    loggingService.info('Message during session');
    const logs = loggingService.getLogs();
    expect(logs.some(log => log.sessionId === sessionId)).toBe(true);
    
    await loggingService.endSession();
    expect(loggingService.getSessionId()).toBeNull();
  });

  test('should support disabling and enabling logging', () => {
    loggingService.info('Before disable');
    loggingService.disable();
    loggingService.info('After disable');
    loggingService.enable();
    loggingService.info('After enable');
    
    const logs = loggingService.getLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0].message).toBe('Before disable');
    expect(logs[1].message).toBe('After enable');
  });

  test('should work with compatibility methods', async () => {
    await loggingService.logEvent('TestEvent', { data: 'test' });
    await loggingService.logNavigation('/test-page', '/home');
    await loggingService.logInteraction('button-1', 'click');
    
    const logs = loggingService.getLogs();
    expect(logs).toHaveLength(3);
    expect(logs[0].message).toBe('TestEvent');
    expect(logs[1].message).toBe('Navigation');
    expect(logs[2].message).toBe('Interaction');
  });

  test('should return unique IDs for action and AI interaction logs', async () => {
    const actionId = await loggingService.logUserAction('click', 'button');
    const aiId = await loggingService.logAIInteraction('generate', { prompt: 'test' });
    
    expect(actionId).toBeDefined();
    expect(aiId).toBeDefined();
    expect(actionId).not.toBe(aiId);
    
    const logs = loggingService.getLogs();
    expect(logs).toHaveLength(2);
  });

  test('should format error information correctly', () => {
    const error = new Error('Test error');
    error.name = 'TestError';
    loggingService.error('An error occurred', error);
    
    const logs = loggingService.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].context?.error).toBeDefined();
    expect(logs[0].context?.error.name).toBe('TestError');
    expect(logs[0].context?.error.message).toBe('Test error');
    expect(logs[0].context?.error.stack).toBeDefined();
  });
});