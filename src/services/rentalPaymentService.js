import axiosInstance from '@/lib/axiosInstance'

// Fetch rental payments (transactions) for the rental system
export const fetchRentalPayments = async (page = 1, perPage = 10) => {
  const { data } = await axiosInstance.get('/api/rental/payments', {
    params: { page, per_page: perPage },
  })
  return data
}

// Fetch rental payment summary for reports
export const fetchRentalPaymentsSummary = async (params = {}) => {
  const { data } = await axiosInstance.get('/api/rental/payments/summary', {
    params,
  })
  return data
}

// Get total rental revenue
export const fetchRentalRevenue = async () => {
  const { data } = await axiosInstance.get('/api/rental/revenue')
  return data
}
