import axiosInstance from '@/lib/axiosInstance'
import { useQuery } from '@tanstack/vue-query'
import { computed, unref } from 'vue'

export function useAdminCanceledBookings(sortBy = 'created_at', sortOrder = 'desc') {
  // Create computed values that properly unwrap refs
  const sortByValue = computed(() => unref(sortBy))
  const sortOrderValue = computed(() => unref(sortOrder))
  
  return useQuery({
    queryKey: ['admin', 'canceled-bookings', sortByValue, sortOrderValue],
    queryFn: () =>
      axiosInstance.get('/api/admin/bookings/canceled', {
        params: {
          sort_by: sortByValue.value,
          sort_order: sortOrderValue.value
        }
      }).then((res) => res.data.bookings || []),
  })
}
