import { useQuery } from '@tanstack/vue-query'
import { computed, watch, onMounted } from 'vue'
import { authApi } from '@/services/auth-api'
import { useAuthStore } from '@/stores/authStore'

export function useUserAuth() {
  const authStore = useAuthStore()

  // Get the current user's ID from the auth store
  const currentUserId = computed(() => authStore.user?.id)

  const fetchUser = async () => {
    const { data } = await authApi.getCurrentUser()
    return data
  }

  // Create the query with the current user ID in the query key
  const query = useQuery({
    queryKey: ['user', currentUserId],
    queryFn: fetchUser,
    refetchOnWindowFocus: false,
    staleTime: 5 * 1000, // 5 seconds
    enabled: computed(() => !!authStore.isAuthenticated),
    onSuccess: (data) => {
      // Optionally update the store here
      authStore.updateUserRolesAndPermissions(data)
    },
    onError: (err) => {
      console.error('Error fetching user:', err)
    },
  })

  // Watch for user ID changes and force refetch when it changes
  watch(currentUserId, (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
      query.refetch()
    }
  })

  // Force refetch on mount to ensure fresh data
  onMounted(() => {
    query.refetch()
  })

  return {
    // User data from TanStack Query
    userData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    // Permission check methods from the auth store (only hasRole for now)
    hasRole: (role) => authStore.hasRole(role),
    isAdmin: () => authStore.hasRole('admin'),

    // Auth store getters
    isAuthenticated: () => authStore.isAuthenticated,
    role: () => authStore.role,
  }
}
