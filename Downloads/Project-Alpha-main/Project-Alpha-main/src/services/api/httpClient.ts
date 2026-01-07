/**
 * @file httpClient.ts
 * @description HTTP client wrapper using fetch API.
 * Handles authentication, error handling, and request/response transformation.
 */

import { API_CONFIG, getAuthToken } from '../../config/api.config';

export interface HttpClientConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  requiresAuth?: boolean;
}

/**
 * @desc Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * @desc HTTP Client for making API requests
 */
class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = API_CONFIG.baseURL;
    this.defaultHeaders = {
      ...API_CONFIG.headers,
      ...config.headers,
    };
    this.timeout = config.timeout || API_CONFIG.timeout;
  }

  /**
   * @desc Makes a fetch request with timeout and auth handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeout = this.timeout, requiresAuth = true, ...fetchOptions } = options;

    // Build headers
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
    };

    // Merge any custom headers from options
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers[key] = String(value);
      });
    }

    // Add auth token if required
    if (requiresAuth) {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.message || errorData.detail || 'Request failed',
          errorData
        );
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(408, 'Request timeout');
        }
        throw new ApiError(0, error.message);
      }

      throw new ApiError(0, 'Unknown error occurred');
    }
  }

  /**
   * @desc GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * @desc POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * @desc PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * @desc PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * @desc DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
