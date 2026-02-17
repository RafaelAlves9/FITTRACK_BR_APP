// @ts-nocheck
export * from './types';

// Mock backend authentication system - for prototype development and when backend is unavailable
export { useMockAuth, useMockAuthDebug } from './mock/hook';
export { mockAuthService } from './mock/service';  
export { MockAuthRouter } from './mock/router';
export { MockAuthProvider } from './mock/context';