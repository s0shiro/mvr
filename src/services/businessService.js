import axiosInstance from '@/lib/axiosInstance'

export const fetchBusinesses = async () => {
  const { data } = await axiosInstance.get('/api/businesses')
  return data
}

export const createBusiness = async (payload) => {
  const { data } = await axiosInstance.post('/api/businesses', payload)
  return data
}

export const updateBusiness = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/api/businesses/${id}`, payload)
  return data
}

export const deleteBusiness = async (id) => {
  const { data } = await axiosInstance.delete(`/api/businesses/${id}`)
  return data
}
