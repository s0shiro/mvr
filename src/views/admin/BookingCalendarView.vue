<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import BookingCalendar from '@/components/features/BookingCalendar.vue'
import {
  bookingCalendarService,
  bookingCalendarKeys,
} from '@/services/admin/booking-calendar-service'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-vue-next'

const router = useRouter()
const bookingCalendar = ref(null)

// Get initial date range
const now = new Date()
const dateRange = ref({
  start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
  end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
})

// Use Vue Query to fetch events
const {
  data: events,
  isLoading,
  error,
  refetch,
} = useQuery({
  queryKey: computed(() => bookingCalendarKeys.list(dateRange.value)),
  queryFn: async () => {
    const response = await bookingCalendarService.getCalendarEvents(
      dateRange.value.start,
      dateRange.value.end,
    )
    console.log('Calendar Events:', response) // For debugging
    return response
  },
  keepPreviousData: true,
  staleTime: 30000, // Consider data fresh for 30 seconds
  refetchOnWindowFocus: true,
})

// Update events when data changes
const handleDateRangeChange = (newRange) => {
  dateRange.value = newRange
}

const handleEventClick = (event) => {
  router.push({
    name: 'admin-booking-details',
    params: { id: event.id },
  })
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Booking Calendar</h1>
      <p class="text-muted-foreground">View and manage all bookings in calendar format</p>
    </div>

    <Alert v-if="error" variant="destructive" class="mb-4">
      <AlertDescription>
        {{ error.message }}
      </AlertDescription>
    </Alert>

    <div class="bg-card text-card-foreground rounded-lg shadow-sm border p-6 relative">
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg"
      >
        <Loader2 class="w-8 h-8 animate-spin text-primary" />
      </div>

      <BookingCalendar
        v-if="events"
        ref="bookingCalendar"
        :events="events"
        :loading="isLoading"
        @date-range-change="handleDateRangeChange"
        @event-click="handleEventClick"
      />
      <div v-else-if="!isLoading" class="text-center py-8 text-muted-foreground">
        No events found for the selected period
      </div>
    </div>
  </div>
</template>
