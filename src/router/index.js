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
    createDashboardRoute({
      path: '/my-completed-bookings/:id',
      name: 'completed-booking-details',
      view: () => import('../views/CompletedBookingDetails.vue'),
      meta: { title: 'Completed Booking Details', requiresAuth: true },
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
      path: '/admin/bookings/:id',
      name: 'admin-booking-details',
      view: () => import('../views/admin/BookingDetails.vue'),
      meta: {
        title: 'Booking Details',
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
    createDashboardRoute({
      path: '/vehicles/add',
      name: 'add-vehicle',
      view: () => import('../views/AddVehicle.vue'),
      meta: { title: 'Add Vehicle', requiresAuth: true, requiredRoles: ['admin'] },
    }),
    createDashboardRoute({
      path: '/admin/businesses',
      name: 'admin-businesses',
      view: () => import('../views/Businesses.vue'),
      meta: {
        title: 'Business/Services',
        requiresAuth: true,
        requiredRoles: ['admin'],
      },
    }),
    createDashboardRoute({
      path: '/admin/businesses/:id',
      name: 'business-view',
      view: () => import('../views/BusinessView.vue'),
      meta: {
        title: 'Business Details',
        requiresAuth: true,
        requiredRoles: ['admin'],
      },
    }),
    createDashboardRoute({
      path: '/admin/businesses/:id/sales-report',
      name: 'business-sales-report',
      view: () => import('../views/BusinessSalesReport.vue'),
      meta: {
        title: 'Sales Report',
        requiresAuth: true,
        requiredRoles: ['admin'],
      },
    }),
    createDashboardRoute({
      path: '/admin/payment-methods',
      name: 'admin-payment-methods',
      view: () => import('../views/admin/AdminPaymentMethods.vue'),
      meta: {
        title: 'Payment Methods',
        requiresAuth: true,
        requiredRoles: ['admin'],
      },
    }),
    createDashboardRoute({
      path: '/admin/drivers',
      name: 'admin-drivers',
      view: () => import('../views/admin/Drivers.vue'),
      meta: {
        title: 'Driver Management',
        requiresAuth: true,
        requiredRoles: ['admin', 'manager'],
      },
    }),
    createDashboardRoute({
      path: '/vehicles/:id/edit',
      name: 'vehicle-edit',
      view: () => import('@/components/features/vehicles/VehicleUpdatePage.vue'),
      meta: { title: 'Edit Vehicle', requiresAuth: true, requiredRoles: ['admin'] },
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
