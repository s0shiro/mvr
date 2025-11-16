<template>
  <div class="space-y-8 p-1">
    <!-- Welcome Header -->
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p class="text-muted-foreground">Welcome back! Here's your rental overview.</p>
    </div>

    <div v-if="isLoading" class="h-40">
      <Loading text="Loading dashboard..."/>
    </div>
    <div v-else-if="error" class="text-red-500">
      <Alert variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load dashboard: {{ error.message }}</AlertDescription>
      </Alert>
    </div>
    <div v-else class="space-y-8">
      <!-- Stats Overview -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card class="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookMarked class="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent class="pb-4">
            <div class="text-3xl font-bold tracking-tight">{{ dashboard.stats?.total_bookings || 0 }}</div>
            <p class="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span class="font-medium">Lifetime rentals</span>
            </p>
          </CardContent>
        </Card>
        <Card class="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">Active Rentals</CardTitle>
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Car class="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent class="pb-4">
            <div class="text-3xl font-bold tracking-tight">{{ dashboard.stats?.active_rentals || 0 }}</div>
            <p class="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span class="font-medium">Currently rented</span>
            </p>
          </CardContent>
        </Card>
        <Card class="hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
            <div class="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <CreditCard class="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent class="pb-4">
            <div class="text-3xl font-bold tracking-tight">{{ dashboard.stats?.pending_payments || 0 }}</div>
            <p class="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span class="font-medium">Awaiting payment</span>
            </p>
          </CardContent>
        </Card>
        <Card class="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">New Notifications</CardTitle>
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg relative">
              <Bell class="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span v-if="dashboard.stats?.unread_notifications > 0" class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{{ dashboard.stats.unread_notifications }}</span>
            </div>
          </CardHeader>
          <CardContent class="pb-4">
            <div class="text-3xl font-bold tracking-tight">{{ dashboard.stats?.unread_notifications || 0 }}</div>
            <p class="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span class="font-medium">Unread messages</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Detailed Information -->
      <div class="grid gap-8">
        <!-- Recent Notifications -->
        <Card class="col-span-full shadow-sm">
          <CardHeader class="border-b bg-muted/30 pb-4">
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-xl">Recent Notifications</CardTitle>
                <CardDescription class="mt-1">Your latest updates and messages</CardDescription>
              </div>
              <Badge variant="secondary" class="text-xs">{{ dashboard.notifications?.length || 0 }} total</Badge>
            </div>
          </CardHeader>
          <CardContent class="pt-6">
            <div class="space-y-4">
              <div
                v-for="notification in dashboard.notifications"
                :key="notification.id"
                class="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div
                  class="rounded-full p-2.5 flex-shrink-0"
                  :class="[
                    notification.data.payment_status === 'approved'
                      ? 'bg-green-100 dark:bg-green-900'
                      : notification.data.payment_status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900'
                        : notification.data.payment_status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-900'
                          : 'bg-gray-100 dark:bg-gray-800',
                  ]"
                >
                  <CheckCircle
                    v-if="notification.data.payment_status === 'approved'"
                    class="h-4 w-4 text-green-600"
                  />
                  <Clock
                    v-else-if="notification.data.payment_status === 'pending'"
                    class="h-4 w-4 text-yellow-600"
                  />
                  <X
                    v-else-if="notification.data.payment_status === 'rejected'"
                    class="h-4 w-4 text-red-600"
                  />
                  <Bell v-else class="h-4 w-4 text-gray-600" />
                </div>
                <div class="flex-1 space-y-2">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-semibold leading-none">
                      {{ getNotificationType(notification.type) }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ formatDate(notification.created_at) }}
                    </p>
                  </div>
                  <p class="text-sm text-muted-foreground leading-relaxed">
                    {{ notification.data.message }}
                  </p>
                </div>
              </div>
              <div
                v-if="!dashboard.notifications?.length"
                class="text-center py-12"
              >
                <Bell class="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p class="text-sm text-muted-foreground font-medium">No notifications yet</p>
                <p class="text-xs text-muted-foreground mt-1">You'll see updates about your bookings here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Lower Grid for Rentals and Payments -->
        <div class="grid gap-8 md:grid-cols-2">
          <!-- Recent Rentals -->
          <Card class="shadow-sm">
            <CardHeader class="border-b bg-muted/30 pb-4">
              <div class="flex items-center gap-2">
                <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Car class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle class="text-lg">Recent Rentals</CardTitle>
                  <CardDescription class="text-xs">Your last 5 vehicle rentals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent class="pt-6">
              <div class="space-y-3">
                <div
                  v-for="rental in dashboard.bookings"
                  :key="rental.id"
                  class="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div class="flex-1 space-y-1.5">
                    <p class="text-sm font-semibold leading-none">
                      {{ rental.vehicle_name }}
                    </p>
                    <p class="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock class="h-3 w-3" />
                      {{ formatDateRange(rental.start_date, rental.end_date) }}
                    </p>
                  </div>
                  <Badge
                    :class="[
                      rental.status === 'released'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : rental.status === 'completed'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                    ]"
                  >
                    {{ rental.status }}
                  </Badge>
                </div>
                <div
                  v-if="!dashboard.bookings?.length"
                  class="text-center py-12"
                >
                  <Car class="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p class="text-sm text-muted-foreground font-medium">No rentals yet</p>
                  <p class="text-xs text-muted-foreground mt-1">Your rental history will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Payment History -->
          <Card class="shadow-sm">
            <CardHeader class="border-b bg-muted/30 pb-4">
              <div class="flex items-center gap-2">
                <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CreditCard class="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle class="text-lg">Recent Payments</CardTitle>
                  <CardDescription class="text-xs">Your last 5 payment transactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent class="pt-6">
              <div class="space-y-3">
                <div
                  v-for="payment in dashboard.payments"
                  :key="payment.id"
                  class="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div class="flex-1 space-y-1.5">
                    <p class="text-sm font-semibold leading-none">
                      {{ payment.type.charAt(0).toUpperCase() + payment.type.slice(1) }}
                    </p>
                    <p class="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock class="h-3 w-3" />
                      {{ formatDate(payment.created_at) }}
                    </p>
                  </div>
                  <Badge
                    :class="
                      payment.status === 'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : payment.status === 'pending'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    "
                  >
                    {{ payment.status }}
                  </Badge>
                </div>
                <div
                  v-if="!dashboard.payments?.length"
                  class="text-center py-12"
                >
                  <CreditCard class="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p class="text-sm text-muted-foreground font-medium">No payments yet</p>
                  <p class="text-xs text-muted-foreground mt-1">Your payment history will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axiosInstance'
import {
  Car,
  CreditCard,
  Bell,
  BookMarked,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
  X,
} from 'lucide-vue-next'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import Loading from '@/components/features/Loading.vue'

// Fetch dashboard data
const fetchCustomerDashboard = async () => {
  const { data } = await axiosInstance.get('/api/customer/overview')
  return data
}

const {
  isLoading,
  isError,
  data: dashboard = { stats: {}, bookings: [], payments: [], notifications: [] },
  error,
} = useQuery({
  queryKey: ['customer-dashboard'],
  queryFn: fetchCustomerDashboard,
})

const getStatusVariant = (status) => {
  switch (status) {
    case 'confirmed':
    case 'released':
    case 'for_release':
      return 'success'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const getNotificationType = (type) => {
  const typeMap = {
    'booking_created': 'Booking Created',
    'payment_submitted': 'Payment Submitted',
    'payment_status_updated': 'Payment Status Updated',
    'vehicle_released': 'Vehicle Released',
    'vehicle_return_submitted': 'Return Submitted',
    'vehicle_return_completed': 'Return Completed',
    'deposit_refund_processed': 'Deposit Refund Processed',
    'booking_cancelled_by_admin': 'Booking Cancelled'
  }
  
  return typeMap[type] || type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now - date
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  
  return `${startStr} - ${endStr}`
}
</script>
