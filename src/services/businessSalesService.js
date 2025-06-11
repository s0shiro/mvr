import axiosInstance from '@/lib/axiosInstance'

export const fetchBusinessSales = async (businessId, page = 1, perPage = 10) => {
  const { data } = await axiosInstance.get(`/api/businesses/${businessId}/sales`, {
    params: { page, per_page: perPage },
  })
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

export async function fetchBusinessSalesSummary(businessId, params = {}) {
  const { data } = await axiosInstance.get(`/api/businesses/${businessId}/sales/summary`, {
    params,
  })
  return data
}
