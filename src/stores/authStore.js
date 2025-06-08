import { defineStore } from 'pinia'
// Update import to use the new service location
import { authApi } from '@/services/auth-api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    loggingIn: false,
    error: null,
    userRole: null, // single role
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    isLoading: (state) => state.loading,
    isLoggingIn: (state) => state.loggingIn,
    authError: (state) => state.error,
    role: (state) => state.userRole,
    isVerified: (state) => {
      if (!state.user) return false
      if (typeof state.user.email_verified !== 'undefined') {
        return state.user.email_verified === true
      }
      // Fallback: check email_verified_at (non-null means verified)
      return Boolean(state.user.email_verified_at)
    },
  },

  actions: {
    /**
     * Check if user is authenticated by fetching user data
     */
    async checkAuth() {
      if (this.loading) return

      this.loading = true
      this.error = null

      try {
        const response = await authApi.getCurrentUser()

        if (response.status === 200) {
          this.user = response.data
          this.userRole = response.data.role || null
          return this.user
        } else {
          this.clearUserData()
          throw new Error('Authentication check failed')
        }
      } catch (err) {
        this.clearUserData()
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Clear all user-related data
     */
    clearUserData() {
      this.user = null
      this.userRole = null
    },

    /**
     * Login user with username/email and password
     */
    async login(credentials) {
      this.loggingIn = true
      this.error = null
      this.clearUserData()

      try {
        const response = await authApi.login({
          login: credentials.login,
          password: credentials.password,
        })

        if (response.data.status === 'success') {
          this.user = response.data.user
          this.updateUserRolesAndPermissions(response.data.user)
          this.router.push({ name: 'overview' }) // Redirect to overview after login
          return { success: true, data: response.data }
        }
        throw new Error(response.data.message || 'Login failed')
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed'
        const errors = err.response?.data?.errors || {}
        if (!Object.keys(errors).length && this.error) {
          errors.general = [this.error]
        }
        return { success: false, errors }
      } finally {
        this.loggingIn = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      this.clearUserData()

      try {
        const response = await authApi.register(userData)
        if (response.data.status === 'success') {
          this.user = response.data.user
          this.updateUserRolesAndPermissions(response.data.user)
          // Do not redirect here, let the Register view handle verification
          return { success: true, data: response.data }
        }
        throw new Error(response.data.message || 'Registration failed')
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed'
        const errors = err.response?.data?.errors || {}
        if (!Object.keys(errors).length && this.error) {
          errors.general = [this.error]
        }
        return { success: false, errors }
      } finally {
        this.loading = false
      }
    },

    /**
     * Logout the current user
     */
    async logout() {
      this.loading = true

      try {
        await authApi.logout()
        this.clearUserData()
        this.router.push({ name: 'login' })
        return { success: true }
      } catch (err) {
        console.error('Logout failed', err)
        this.clearUserData()
        return { success: false, error: 'Logout failed' }
      } finally {
        this.loading = false
      }
    },

    /**
     * Update user roles and permissions
     */
    updateUserRolesAndPermissions(userData) {
      if (userData) {
        this.userRole = userData.role || null
      } else {
        this.userRole = null
      }
    },

    /**
     * Check if user has a specific role
     */
    hasRole(role) {
      if (!this.userRole) return false
      if (Array.isArray(role)) {
        return role.includes(this.userRole)
      }
      return this.userRole === role
    },
  },
})
