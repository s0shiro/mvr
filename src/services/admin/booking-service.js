import axiosInstance from '@/lib/axiosInstance'
import { useQuery, useMutation } from '@tanstack/vue-query'

export function useAdminBookings() {
  return useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: () => axiosInstance.get('/api/admin/bookings').then((res) => res.data.bookings),
  })
}

export function useConfirmPayment() {
  return useMutation({
    mutationFn: (paymentId) =>
      axiosInstance
        .post(`/api/admin/bookings/payments/${paymentId}/confirm`)
        .then((res) => res.data),
  })
}

export function useRejectPayment() {
  return useMutation({
    mutationFn: (paymentId) =>
      axiosInstance
        .post(`/api/admin/bookings/payments/${paymentId}/reject`)
        .then((res) => res.data),
  })
}

export function useAdminBookingDetails(bookingId) {
  return useQuery({
    queryKey: ['admin', 'booking-details', bookingId],
    queryFn: () =>
      axiosInstance.get(`/api/admin/bookings/${bookingId}`).then((res) => res.data.booking),
    enabled: !!bookingId,
  })
}

export function useAdminCancelBooking() {
  return useMutation({
    mutationFn: async (bookingId) => {
      const res = await axiosInstance.post(`/api/admin/bookings/${bookingId}/cancel`)
      return res.data
    },
  })
}

export function useProcessRefund() {
  return useMutation({
    mutationFn: (data) =>
      axiosInstance
        .post(`/api/admin/bookings/${data.bookingId}/process-refund`, {
          amount: data.amount,
          notes: data.notes,
          refund_proof: data.refund_proof
        })
        .then((res) => res.data),
  })
}
