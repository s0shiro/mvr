import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axiosInstance'

async function fetchAdminOverview() {
  const { data } = await axiosInstance.get('/api/admin/overview')
  return data
}

export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin-overview'],
    queryFn: fetchAdminOverview,
  })
}
