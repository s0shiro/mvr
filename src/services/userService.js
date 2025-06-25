import { useInfiniteQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axiosInstance'

export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters) => [...userKeys.lists(), { filters }],
}

export function useUsers(filters = {}) {
  return useInfiniteQuery({
    queryKey: userKeys.list(filters),
    queryFn: async ({ pageParam = null }) => {
      // Ensure we get the raw value if filters is a ref
      const filterValue = filters.value || filters
      const response = await axiosInstance.get('/api/admin/users', {
        params: {
          cursor: pageParam,
          per_page: 3,
          ...filterValue,
        },
      })
      return response.data
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    initialPageParam: null,
    select: (data) => {
      // Ensure we return the full data structure
      return {
        pages: data.pages,
        pageParams: data.pageParams,
      }
    },
  })
}

export async function addUser(data) {
  const response = await axiosInstance.post('/api/admin/users', data)
  return response.data
}
