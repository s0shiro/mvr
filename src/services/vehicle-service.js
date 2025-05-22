import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axiosInstance'

// Query keys for better cache management
export const vehicleKeys = {
  all: ['vehicles'],
  lists: () => [...vehicleKeys.all, 'list'],
  list: (filters) => [...vehicleKeys.lists(), { filters }],
  details: () => [...vehicleKeys.all, 'detail'],
  detail: (id) => [...vehicleKeys.details(), id],
  images: () => [...vehicleKeys.all, 'images'],
  image: (vehicleId, imageId) => [...vehicleKeys.images(), vehicleId, imageId],
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

export function useVehicleDetails(vehicleId) {
  return useQuery({
    queryKey: vehicleKeys.detail(vehicleId),
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/vehicles/${vehicleId}`)
      return response.data
    },
    enabled: !!vehicleId,
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vehicleData) => {
      // Ensure numeric values
      const payload = {
        ...vehicleData,
        rental_rate: Number(vehicleData.rental_rate),
        rental_rate_with_driver: Number(vehicleData.rental_rate_with_driver),
        year: Number(vehicleData.year),
        capacity: Number(vehicleData.capacity),
      }
      const response = await axiosInstance.post('/api/vehicles', payload)
      return response.data
    },
  })
}

export function useUploadVehicleImages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ vehicleId, images }) => {
      // Convert image files to base64
      const base64Images = await Promise.all(
        images.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target.result)
            reader.onerror = (e) => reject(e)
            reader.readAsDataURL(file)
          })
        }),
      )

      const response = await axiosInstance.post(`/api/vehicles/${vehicleId}/images`, {
        images: base64Images,
      })
      return response.data
    },
    onSuccess: (_, { vehicleId }) => {
      // Invalidate both vehicle details and list to refetch with new images
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
    },
  })
}

export function useDeleteVehicleImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ vehicleId, imageId }) => {
      const response = await axiosInstance.delete(`/api/vehicles/${vehicleId}/images/${imageId}`)
      return response.data
    },
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
    },
  })
}

export function useSetPrimaryImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ vehicleId, imageId }) => {
      const response = await axiosInstance.put(
        `/api/vehicles/${vehicleId}/images/${imageId}/primary`,
      )
      return response.data
    },
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
    },
  })
}

export function useReorderVehicleImages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ vehicleId, imageIds }) => {
      const response = await axiosInstance.put(`/api/vehicles/${vehicleId}/images/reorder`, {
        image_ids: imageIds,
      })
      return response.data
    },
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
    },
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ vehicleId, vehicleData }) => {
      // Ensure numeric values
      const payload = {
        ...vehicleData,
        rental_rate: Number(vehicleData.rental_rate),
        rental_rate_with_driver: Number(vehicleData.rental_rate_with_driver),
        year: Number(vehicleData.year),
        capacity: Number(vehicleData.capacity),
      }
      const response = await axiosInstance.put(`/api/vehicles/${vehicleId}`, payload)
      return response.data
    },
    mutationKey: ['update-vehicle'],
    onSuccess: (data, variables) => {
      // Invalidate both vehicle details and list to refetch with updated info
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(String(variables.vehicleId)) })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
    },
  })
}
