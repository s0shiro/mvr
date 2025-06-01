import axiosInstance from '@/lib/axiosInstance'

export const fetchPaymentMethods = async () => {
  const { data } = await axiosInstance.get('/api/admin/payment-methods')
  return data
}

export const createPaymentMethod = async (payload) => {
  const { data } = await axiosInstance.post('/api/admin/payment-methods', payload)
  return data
}

export const updatePaymentMethod = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/api/admin/payment-methods/${id}`, payload)
  return data
}

export const deletePaymentMethod = async (id) => {
  const { data } = await axiosInstance.delete(`/api/admin/payment-methods/${id}`)
  return data
}
