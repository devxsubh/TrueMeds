import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE}/api/v1/auth/refresh-tokens`, {
            refreshToken,
          });

          // Server response: { success: true, data: { tokens: { accessToken: {token, expires}, refreshToken: {token, expires} } } }
          if (response.data.data && response.data.data.tokens) {
            const newAccessToken = response.data.data.tokens.accessToken.token;
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken.token);
            
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION ====================

export const authAPI = {
  signup: async (data) => {
    const response = await api.post('/api/v1/auth/signup', data);
    // Server response: { success: true, data: { user, tokens: { accessToken: {token, expires}, refreshToken: {token, expires} } } }
    if (response.data.data && response.data.data.tokens) {
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken.token);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken.token);
    }
    return response.data;
  },

  signin: async (data) => {
    const response = await api.post('/api/v1/auth/signin', data);
    // Server response: { success: true, data: { user, tokens: { accessToken: {token, expires}, refreshToken: {token, expires} } } }
    if (response.data.data && response.data.data.tokens) {
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken.token);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken.token);
    }
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/api/v1/auth/signout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  refreshTokens: async (refreshToken) => {
    const response = await api.post('/api/v1/auth/refresh-tokens', { refreshToken });
    // Server response: { success: true, data: { tokens: { accessToken: {token, expires}, refreshToken: {token, expires} } } }
    if (response.data.data && response.data.data.tokens) {
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken.token);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken.token);
    }
    return response.data;
  },

  forgotPassword: async (email) => {
    return api.post('/api/v1/auth/forgot-password', { email });
  },

  resetPassword: async (token, password) => {
    // Token is in query string, password is in body
    return api.post(`/api/v1/auth/reset-password?token=${token}`, { password });
  },
};

// ==================== ML SERVICE ====================

export const mlAPI = {
  health: async () => {
    return api.get('/api/v1/ml/health');
  },

  classify: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/ml/classify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ==================== RAG SERVICE ====================

export const ragAPI = {
  // New endpoint - Upload image and get imageId
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/rag/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // New endpoint - Chat with Gemini Vision using imageId
  chat: async (imageId, message) => {
    const response = await api.post('/api/v1/rag/chat', {
      imageId,
      message,
    });
    return response.data;
  },

  // Legacy endpoints for backward compatibility
  processImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/rag/process-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  chatLegacy: async (question, sessionId) => {
    const response = await api.post('/api/v1/rag/chat-legacy', {
      question,
      sessionId,
    });
    return response.data;
  },
};

// ==================== USER MANAGEMENT ====================

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/v1/auth/me', data);
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await api.get('/api/v1/users', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/api/v1/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, data) => {
    const response = await api.put(`/api/v1/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId) => {
    return api.delete(`/api/v1/users/${userId}`);
  },
};

// ==================== IMAGE MANAGEMENT ====================

export const imageAPI = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/api/v1/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ==================== ROLE MANAGEMENT ====================

export const roleAPI = {
  getAllRoles: async () => {
    const response = await api.get('/api/v1/roles');
    return response.data;
  },

  getRoleById: async (roleId) => {
    const response = await api.get(`/api/v1/roles/${roleId}`);
    return response.data;
  },

  createRole: async (data) => {
    const response = await api.post('/api/v1/roles', data);
    return response.data;
  },

  updateRole: async (roleId, data) => {
    const response = await api.put(`/api/v1/roles/${roleId}`, data);
    return response.data;
  },

  deleteRole: async (roleId) => {
    return api.delete(`/api/v1/roles/${roleId}`);
  },
};

// Export default api instance
export default api;
