import api from './api';

export const appointmentService = {
  getAppointments: async (params = {}) => {
    const res = await api.get('/appointments/', { params });
    return res.data;
  },

  bookAppointment: async (data) => {
    const res = await api.post('/appointments/', data);
    return res.data;
  },

  approveAppointment: async (id) => {
    const res = await api.post(`/appointments/${id}/approve/`);
    return res.data;
  },

  rejectAppointment: async (id) => {
    const res = await api.post(`/appointments/${id}/reject/`);
    return res.data;
  },

  completeAppointment: async (id, doctorNotes = '') => {
    const res = await api.post(`/appointments/${id}/complete/`, { doctor_notes: doctorNotes });
    return res.data;
  },

  cancelAppointment: async (id) => {
    const res = await api.post(`/appointments/${id}/cancel/`);
    return res.data;
  },

  rescheduleAppointment: async (id, newTimeSlotId) => {
    const res = await api.post(`/appointments/${id}/reschedule/`, { new_time_slot_id: newTimeSlotId });
    return res.data;
  },
};
