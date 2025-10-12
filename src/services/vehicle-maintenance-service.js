import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, unref } from 'vue'
import axiosInstance from '@/lib/axiosInstance'
import { vehicleKeys } from './vehicle-service'

export const vehicleMaintenanceKeys = {
  all: ['vehicle-maintenance'],
  lists: (vehicleId) => [...vehicleMaintenanceKeys.all, 'list', vehicleId],
  list: (vehicleId, filters = {}) => [...vehicleMaintenanceKeys.lists(vehicleId), filters],
}

export function useVehicleMaintenanceList(vehicleIdRef, paramsRef, options = {}) {
  const { enabled, ...rest } = options

  const sanitizedParams = computed(() => {
    const rawParams = unref(paramsRef) || {}
    return Object.fromEntries(
      Object.entries(rawParams).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    )
  })

  const queryKey = computed(() => {
    const vehicleId = unref(vehicleIdRef)
    return vehicleMaintenanceKeys.list(vehicleId, sanitizedParams.value)
  })

  const isEnabled = computed(() => {
    const vehicleId = unref(vehicleIdRef)
    const baseEnabled = !!vehicleId
    if (enabled === undefined) return baseEnabled
    return baseEnabled && !!unref(enabled)
  })

  return useQuery({
    queryKey,
    queryFn: async () => {
      const vehicleId = unref(vehicleIdRef)
      if (!vehicleId) {
        throw new Error('Vehicle ID is required to fetch maintenance history.')
      }

      const response = await axiosInstance.get(`/api/vehicles/${vehicleId}/maintenance`, {
        params: sanitizedParams.value,
      })
      return response.data
    },
    enabled: isEnabled,
    ...rest,
  })
}

export function useCreateVehicleMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ vehicleId, payload }) => {
      const response = await axiosInstance.post(`/api/vehicles/${vehicleId}/maintenance`, payload)
      return response.data
    },
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: vehicleMaintenanceKeys.lists(vehicleId) })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
    },
  })
}
