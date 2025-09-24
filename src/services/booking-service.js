import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, unref } from 'vue'
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
    mutationFn: async ({ bookingId, cancellation_reason, refund_method, account_number, account_name, bank_name, refund_notes }) => {
      const payload = { cancellation_reason }
      
      // Include refund information if provided
      if (refund_method) {
        payload.refund_method = refund_method
        payload.account_number = account_number
        payload.account_name = account_name
        payload.bank_name = bank_name
        payload.refund_notes = refund_notes
      }
      
      const res = await axiosInstance.post(`/api/bookings/${bookingId}/cancel`, payload)
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

export function useMyBookings(sortBy = 'created_at', sortOrder = 'desc', statusFilter = '') {
  // Create computed values that properly unwrap refs
  const sortByValue = computed(() => unref(sortBy))
  const sortOrderValue = computed(() => unref(sortOrder))
  const statusFilterValue = computed(() => unref(statusFilter))
  
  return useQuery({
    queryKey: ['my-bookings', sortByValue, sortOrderValue, statusFilterValue],
    queryFn: async () => {
      const params = new URLSearchParams({
        sort_by: sortByValue.value,
        sort_order: sortOrderValue.value,
      })
      
      // Only add status filter if it's not empty
      if (statusFilterValue.value) {
        params.append('status', statusFilterValue.value)
      }
      
      const res = await axiosInstance.get(`/api/mybookings?${params}`)
      return res.data.bookings
    },
  })
}

export function useBookingService() {
  return {
    processRefund: async (bookingId, data) => {
      const res = await axiosInstance.post(`/api/admin/bookings/${bookingId}/process-refund`, data, {
        headers: { 'Content-Type': 'application/json' },
      })
      return res.data
    }
  }
}
