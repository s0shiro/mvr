<template>
  <div class="container space-y-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Completed Bookings History</h1>
      
      <!-- Sorting Controls -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <Label for="sort-by" class="text-sm font-medium">Sort by:</Label>
          <select
            id="sort-by"
            v-model="sortBy"
            class="flex h-9 w-auto rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="created_at">Booking Date</option>
            <option value="updated_at">Completion Date</option>
            <option value="start_date">Rental Start Date</option>
            <option value="end_date">Rental End Date</option>
            <option value="total_price">Amount</option>
          </select>
        </div>
        
        <div class="flex items-center gap-1 border rounded-md">
          <Button
            variant="ghost"
            size="sm"
            :class="['px-3 py-1 rounded-r-none border-r', sortOrder === 'desc' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted']"
            @click="sortOrder = 'desc'"
          >
            <TrendingDown class="w-4 h-4 mr-1" />
            Desc
          </Button>
          <Button
            variant="ghost"
            size="sm"
            :class="['px-3 py-1 rounded-l-none', sortOrder === 'asc' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted']"
            @click="sortOrder = 'asc'"
          >
            <TrendingUp class="w-4 h-4 mr-1" />
            Asc
          </Button>
        </div>
      </div>
    </div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading bookings..." />
    </div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>
    <div v-else>
      <div v-if="!bookings.length" class="h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center space-y-4">
        <div class="w-24 h-24 mx-auto mb-4 opacity-50">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-muted-foreground">
            <path d="M9 12l2 2 4-4"></path>
            <path d="M21 12c.552 0 1-.448 1-1V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3c0 .552.448 1 1 1"></path>
            <path d="M3 16v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-foreground">No completed bookings found</h3>
        <p class="text-muted-foreground max-w-md">
          Completed bookings will appear here once rentals have been finished and vehicles returned. Each completed booking will show comprehensive details including payments, vehicle condition, and final costs.
        </p>
      </div>
      <div v-else class="space-y-6">
        <Card v-for="booking in bookings" :key="booking.id" class="border border-border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden">
          <!-- Header with gradient background -->
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 px-6 py-4 border-b border-border">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <CheckCircle class="w-6 h-6 text-green-600 dark:text-green-400" />
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
                <Badge variant="success" class="text-sm px-3 py-1">
                  <CheckCircle class="w-4 h-4 mr-1" />
                  {{ booking.status }}
                </Badge>
                <div class="text-right">
                  <p class="text-2xl font-bold text-green-600 dark:text-green-400">₱{{ Number(booking.total_price).toLocaleString() }}</p>
                  <p class="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>

          <CardContent class="p-6">
            <div class="flex flex-col lg:flex-row gap-6">
              <!-- Vehicle Image -->
              <div class="flex-shrink-0">
                <img
                  v-if="booking.vehicle?.primary_image_url"
                  :src="booking.vehicle.primary_image_url"
                  alt="Vehicle"
                  class="w-full lg:w-48 h-32 lg:h-28 object-cover rounded-xl shadow-md border"
                />
                <div v-else class="w-full lg:w-48 h-32 lg:h-28 bg-muted rounded-xl flex items-center justify-center border">
                  <Car class="w-12 h-12 text-muted-foreground" />
                </div>
              </div>

              <!-- Booking Details -->
              <div class="flex-1 space-y-6">
                <!-- Customer & Rental Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-3">
                    <div class="flex items-center gap-2 text-sm">
                      <User class="w-4 h-4 text-primary" />
                      <span class="font-medium text-muted-foreground">Customer:</span>
                      <span class="font-semibold text-foreground">{{ booking.user?.name || 'N/A' }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm">
                      <Mail class="w-4 h-4 text-primary" />
                      <span class="font-medium text-muted-foreground">Email:</span>
                      <span class="text-foreground">{{ booking.user?.email || 'N/A' }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm">
                      <Calendar class="w-4 h-4 text-primary" />
                      <span class="font-medium text-muted-foreground">Completed:</span>
                      <span class="text-foreground">{{ formatDate(booking.updated_at) }}</span>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div class="flex items-center gap-2 text-sm">
                      <CalendarDays class="w-4 h-4 text-primary" />
                      <span class="font-medium text-muted-foreground">Period:</span>
                      <span class="text-foreground">{{ formatDateRange(booking.start_date, booking.end_date) }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm">
                      <Clock class="w-4 h-4 text-primary" />
                      <span class="font-medium text-muted-foreground">Duration:</span>
                      <span class="text-foreground">{{ calculateDuration(booking.start_date, booking.end_date) }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm">
                      <MapPin class="w-4 h-4 text-primary" />
                      <span class="font-medium text-muted-foreground">Pickup:</span>
                      <span class="text-foreground capitalize">{{ booking.pickup_type || 'N/A' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div class="flex items-center gap-2 mb-1">
                      <CreditCard class="w-4 h-4 text-blue-600" />
                      <span class="text-xs font-medium text-blue-600 dark:text-blue-400">Revenue</span>
                    </div>
                    <p class="text-lg font-bold text-blue-900 dark:text-blue-100">₱{{ Number(booking.total_price).toLocaleString() }}</p>
                  </div>
                  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div class="flex items-center gap-2 mb-1">
                      <Calendar class="w-4 h-4 text-purple-600" />
                      <span class="text-xs font-medium text-purple-600 dark:text-purple-400">Days</span>
                    </div>
                    <p class="text-lg font-bold text-purple-900 dark:text-purple-100">{{ calculateDays(booking.start_date, booking.end_date) }}</p>
                  </div>
                  <div class="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div class="flex items-center gap-2 mb-1">
                      <DollarSign class="w-4 h-4 text-amber-600" />
                      <span class="text-xs font-medium text-amber-600 dark:text-amber-400">Daily Rate</span>
                    </div>
                    <p class="text-lg font-bold text-amber-900 dark:text-amber-100">₱{{ calculateDailyRate(booking.total_price, booking.start_date, booking.end_date) }}</p>
                  </div>
                  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div class="flex items-center gap-2 mb-1">
                      <TrendingUp class="w-4 h-4 text-green-600" />
                      <span class="text-xs font-medium text-green-600 dark:text-green-400">Status</span>
                    </div>
                    <p class="text-sm font-bold text-green-900 dark:text-green-100 capitalize">{{ booking.status.replace('_', ' ') }}</p>
                  </div>
                </div>

                <!-- Action Button -->
                <div class="flex justify-end pt-4 border-t border-border">
                  <RouterLink :to="`/admin/completed-bookings/${booking.id}`">
                    <Button size="default" class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md">
                      <FileText class="w-4 h-4 mr-2" />
                      View Complete Details
                      <ChevronRight class="w-4 h-4 ml-2" />
                    </Button>
                  </RouterLink>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAdminCompletedBookings } from '@/services/admin/completed-bookings-service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Loading from '@/components/features/Loading.vue'
import { getStatusVariant } from '@/lib/utils'
import { 
  FileText, 
  CheckCircle, 
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
  TrendingDown, 
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

// Sorting controls
const sortBy = ref('created_at')
const sortOrder = ref('desc')

const { data, error, isLoading } = useAdminCompletedBookings(sortBy, sortOrder)
const bookings = computed(() => data.value || [])
</script>
