import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axiosInstance'

export function useMyCompletedBookingsQuery(options = {}) {
  return useQuery({
    queryKey: ['my-completed-bookings'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/mybookings/completed')
      return response.data.completed_bookings
    },
    ...options,
  })
}
