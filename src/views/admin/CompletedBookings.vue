<template>
  <div class="container space-y-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Completed Bookings History</h1>
    </div>
    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>
    <div v-else>
      <div v-if="!bookings.length" class="text-center text-muted-foreground py-12">
        No completed bookings found.
      </div>
      <div v-else class="space-y-6">
        <Card v-for="booking in bookings" :key="booking.id" class="border border-border bg-card">
          <CardHeader class="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle class="text-lg font-semibold">{{
                booking.vehicle?.name || 'Vehicle'
              }}</CardTitle>
              <CardDescription>
                <span class="font-medium">{{ booking.vehicle?.brand }}</span>
                <span v-if="booking.vehicle"
                  >• {{ booking.vehicle.model }} ({{ booking.vehicle.year }})</span
                >
              </CardDescription>
            </div>
            <Badge :variant="getStatusVariant(booking.status)">{{ booking.status }}</Badge>
          </CardHeader>
          <CardContent class="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <img
              v-if="booking.vehicle?.primary_image_url"
              :src="booking.vehicle.primary_image_url"
              alt="Vehicle"
              class="w-40 h-28 object-cover rounded-lg shadow-sm border"
            />
            <div class="flex-1 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-sm text-muted-foreground">Rental Period:</span>
                    <span class="font-medium"
                      >{{ formatDate(booking.start_date) }} -
                      {{ formatDate(booking.end_date) }}</span
                    >
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-sm text-muted-foreground">Total Price:</span>
                    <span class="font-medium text-primary">₱{{ booking.total_price }}</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 mb-4">
                <Badge variant="success">Completed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAdminCompletedBookings } from '@/services/admin/completed-bookings-service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStatusVariant } from '@/lib/utils'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

const { data, error, isLoading } = useAdminCompletedBookings()
const bookings = computed(() => data.value || [])
</script>
