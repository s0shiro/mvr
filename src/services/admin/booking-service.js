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
