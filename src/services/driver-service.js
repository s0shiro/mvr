import { useQuery, useMutation } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axiosInstance'
import { computed } from 'vue'

export function useDrivers(pageRef, perPageRef, searchRef) {
  return useQuery({
    queryKey: computed(() => ['drivers', pageRef.value, perPageRef.value, searchRef.value]),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/api/drivers', {
        params: { page: pageRef.value, per_page: perPageRef.value, search: searchRef.value },
      })
      return data
    },
    keepPreviousData: true,
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
