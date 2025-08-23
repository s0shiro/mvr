<template>
  <div class="space-y-6">
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
    <div v-else>
      <!-- Stats Overview -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card class="hover:bg-muted/50 transition-colors">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Total Bookings</CardTitle>
            <BookMarked class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent class="pb-4">
            <div class="text-2xl font-bold">{{ dashboard.stats?.total_bookings || 0 }}</div>
            <p class="text-xs text-muted-foreground mt-1">Lifetime rentals</p>
          </CardContent>
        </Card>
        <Card class="hover:bg-muted/50 transition-colors">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Active Rentals</CardTitle>
            <Car class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent class="pb-4">
            <div class="text-2xl font-bold">{{ dashboard.stats?.active_rentals || 0 }}</div>
            <p class="text-xs text-muted-foreground mt-1">Currently rented vehicles</p>
          </CardContent>
        </Card>
        <Card class="hover:bg-muted/50 transition-colors">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent class="pb-4">
            <div class="text-2xl font-bold">{{ dashboard.stats?.pending_payments || 0 }}</div>
            <p class="text-xs text-muted-foreground mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card class="hover:bg-muted/50 transition-colors">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">New Notifications</CardTitle>
            <Bell class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent class="pb-4">
            <div class="text-2xl font-bold">{{ dashboard.stats?.unread_notifications || 0 }}</div>
            <p class="text-xs text-muted-foreground mt-1">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      <!-- Detailed Information -->
      <div class="grid gap-6 mt-6">
        <!-- Recent Notifications -->
        <Card class="col-span-full">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Your latest updates and messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="notification in dashboard.notifications"
                :key="notification.id"
                class="flex items-start gap-4"
              >
                <div
                  class="rounded-full p-2"
                  :class="[
                    notification.data.payment_status === 'approved'
                      ? 'bg-green-100'
                      : notification.data.payment_status === 'pending'
                        ? 'bg-yellow-100'
                        : notification.data.payment_status === 'rejected'
                          ? 'bg-red-100'
                          : 'bg-gray-100',
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
                <div class="flex-1 space-y-1">
                  <p class="text-sm font-medium leading-none">
                    {{ getNotificationType(notification.type) }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {{ notification.data.message }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ new Date(notification.created_at).toLocaleDateString() }}
                  </p>
                </div>
              </div>
              <div
                v-if="!dashboard.notifications?.length"
                class="text-sm text-muted-foreground text-center py-4"
              >
                No notifications
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Lower Grid for Rentals and Payments -->
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Recent Rentals -->
          <Card>
            <CardHeader>
              <CardTitle>Recent Rentals</CardTitle>
              <CardDescription>Your last 5 vehicle rentals</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="rental in dashboard.bookings"
                  :key="rental.id"
                  class="flex items-center"
                >
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-medium leading-none">
                      {{ rental.vehicle_name }}
                    </p>
                    <p class="text-sm text-muted-foreground">
                      {{ new Date(rental.start_date).toLocaleDateString() }} -
                      {{ new Date(rental.end_date).toLocaleDateString() }}
                    </p>
                  </div>
                  <div
                    :class="[
                      'rounded-full px-2 py-1 text-xs font-semibold',
                      rental.status === 'released'
                        ? 'bg-green-100 text-green-700'
                        : rental.status === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700',
                    ]"
                  >
                    {{ rental.status }}
                  </div>
                </div>
                <div
                  v-if="!dashboard.bookings?.length"
                  class="text-sm text-muted-foreground text-center py-4"
                >
                  No rentals found
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Payment History -->
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Your last 5 payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="payment in dashboard.payments"
                  :key="payment.id"
                  class="flex items-center"
                >
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-medium leading-none">
                      {{ payment.type.charAt(0).toUpperCase() + payment.type.slice(1) }}
                    </p>
                    <p class="text-sm text-muted-foreground">
                      {{ new Date(payment.created_at).toLocaleDateString() }}
                    </p>
                  </div>
                  <div
                    class="font-medium rounded-full px-2 py-1 text-xs"
                    :class="
                      payment.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    "
                  >
                    {{ payment.status }}
                  </div>
                </div>
                <div
                  v-if="!dashboard.payments?.length"
                  class="text-sm text-muted-foreground text-center py-4"
                >
                  No payments found
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
</script>
