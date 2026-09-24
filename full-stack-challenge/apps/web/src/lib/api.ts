import type { ApiErrorResponse } from '@dynamox/types';
import axios from 'axios';
import { dictionaries, getStoredLanguage } from './i18n/translations';

const TOKEN_STORAGE_KEY = 'dynamox.token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
});

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-Language'] = getStoredLanguage();

  return config;
});

export function extractErrorMessage(error: unknown): string {
  const language = getStoredLanguage();

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error ?? dictionaries[language]['common.connectionError'];
  }

  return dictionaries[language]['common.unexpectedError'];
}