import axiosInstance from '@/lib/axiosInstance'
import { useMutation } from '@tanstack/vue-query'

export function useSubmitVehicleReturn() {
  return useMutation({
    mutationFn: ({ bookingId, ...data }) =>
      axiosInstance.post(`/api/bookings/${bookingId}/submit-return`, data).then((res) => res.data),
  })
}
