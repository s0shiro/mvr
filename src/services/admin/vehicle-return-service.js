import axiosInstance from '@/lib/axiosInstance'
import { useQuery, useMutation } from '@tanstack/vue-query'

export function useAdminVehicleReturns() {
  return useQuery({
    queryKey: ['admin', 'vehicle-returns'],
    queryFn: () =>
      axiosInstance.get('/api/admin/bookings/for-return').then((res) => res.data.bookings || []),
  })
}

export function useReturnVehicle() {
  return useMutation({
    mutationFn: ({ bookingId, ...data }) =>
      axiosInstance.post(`/api/admin/bookings/${bookingId}/return`, data).then((res) => res.data),
  })
}
