import axiosInstance from '@/lib/axiosInstance'

export const fetchBusinessSales = async (businessId) => {
  const { data } = await axiosInstance.get(`/api/businesses/${businessId}/sales`)
  return data
}

// Infinite/cursor-based fetch
export const fetchBusinessSalesInfinite = async ({ businessId, cursor = null }) => {
  const params = cursor ? { cursor } : {}
  const { data } = await axiosInstance.get(`/api/businesses/${businessId}/sales`, { params })
  return data // { data: [...], next_cursor: ... }
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

export async function fetchBusinessSalesSummary(businessId, params = {}) {
  const { data } = await axiosInstance.get(`/api/businesses/${businessId}/sales/summary`, {
    params,
  })
  return data
}
