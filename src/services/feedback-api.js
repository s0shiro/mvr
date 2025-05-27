import axiosInstance from '@/lib/axiosInstance'

export const feedbackApi = {
  async submitFeedback({ booking_id, rating, comment }) {
    const response = await axiosInstance.post('/api/feedback', {
      booking_id,
      rating,
      comment,
    })
    return response.data.feedback
  },
  async getFeedbackByBooking(bookingId) {
    const response = await axiosInstance.get(`/api/feedback/booking/${bookingId}`)
    return response.data
  },
  async getFeedbackByVehicle(vehicleId) {
    const response = await axiosInstance.get(`/api/feedback/vehicle/${vehicleId}`)
    return response.data
  },
}

// --- vue-query composables ---
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export function useVehicleFeedbackQuery(vehicleId, options = {}) {
  return useQuery({
    queryKey: ['vehicle-feedback', vehicleId],
    queryFn: () => feedbackApi.getFeedbackByVehicle(vehicleId),
    enabled: !!vehicleId,
    ...options,
  })
}

export function useBookingFeedbackQuery(bookingId, options = {}) {
  return useQuery({
    queryKey: ['booking-feedback', bookingId],
    queryFn: () => feedbackApi.getFeedbackByBooking(bookingId),
    enabled: !!bookingId,
    ...options,
  })
}

export function useSubmitFeedbackMutation(vehicleId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: feedbackApi.submitFeedback,
    onSuccess: () => {
      if (vehicleId) {
        queryClient.invalidateQueries(['vehicle-feedback', vehicleId])
      }
    },
  })
}
