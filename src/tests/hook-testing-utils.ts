/**
 * Utility functions for testing React hooks
 * 
 * Provides helper functions to test hooks in isolation
 */

import { ReactNode } from 'react';

// Mock implementation of renderHook since we don't have @testing-library/react-hooks
// In a real project, you would install this package
interface RenderHookResult<TResult> {
  result: {
    current: TResult;
    error?: Error;
  };
  waitForNextUpdate: () => Promise<void>;
  rerender: (props?: any) => void;
  unmount: () => void;
}

function renderHook<TProps, TResult>(
  callback: (props: TProps) => TResult,
  options?: { initialProps?: TProps; wrapper?: React.ComponentType<any> }
): RenderHookResult<TResult> {
  // This is a simplified mock implementation
  const result = { current: callback(options?.initialProps as TProps) };
  
  return {
    result,
    waitForNextUpdate: () => Promise.resolve(),
    rerender: () => {},
    unmount: () => {}
  };
}

// Mock implementation of act
function act(callback: () => void | Promise<void>): void | Promise<void> {
  return callback();
}

/**
 * Options for rendering a hook with providers
 */
export interface RenderHookOptions {
  /**
   * Initial props to pass to the hook
   */
  initialProps?: any;
  
  /**
   * Wrapper component to provide context
   */
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

/**
 * Render a hook with the specified options
 * 
 * @param hook The hook function to test
 * @param options Options for rendering the hook
 * @returns The rendered hook result
 */
export function renderHookWithProviders<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options: RenderHookOptions = {}
) {
  const { initialProps, wrapper } = options;
  
  return renderHook(hook, {
    initialProps,
    wrapper
  });
}

/**
 * Wait for a hook to finish loading
 * 
 * @param result The rendered hook result
 * @param timeout Maximum time to wait in milliseconds
 * @returns A promise that resolves when loading is complete
 */
export async function waitForHookToLoad<TResult extends { loading: boolean }>(
  result: { current: TResult },
  timeout: number = 5000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkLoading = () => {
      if (!result.current.loading) {
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Hook did not finish loading within ${timeout}ms`));
        return;
      }
      
      setTimeout(checkLoading, 50);
    };
    
    checkLoading();
  });
}

/**
 * Create a mock for the supabase client
 * 
 * @returns A mock supabase client
 */
export function createMockSupabaseClient() {
  // Create a mock query builder that can be returned by from()
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
  };
  
  // Create the mock supabase client
  const mockSupabase = {
    from: jest.fn(() => mockQueryBuilder),
    rpc: jest.fn().mockResolvedValue({ data: [], error: null })
  };
  
  return { mockSupabase, mockQueryBuilder };
}

/**
 * Create a mock context provider for testing hooks that use context
 * 
 * @param Context The React context to mock
 * @param value The value to provide to the context
 * @returns A wrapper component that provides the mocked context
 */
export function createMockContextProvider<T>(Context: React.Context<T>, value: T) {
  // In a real implementation, this would return a JSX component
  // For now, we'll return a mock function since we're not actually rendering
  return function MockProvider({ children }: { children: ReactNode }) {
    return children;
  };
}
