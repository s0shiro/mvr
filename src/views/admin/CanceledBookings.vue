<template>
  <div class="container space-y-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Canceled Bookings History</h1>
    </div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading canceled bookings..." />
    </div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>
    <div v-else>
      <div v-if="!bookings.length" class="h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center space-y-4">
        <div class="w-24 h-24 mx-auto mb-4 opacity-50">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-muted-foreground">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m15 9-6 6"></path>
            <path d="m9 9 6 6"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-foreground">No canceled bookings found</h3>
        <p class="text-muted-foreground max-w-md">
          Canceled bookings will appear here when reservations have been cancelled by either customers or administrators. Each canceled booking will show the reason and any refund details.
        </p>
      </div>
      <div v-else class="space-y-6">
        <Card v-for="booking in bookings" :key="booking.id" class="border border-border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden">
          <!-- Header with gradient background -->
          <div class="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 px-6 py-4 border-b border-border">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <XCircle class="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-foreground">{{ booking.vehicle?.name || 'Vehicle' }}</h3>
                  <p class="text-sm text-muted-foreground">
                    <span class="font-medium">{{ booking.vehicle?.brand }}</span>
                    <span v-if="booking.vehicle"> • {{ booking.vehicle.model }} ({{ booking.vehicle.year }})</span>
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Badge variant="destructive" class="text-sm px-3 py-1">
                  <XCircle class="w-4 h-4 mr-1" />
                  {{ booking.status }}
                </Badge>
                <div class="text-right">
                  <p class="text-2xl font-bold text-red-600 dark:text-red-400">₱{{ Number(booking.total_price).toLocaleString() }}</p>
                  <p class="text-xs text-muted-foreground">Lost Revenue</p>
                </div>
              </div>
            </div>
          </div>
          
          <CardContent class="p-6">
            <!-- Customer and Booking Details -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Customer Info -->
              <div class="space-y-4">
                <div class="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <User class="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p class="font-semibold text-foreground">{{ booking.user?.name || 'Customer' }}</p>
                    <p class="text-sm text-muted-foreground">{{ booking.user?.email || 'No email' }}</p>
                  </div>
                </div>
                
                <!-- Booking Duration -->
                <div class="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <CalendarDays class="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p class="font-semibold text-foreground">{{ formatDateRange(booking.start_date, booking.end_date) }}</p>
                    <p class="text-sm text-muted-foreground">{{ calculateDuration(booking.start_date, booking.end_date) }} rental</p>
                  </div>
                </div>

                <!-- Pickup Location -->
                <div v-if="booking.pickup_type" class="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <MapPin class="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p class="font-semibold text-foreground capitalize">{{ booking.pickup_type.replace('_', ' ') }} Pickup</p>
                    <p v-if="booking.delivery_location" class="text-sm text-muted-foreground">{{ booking.delivery_location }}</p>
                    <p v-if="booking.delivery_details" class="text-sm text-muted-foreground">{{ booking.delivery_details }}</p>
                  </div>
                </div>
              </div>

              <!-- Cancellation Details -->
              <div class="space-y-4">
                <!-- Cancellation Date -->
                <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                  <Clock class="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p class="font-semibold text-red-700 dark:text-red-300">Canceled</p>
                    <p class="text-sm text-red-600 dark:text-red-400">{{ formatDate(booking.updated_at) }}</p>
                  </div>
                </div>

                <!-- Payment Status -->
                <div v-if="booking.payments && booking.payments.length > 0" class="space-y-2">
                  <h4 class="font-semibold text-foreground flex items-center gap-2">
                    <CreditCard class="w-4 h-4" />
                    Payment Status
                  </h4>
                  <div class="space-y-2">
                    <div v-for="payment in booking.payments" :key="payment.id" 
                         class="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p class="font-medium text-foreground capitalize">{{ payment.type }} Payment</p>
                        <p class="text-sm text-muted-foreground">{{ payment.payment_method }}</p>
                      </div>
                      <div class="text-right">
                        <Badge :variant="getStatusVariant(payment.status)" class="text-xs">
                          {{ payment.status }}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Total Amount -->
                <div class="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-lg border">
                  <DollarSign class="w-5 h-5 text-muted-foreground" />
                  <div class="flex-1">
                    <div class="flex justify-between items-center">
                      <p class="font-semibold text-foreground">Total Amount</p>
                      <p class="text-lg font-bold text-foreground">₱{{ Number(booking.total_price).toLocaleString() }}</p>
                    </div>
                    <div class="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Daily rate</span>
                      <span>₱{{ calculateDailyRate(booking.total_price, booking.start_date, booking.end_date) }}/day</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-3 pt-4 border-t border-border">
              <RouterLink :to="`/admin/bookings/${booking.id}`">
                <Button variant="outline" size="sm" class="gap-2">
                  <FileText class="w-4 h-4" />
                  View Details
                  <ChevronRight class="w-4 h-4" />
                </Button>
              </RouterLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAdminCanceledBookings } from '@/services/admin/canceled-bookings-service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Loading from '@/components/features/Loading.vue'
import { getStatusVariant } from '@/lib/utils'
import { 
  FileText, 
  XCircle, 
  Car, 
  User, 
  Mail, 
  Calendar, 
  CalendarDays, 
  Clock, 
  MapPin, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  ChevronRight 
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startStr} - ${endStr}`
}

function calculateDuration(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1 ? '1 day' : `${diffDays} days`
}

function calculateDays(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function calculateDailyRate(totalPrice, startDate, endDate) {
  const days = calculateDays(startDate, endDate)
  const dailyRate = Number(totalPrice) / days
  return dailyRate.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

const { data, error, isLoading } = useAdminCanceledBookings()
const bookings = computed(() => data.value || [])
</script>
