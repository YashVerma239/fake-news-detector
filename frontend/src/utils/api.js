// src/utils/api.js
// Centralized Axios instance with auth interceptors

import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// ── Request Interceptor: Attach JWT token ────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fnd_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle auth errors ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-logout on 401 (expired/invalid token)
    if (error.response?.status === 401) {
      localStorage.removeItem('fnd_token');
      localStorage.removeItem('fnd_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth Endpoints ────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data)  => api.post('/auth/signup', data),
  login:  (data)  => api.post('/auth/login',  data),
  getMe:  ()      => api.get('/auth/me'),
};

// ── Analyze Endpoint ──────────────────────────────────────────────────────────
export const analyzeAPI = {
  analyze: (data) => api.post('/analyze', data),
};

// ── History Endpoints ─────────────────────────────────────────────────────────
export const historyAPI = {
  getHistory:    (params) => api.get('/history', { params }),
  getStats:      ()       => api.get('/history/stats'),
  deleteEntry:   (id)     => api.delete(`/history/${id}`),
  clearHistory:  ()       => api.delete('/history'),
};

export default api;
