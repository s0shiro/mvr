import axiosInstance from '@/lib/axiosInstance'

export const authApi = {
  getCurrentUser: () => {
    return axiosInstance.get('/api/user')
  },

  register: (userData) => {
    return axiosInstance.post('/api/register', userData)
  },

  login(credentials) {
    return axiosInstance.post('/api/login', credentials)
  },

  logout: () => {
    return axiosInstance.post('/api/logout')
  },

  refreshToken: () => {
    return axiosInstance.post('/api/refresh')
  },

  verifyCode(data) {
    return axiosInstance.post('/api/verify-code', data)
  },

  resendVerificationCode(data) {
    return axiosInstance.post('/api/resend-verification-code', data)
  },
}
