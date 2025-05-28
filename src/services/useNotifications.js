import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axiosInstance'

const fetchNotifications = async () => {
  const response = await axiosInstance.get('/api/notifications')
  return response.data
}

const markAsReadMutation = async (notificationId) => {
  const response = await axiosInstance.post(`/api/notifications/${notificationId}/read`)
  return response.data
}

const markAllAsReadMutation = async () => {
  const response = await axiosInstance.post('/api/notifications/mark-all-read')
  return response.data
}

export function useNotifications() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const markAsRead = useMutation({
    mutationFn: markAsReadMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllAsRead = useMutation({
    mutationFn: markAllAsReadMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  return {
    data,
    isLoading,
    error,
    markAsRead: (id) => markAsRead.mutate(id),
    markAllAsRead: () => markAllAsRead.mutate(),
  }
}
