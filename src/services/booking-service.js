import { useMutation, useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axiosInstance'

export function useBookingSummary() {
  return async ({
    vehicle_id,
    start_date,
    end_date,
    driver_requested,
    pickup_type,
    delivery_location,
  }) => {
    const res = await axiosInstance.post('/api/bookings/summary', {
      vehicle_id,
      start_date,
      end_date,
      driver_requested,
      pickup_type,
      delivery_location,
    })
    return res.data
  }
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post('/api/bookings', data, {
        headers: { 'Content-Type': 'application/json' },
      })
      return res.data
    },
  })
}

export function useUpdateBooking() {
  return useMutation({
    mutationFn: async ({ bookingId, ...data }) => {
      const res = await axiosInstance.put(`/api/bookings/${bookingId}`, data)
      return res.data
    },
  })
}

export function useCancelBooking() {
  return useMutation({
    mutationFn: async (bookingId) => {
      const res = await axiosInstance.post(`/api/bookings/${bookingId}/cancel`)
      return res.data
    },
  })
}

export const fetchPaymentMethods = async () => {
  const { data } = await axiosInstance.get('/api/payment-methods')
  return data
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: fetchPaymentMethods,
  })
}

export function useSubmitPayment() {
  return useMutation({
    mutationFn: async ({ bookingId, method, reference_number, proof_image, type = 'deposit' }) => {
      const res = await axiosInstance.post(`/api/bookings/${bookingId}/payment`, {
        method,
        reference_number,
        proof_image,
        type,
      })
      return res.data
    },
  })
}

export function useGetPayment() {
  return async (bookingId, type = 'deposit') => {
    const res = await axiosInstance.get(`/api/bookings/${bookingId}/payment`, {
      params: { type },
    })
    return res.data
  }
}

export function useUpdatePaymentStatus() {
  return useMutation({
    mutationFn: async ({ bookingId, status }) => {
      const res = await axiosInstance.patch(`/api/bookings/${bookingId}/payment/status`, { status })
      return res.data
    },
  })
}

export function useMyBookings() {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/mybookings')
      return res.data.bookings
    },
  })
}
