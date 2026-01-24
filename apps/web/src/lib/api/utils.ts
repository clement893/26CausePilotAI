/**
 * API Utilities
 * Helper functions for working with API responses
 */

import type { ApiResponse } from '@modele/types';

/**
 * Type guard to check if response is ApiResponse
 */
export function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    typeof (response as ApiResponse<T>).success === 'boolean'
  );
}

/**
 * Extract data from API response (handles both ApiResponse<T> and direct T)
 * FastAPI may return data directly or wrapped in ApiResponse
 * Also handles Axios response objects (response.data)
 */
export function extractApiData<T>(response: ApiResponse<T> | T | { data?: T }): T {
  console.log('[extractApiData] Input:', {
    type: typeof response,
    isObject: typeof response === 'object' && response !== null,
    hasData: response && typeof response === 'object' && 'data' in response,
    keys: response && typeof response === 'object' ? Object.keys(response) : []
  });
  
  // Handle Axios response object (response.data contains the actual data)
  if (response && typeof response === 'object' && 'data' in response && 'status' in response) {
    console.log('[extractApiData] Detected Axios response, extracting from response.data');
    const axiosResponse = response as { data: T; status: number; [key: string]: any };
    const extracted = axiosResponse.data;
    console.log('[extractApiData] Extracted from Axios response.data:', extracted);
    return extracted;
  }
  
  // Handle ApiResponse wrapper
  if (isApiResponse(response)) {
    console.log('[extractApiData] Detected ApiResponse wrapper');
    // If response.data exists, use it; otherwise response itself might be the data
    const extracted = (response.data !== undefined && response.data !== null ? response.data : response) as T;
    console.log('[extractApiData] Extracted from ApiResponse:', extracted);
    return extracted;
  }
  
  // Direct data (FastAPI often returns data directly)
  console.log('[extractApiData] Using response directly as data');
  return response as T;
}
