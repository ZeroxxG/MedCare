import api from './api';

export const authService = {
  register: async (userData) => {
    const res = await api.post('/auth/register/', userData);
    if (res.data.tokens?.access) {
      localStorage.setItem('access_token', res.data.tokens.access);
      localStorage.setItem('refresh_token', res.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login/', {
      email: credentials.email,
      password: credentials.password,
    });
    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  googleLogin: async (idToken, role, extraData = {}) => {
    const res = await api.post('/auth/google/', { id_token: idToken, role, ...extraData });
    if (res.data.tokens?.access) {
      localStorage.setItem('access_token', res.data.tokens.access);
      localStorage.setItem('refresh_token', res.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me/');
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password/', { email });
    return res.data;
  },

  resetPassword: async (data) => {
    const res = await api.post('/auth/reset-password/', data);
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.post('/auth/change-password/', data);
    return res.data;
  },
};
