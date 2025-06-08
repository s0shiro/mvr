import { useQuery, useMutation } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axiosInstance'

export function useDrivers() {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/api/drivers')
      return data
    },
  })
}

export function useCreateDriver() {
  return useMutation({
    mutationFn: async (driver) => {
      const { data } = await axiosInstance.post('/api/drivers', driver)
      return data
    },
  })
}

export function useUpdateDriver() {
  return useMutation({
    mutationFn: async ({ id, ...driver }) => {
      const { data } = await axiosInstance.put(`/api/drivers/${id}`, driver)
      return data
    },
  })
}

export function useDeleteDriver() {
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.delete(`/api/drivers/${id}`)
      return data
    },
  })
}
