import axiosInstance from '@/lib/axiosInstance'
import { useQuery, useMutation } from '@tanstack/vue-query'

export function useAdminVehicleReleases() {
  return useQuery({
    queryKey: ['admin', 'vehicle-releases'],
    queryFn: () =>
      axiosInstance.get('/api/admin/bookings/for-release').then((res) => res.data.bookings || []),
  })
}

export function useReleaseVehicle() {
  return useMutation({
    mutationFn: ({ bookingId, ...data }) =>
      axiosInstance.post(`/api/admin/bookings/${bookingId}/release`, data).then((res) => res.data),
  })
}
