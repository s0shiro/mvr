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
        deposit:
          vehicleData.deposit !== undefined && vehicleData.deposit !== null
            ? Number(vehicleData.deposit)
            : null,
        fuel_capacity:
          vehicleData.fuel_capacity !== undefined && vehicleData.fuel_capacity !== null
            ? Number(vehicleData.fuel_capacity)
            : null,
        fee_per_kilometer:
          vehicleData.fee_per_kilometer !== undefined && vehicleData.fee_per_kilometer !== null
            ? Number(vehicleData.fee_per_kilometer)
            : null,
        late_fee_per_hour:
          vehicleData.late_fee_per_hour !== undefined && vehicleData.late_fee_per_hour !== null
            ? Number(vehicleData.late_fee_per_hour)
            : null,
        late_fee_per_day:
          vehicleData.late_fee_per_day !== undefined && vehicleData.late_fee_per_day !== null
            ? Number(vehicleData.late_fee_per_day)
            : null,
        gasoline_late_fee_per_liter:
          vehicleData.gasoline_late_fee_per_liter !== undefined &&
          vehicleData.gasoline_late_fee_per_liter !== null
            ? Number(vehicleData.gasoline_late_fee_per_liter)
            : null,
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
      console.log(`Deleting image ${imageId} for vehicle ${vehicleId}`)
      const response = await axiosInstance.delete(`/api/vehicles/${vehicleId}/images/${imageId}`)
      console.log('Image deletion response:', response.data)
      return response.data
    },
    onSuccess: (_, { vehicleId }) => {
      console.log('Image deleted successfully, invalidating queries')
      // Don't invalidate queries immediately to prevent race conditions
      // queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) })
      // queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
    },
    onError: (error, { vehicleId, imageId }) => {
      console.error(`Failed to delete image ${imageId} for vehicle ${vehicleId}:`, error)
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
      const payload = {}

      const trimString = (value) => {
        if (typeof value !== 'string') return value
        const trimmed = value.trim()
        return trimmed === '' ? null : trimmed
      }

      const stringFields = ['name', 'type', 'brand', 'model', 'plate_number', 'status']
      const nullableStringFields = ['description', 'fuel_type', 'color']

      stringFields.forEach((field) => {
        if (vehicleData[field] !== undefined) {
          payload[field] = typeof vehicleData[field] === 'string'
            ? vehicleData[field].trim()
            : vehicleData[field]
        }
      })

      nullableStringFields.forEach((field) => {
        if (vehicleData[field] !== undefined) {
          payload[field] = trimString(vehicleData[field])
        }
      })

      const numericFields = [
        'rental_rate',
        'rental_rate_with_driver',
        'year',
        'capacity',
        'deposit',
        'fuel_capacity',
        'fee_per_kilometer',
        'late_fee_per_hour',
        'late_fee_per_day',
        'gasoline_late_fee_per_liter',
      ]

      numericFields.forEach((field) => {
        if (vehicleData[field] !== undefined) {
          if (vehicleData[field] === null || vehicleData[field] === '') {
            payload[field] = null
          } else {
            payload[field] = Number(vehicleData[field])
          }
        }
      })

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
