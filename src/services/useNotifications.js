import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axiosInstance'

const NOTIFICATIONS_PER_PAGE = 10

const fetchNotifications = async ({ pageParam = null }) => {
  const response = await axiosInstance.get('/api/notifications', {
    params: {
      cursor: pageParam,
      limit: NOTIFICATIONS_PER_PAGE,
    },
  })
  return response.data
}

const fetchUnreadCount = async () => {
  const response = await axiosInstance.get('/api/notifications/unread-count')
  return response.data.unread_count
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

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['notifications'],
      queryFn: fetchNotifications,
      getNextPageParam: (lastPage) => lastPage?.next_cursor || undefined,
      initialPageParam: null,
      select: (data) => {
        // Flatten notifications from all pages
        const notifications = data.pages.flatMap((page) => page.notifications)
        return {
          notifications,
          pages: data.pages,
          pageParams: data.pageParams,
          has_more: data.pages[data.pages.length - 1]?.has_more,
        }
      },
      refetchInterval: 30000, // Refetch every 30 seconds
    })

  // Unread count query
  const {
    data: unreadCount,
    refetch: refetchUnreadCount,
    isLoading: isUnreadCountLoading,
  } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: 30000,
  })

  const markAsRead = useMutation({
    mutationFn: markAsReadMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })

  const markAllAsRead = useMutation({
    mutationFn: markAllAsReadMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })

  return {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAsRead: (id) => markAsRead.mutate(id),
    markAllAsRead: () => markAllAsRead.mutate(),
    refetch,
    unreadCount,
    isUnreadCountLoading,
    refetchUnreadCount,
  }
}
