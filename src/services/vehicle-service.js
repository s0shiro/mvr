import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axiosInstance'

// Query keys for better cache management
export const vehicleKeys = {
  all: ['vehicles'],
  lists: () => [...vehicleKeys.all, 'list'],
  list: (filters) => [...vehicleKeys.lists(), { filters }],
  details: () => [...vehicleKeys.all, 'detail'],
  detail: (id) => [...vehicleKeys.details(), id],
}

export function useVehicles(filters = {}) {
  return useInfiniteQuery({
    queryKey: vehicleKeys.list(filters),
    queryFn: async ({ pageParam = 0 }) => {
      // Ensure we're using the reactive object's current value
      const currentFilters =
        typeof filters === 'object' && 'value' in filters ? filters.value : filters

      const response = await axiosInstance.get('/api/vehicles', {
        params: {
          ...currentFilters,
          cursor: pageParam,
          limit: 10,
        },
      })
      return response.data
    },
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor,
    initialPageParam: 0,
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicleData) => {
      const response = await axiosInstance.post('/api/vehicles', vehicleData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate vehicles list to refetch
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
  });
}
