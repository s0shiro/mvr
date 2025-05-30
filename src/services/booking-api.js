import axios from 'axios'

export const bookingApi = {
  async createBooking(data) {
    return axios.post('/api/bookings', {
      ...data,
      driver_requested: data.driver_requested || false,
    })
  },
  async getBookingSummary(data) {
    return axios.post('/api/bookings/summary', {
      ...data,
      driver_requested: data.driver_requested || false,
      pickup_type: data.pickup_type || 'pickup',
      delivery_location: data.delivery_location,
      delivery_details: data.delivery_details,
    })
  },
  async updateBooking(id, data) {
    return axios.put(`/api/bookings/${id}`, data)
  },
  async cancelBooking(id) {
    return axios.post(`/api/bookings/${id}/cancel`)
  },
  async getBooking(id) {
    return axios.get(`/api/bookings/${id}`)
  },
}

export const paymentApi = {
  async getPaymentMethods() {
    return axios.get('/api/payment-methods')
  },
  async submitPayment(bookingId, data) {
    return axios.post(`/api/bookings/${bookingId}/payment`, data)
  },
  async getPayment(bookingId) {
    return axios.get(`/api/bookings/${bookingId}/payment`)
  },
  async updatePaymentStatus(bookingId, data) {
    return axios.patch(`/api/bookings/${bookingId}/payment/status`, data)
  },
}
