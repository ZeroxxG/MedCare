import api from './api';

export const paymentService = {
  initiatePayment: async (appointmentId, gateway = 'STRIPE') => {
    const res = await api.post('/payments/initiate/', {
      appointment_id: appointmentId,
      gateway,
    });
    return res.data;
  },

  verifyPayment: async (data) => {
    const res = await api.post('/payments/verify/', data);
    return res.data;
  },

  getPaymentHistory: async () => {
    const res = await api.get('/payments/history/');
    return res.data.results || res.data;
  },

  getReceipt: async (appointmentId) => {
    const res = await api.get(`/payments/receipt/${appointmentId}/`);
    return res.data;
  },
};
