import type { AuthResponse } from '../types/auth';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5191/api';

// Maintain a reference to the access token in memory
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Mock API Client for Demo Purposes
 * Intercepts requests and returns realistic mock data without needing a real backend.
 */
export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const method = options.method || 'GET';

  // Mock Auth Endpoints
  if (endpoint === '/auth/login' && method === 'POST') {
    const body = JSON.parse(options.body as string);
    const isAdmin = body.email.toLowerCase() === 'admin@thetatch.com';
    const mockResponse: AuthResponse = {
      id: isAdmin ? 'admin-001' : 'user-123',
      token: 'mock-jwt-token-' + Date.now(),
      fullName: isAdmin ? 'Admin User' : 'Demo User',
      email: body.email,
      roles: isAdmin ? ['Admin', 'User'] : ['User']
    };
    return mockResponse as unknown as T;
  }

  if (endpoint === '/auth/register' && method === 'POST') {
    return { message: 'Registration successful' } as unknown as T;
  }

  if (endpoint === '/auth/refresh' && method === 'POST') {
    if (accessToken) {
      const mockResponse: AuthResponse = {
        id: 'user-123',
        token: accessToken,
        fullName: 'Demo User',
        email: 'demo@thetatch.com',
        roles: ['User']
      };
      return mockResponse as unknown as T;
    }
    throw new ApiError('No valid session found', 401);
  }

  if (endpoint === '/auth/logout' && method === 'POST') {
    return undefined as unknown as T;
  }

  // Fallback for other endpoints (return empty array or generic success)
  if (endpoint.includes('/products') || endpoint.includes('/orders')) {
    return [] as unknown as T;
  }

  return { message: 'Mock success' } as unknown as T;
}
