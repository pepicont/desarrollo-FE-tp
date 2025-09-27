import axios from 'axios';

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api';

export const API_BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const buildApiUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
