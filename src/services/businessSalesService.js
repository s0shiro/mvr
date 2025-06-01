import axiosInstance from '@/lib/axiosInstance'

export const fetchBusinessSales = async (businessId) => {
  const { data } = await axiosInstance.get(`/api/businesses/${businessId}/sales`)
  return data
}

export const createBusinessSale = async ({ businessId, ...payload }) => {
  const { data } = await axiosInstance.post(`/api/businesses/${businessId}/sales`, payload)
  return data
}

export const updateBusinessSale = async ({ businessId, id, ...payload }) => {
  const { data } = await axiosInstance.put(`/api/businesses/${businessId}/sales/${id}`, payload)
  return data
}

export const deleteBusinessSale = async ({ businessId, id }) => {
  const { data } = await axiosInstance.delete(`/api/businesses/${businessId}/sales/${id}`)
  return data
}
