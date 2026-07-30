import api from './api';

export const reviewService = {
  createReview: async (appointmentId, rating, comment) => {
    const res = await api.post('/reviews/', {
      appointment_id: appointmentId,
      rating,
      comment,
    });
    return res.data;
  },

  getDoctorReviews: async (doctorId) => {
    const res = await api.get(`/reviews/doctor/${doctorId}/`);
    return res.data.results || res.data;
  },
};
