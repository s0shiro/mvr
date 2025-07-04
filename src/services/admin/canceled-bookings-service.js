import axiosInstance from '@/lib/axiosInstance'
import { useQuery } from '@tanstack/vue-query'

export function useAdminCanceledBookings() {
  return useQuery({
    queryKey: ['admin', 'canceled-bookings'],
    queryFn: () =>
      axiosInstance.get('/api/admin/bookings/canceled').then((res) => res.data.bookings || []),
  })
}
