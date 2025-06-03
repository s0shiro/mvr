import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axiosInstance'

export function useBookingSummaryDetails(bookingId) {
  return useQuery({
    queryKey: ['booking-summary-details', bookingId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/bookings/${bookingId}/summary-details`)
      return data.booking_summary
    },
    enabled: !!bookingId,
  })
}
