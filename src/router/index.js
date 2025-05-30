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
    createDashboardRoute({
      path: '/my-completed-bookings',
      name: 'my-completed-bookings',
      view: () => import('../views/MyCompletedBookings.vue'),
      meta: { title: 'Completed Bookings', requiresAuth: true },
    }),
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue'),
      meta: { requiresGuest: true, public: true }, // Add public meta
    },
    {
      path: '/verify',
      name: 'verify',
      component: () => import('../components/features/VerifyCode.vue'),
      meta: { requiresAuth: true },
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
    createDashboardRoute({
      path: '/admin/vehicle-returns',
      name: 'admin-vehicle-returns',
      view: () => import('../views/admin/VehicleReturns.vue'),
      meta: {
        title: 'Vehicle Returns',
        requiresAuth: true,
        requiredRoles: ['admin'],
      },
    }),
    createDashboardRoute({
      path: '/admin/completed-bookings',
      name: 'admin-completed-bookings',
      view: () => import('../views/admin/CompletedBookings.vue'),
      meta: {
        title: 'Completed Bookings',
        requiresAuth: true,
        requiredRoles: ['admin'],
      },
    }),
    createDashboardRoute({
      path: '/book/:id',
      name: 'book-vehicle',
      view: () => import('../views/BookVehicle.vue'),
      meta: { title: 'Book Vehicle', requiresAuth: true },
    }),
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Ensure auth status is checked once
  if (authStore.user === null && !authStore.loading) {
    try {
      await authStore.checkAuth()
    } catch (e) {
      // Ignore errors, treat as guest
    }
  }

  // Always allow landing page
  if (to.name === 'home') return next()

  // Guest-only routes
  if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) return next({ name: 'overview' })
    return next()
  }

  // If user is authenticated but not verified, force to verification page
  if (authStore.isAuthenticated && !authStore.isVerified && to.name !== 'verify') {
    return next({ name: 'verify' })
  }

  // If user is verified and tries to access verify page, redirect to overview
  if (authStore.isAuthenticated && authStore.isVerified && to.name === 'verify') {
    return next({ name: 'overview' })
  }

  // Protected routes
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      authStore.clearUserData()
      return next({ name: 'login' })
    }
  }

  return next()
})

export default router
