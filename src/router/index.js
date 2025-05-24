import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/services/auth-api'
import { createDashboardRoute } from './utils'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    createDashboardRoute({
      path: '/overview',
      name: 'overview',
      view: () => import('../views/Overview.vue'),
      meta: { title: 'Overview', requiresAuth: true },
    }),
    createDashboardRoute({
      path: '/users',
      name: 'users',
      view: () => import('../views/Users.vue'),
      meta: { title: 'Users', requiresAuth: true },
    }),
    createDashboardRoute({
      path: '/vehicles',
      name: 'vehicles',
      view: () => import('../views/Vehicles.vue'),
      meta: { title: 'Vehicles', requiresAuth: true },
    }),
    createDashboardRoute({
      path: '/vehicles/:id',
      name: 'vehicle-details',
      view: () => import('../views/VehicleDetails.vue'),
      meta: { title: 'Vehicle Details', requiresAuth: true },
    }),
    createDashboardRoute({
      path: '/my-bookings',
      name: 'my-bookings',
      view: () => import('../views/MyBookings.vue'),
      meta: { title: 'My Bookings', requiresAuth: true },
    }),
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { requiresGuest: true },
    },
    createDashboardRoute({
      path: '/admin/bookings',
      name: 'admin-bookings',
      view: () => import('../views/admin/Bookings.vue'),
      meta: {
        title: 'Manage Bookings',
        requiresAuth: true,
        requiredRoles: ['admin'],
      },
    }),
    createDashboardRoute({
      path: '/admin/vehicle-releases',
      name: 'admin-vehicle-releases',
      view: () => import('../views/admin/VehicleReleases.vue'),
      meta: {
        title: 'Vehicle Releases',
        requiresAuth: true,
        requiredRoles: ['admin'],
      },
    }),
  ],
})

async function checkAuthAndRoles(authStore, to) {
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
  }

  if (to.meta.requiredRoles && !authStore.role) {
    const response = await authApi.getCurrentUser()
    if (response.data) {
      authStore.updateUserRolesAndPermissions(response.data)
    }
  }

  if (to.meta.requiredRoles) {
    return to.meta.requiredRoles.some((role) => authStore.hasRole(role))
  }

  return true
}

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  try {
    // Allow everyone to access /home
    if (to.path === '/home') {
      return next()
    }

    // Check auth status if not already checked
    if (!authStore.isAuthenticated) {
      await authStore.checkAuth()
    }

    // Prevent authenticated users from accessing guest routes
    if (to.meta.requiresGuest) {
      if (authStore.isAuthenticated) {
        console.log('Authenticated user redirected from guest route')
        return next({ name: 'overview' })
      }
      return next()
    }

    // Handle protected routes
    if (to.meta.requiresAuth) {
      if (!authStore.isAuthenticated) {
        console.log('Unauthenticated user redirected to login')
        return next({ name: 'login' })
      }

      const hasAccess = await checkAuthAndRoles(authStore, to)
      if (!hasAccess) {
        // Optionally show a toast here
        console.log('Access denied: insufficient privileges')
        return next({ name: 'overview' })
      }
    }

    return next()
  } catch (err) {
    console.error('Navigation guard error:', err)
    if (to.meta.requiresAuth) {
      return next({ name: 'login' })
    }
    return next()
  }
})

export default router
