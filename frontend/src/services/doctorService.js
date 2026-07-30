import api from './api';

export const doctorService = {
  getSpecializations: async () => {
    const res = await api.get('/doctors/specializations/');
    return res.data.results || res.data;
  },

  getDoctors: async (params = {}) => {
    const res = await api.get('/doctors/list/', { params });
    return res.data;
  },

  getDoctorById: async (id) => {
    const res = await api.get(`/doctors/list/${id}/`);
    return res.data;
  },

  getDoctorSlots: async (doctorId, date) => {
    const res = await api.get(`/doctors/${doctorId}/slots/`, {
      params: { date },
    });
    return res.data;
  },

  getSelfProfile: async () => {
    const res = await api.get('/doctors/me/');
    return res.data;
  },

  updateSelfProfile: async (data) => {
    const res = await api.patch('/doctors/me/', data);
    return res.data;
  },

  getAvailabilities: async () => {
    const res = await api.get('/doctors/availabilities/');
    return res.data;
  },

  addAvailability: async (data) => {
    const res = await api.post('/doctors/availabilities/', data);
    return res.data;
  },
};
