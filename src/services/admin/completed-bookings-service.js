import axiosInstance from '@/lib/axiosInstance'
import { useQuery } from '@tanstack/vue-query'

export function useAdminCompletedBookings() {
  return useQuery({
    queryKey: ['admin', 'completed-bookings'],
    queryFn: () =>
      axiosInstance.get('/api/admin/bookings/completed').then((res) => res.data.bookings || []),
  })
}
