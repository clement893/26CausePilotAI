/**
 * Error Handling Utilities - Extract message/detail/status from errors
 */

import { AxiosError, AxiosRequestConfig } from 'axios';
import { AppError } from './AppError';

export interface ApiError extends Error {
  response?: {
    status: number;
    statusText: string;
    data?: {
      detail?: string;
      message?: string;
      errors?: Record<string, unknown>;
    };
    headers?: Record<string, string>;
    config?: AxiosRequestConfig;
  };
  config?: AxiosRequestConfig;
  isAxiosError?: boolean;
  statusCode?: number;
}

export function isApiError(error: unknown): error is ApiError {
  if (!error || typeof error !== 'object') return false;
  return 'response' in error || 'isAxiosError' in error || 'statusCode' in error;
}

export function isAxiosErrorType(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as { isAxiosError?: boolean }).isAxiosError === true
  );
}

export function getErrorMessage(error: unknown, fallback?: string): string {
  if (error instanceof AppError) {
    return error.message || fallback || 'An error occurred';
  }
  if (isApiError(error)) {
    if (error.response?.data?.detail) return error.response.data.detail;
    if (error.response?.data?.message) return error.response.data.message;
    if ('message' in error && typeof error.message === 'string') return error.message;
    return fallback || 'An error occurred';
  }
  if (error instanceof Error) return error.message || fallback || 'An error occurred';
  if (typeof error === 'string') return error;
  return fallback || 'An unknown error occurred';
}

export function getErrorDetail(error: unknown): string | undefined {
  if (error instanceof AppError) {
    if (error.details && typeof error.details === 'object' && 'detail' in error.details) {
      return String(error.details.detail);
    }
    return undefined;
  }
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'detail' in error.response.data
  ) {
    return String(error.response.data.detail);
  }
  return undefined;
}

export function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof AppError) return error.statusCode;
  if (isApiError(error)) return error.response?.status || error.statusCode;
  if (isAxiosErrorType(error)) return error.response?.status;
  return undefined;
}
