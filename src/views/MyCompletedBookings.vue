<template>
  <Card class="max-w-4xl mx-auto mt-8 shadow-lg">
    <CardHeader>
      <CardTitle class="text-2xl font-bold flex items-center gap-2">
        <CheckCircle2 class="text-green-500" />
        Completed Bookings
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div
        v-if="isLoading"
        class="flex items-center gap-2 text-muted-foreground py-8 justify-center"
      >
        <Loader2 class="animate-spin" /> Loading...
      </div>
      <div v-else-if="isError" class="text-destructive flex items-center gap-2 py-8 justify-center">
        <XCircle />
        <span>Failed to load completed bookings.</span>
        <button class="ml-2 underline" @click="refetch">Retry</button>
      </div>
      <div
        v-else-if="completedBookings.length === 0"
        class="text-muted-foreground py-8 text-center"
      >
        No completed bookings found.
      </div>
      <div v-else class="grid gap-6">
        <div v-for="booking in completedBookings" :key="booking.id">
          <Card class="border border-primary/20 shadow-sm hover:shadow-lg transition">
            <CardHeader class="flex flex-row items-center gap-4">
              <div
                class="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900"
              >
                <CheckCircle2 class="w-7 h-7 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <CardTitle class="text-lg font-semibold">{{
                  booking.vehicle?.name || 'N/A'
                }}</CardTitle>
                <div class="text-xs text-muted-foreground mt-1">Booking #{{ booking.id }}</div>
              </div>
              <div class="ml-auto flex flex-col items-end">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                >
                  <CheckCircle2 class="w-4 h-4" />
                  {{ booking.status }}
                </span>
                <span class="text-primary font-bold text-lg mt-1"
                  >₱{{ booking.total_price?.toLocaleString() }}</span
                >
              </div>
            </CardHeader>
            <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span class="font-medium">Start Date:</span>
                <span class="ml-1">{{ formatDate(booking.start_date) }}</span>
              </div>
              <div>
                <span class="font-medium">End Date:</span>
                <span class="ml-1">{{ formatDate(booking.end_date) }}</span>
              </div>
            </CardContent>
            <!-- Feedback Section -->
            <div class="p-4 border-t mt-2">
              <FeedbackSection :booking-id="booking.id" />
            </div>
          </Card>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useMyCompletedBookingsQuery } from '@/services/completed-bookings-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-vue-next'
import FeedbackSection from '@/components/features/feedback/FeedbackSection.vue'

const { data, isLoading, isError, error, refetch } = useMyCompletedBookingsQuery()
const completedBookings = computed(() => data.value || [])

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
</script>
