import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (email: string, password: string) =>
    api.post('/api/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
};

// Wallet API
export const walletApi = {
  getBalance: () => api.get('/api/wallet'),
  claimDailyBonus: () => api.post('/api/wallet/daily-bonus'),
  getTransactions: (page = 0, size = 20) =>
    api.get(`/api/wallet/transactions?page=${page}&size=${size}`),
};

// Events API
export const eventsApi = {
  getOpenEvents: () => api.get('/api/events'),
  getEvent: (id: string) => api.get(`/api/events/${id}`),
};

// Bets API
export const betsApi = {
  placeBet: (eventId: string, optionId: string, amount: number) =>
    api.post('/api/bets', { eventId, optionId, amount }),
  getMyBets: () => api.get('/api/bets'),
};

// Money Requests API
export const moneyRequestsApi = {
  createRequest: (amount: number, reason: string) =>
    api.post('/api/money-requests', { amount, reason }),
  getMyRequests: () => api.get('/api/money-requests'),
};

// Admin API
export const adminApi = {
  getAllEvents: () => api.get('/api/admin/events'),
  createEvent: (data: any) => api.post('/api/admin/events', data),
  updateEventStatus: (id: string, status: string) =>
    api.patch(`/api/admin/events/${id}/status`, { status }),
  settleEvent: (id: string, winnerOptionId: string) =>
    api.post(`/api/admin/events/${id}/settle`, { winnerOptionId }),
  getPendingMoneyRequests: () => api.get('/api/admin/money-requests'),
  approveMoneyRequest: (id: string) =>
    api.post(`/api/admin/money-requests/${id}/approve`),
  rejectMoneyRequest: (id: string) =>
    api.post(`/api/admin/money-requests/${id}/reject`),
  getDashboardStatistics: () => api.get('/api/admin/dashboard/statistics'),
};
