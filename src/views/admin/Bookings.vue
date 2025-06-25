<template>
  <div class="">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Manage Bookings</h1>
    </div>

    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading bookings..." />
    </div>
    <div v-else-if="error" class="text-center text-destructive text-lg font-medium">
      {{ error }}
    </div>
    <div v-else class="space-y-8">
      <Card
        v-for="booking in bookings"
        :key="booking.id"
        class="p-6 shadow-lg border border-border rounded-xl bg-card relative"
      >
        <!-- Pending Payment indicator only -->
        <div
          v-if="booking.has_pending_payment"
          class="absolute top-3 right-3 flex items-center gap-1 z-10"
        >
          <span
            class="inline-block w-3 h-3 rounded-full bg-yellow-400 animate-pulse"
            title="Pending Payment"
          ></span>
        </div>
        <div class="flex flex-col md:flex-row gap-8">
          <div class="flex-1 space-y-6">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div>
                <h3 class="text-xl font-semibold text-primary flex items-center gap-2">
                  {{ booking.vehicle?.name }}
                  <Badge class="ml-2 capitalize" :variant="getStatusVariant(booking.status)">
                    {{ booking.status.replace('_', ' ') }}
                  </Badge>
                </h3>
                <p class="text-muted-foreground text-sm mt-1">
                  Booked by:
                  <span class="font-medium text-foreground">{{ booking.user?.name }}</span>
                </p>
              </div>
              <div class="text-right space-y-1">
                <p class="font-semibold text-lg text-foreground">₱{{ booking.total_price }}</p>
                <p class="text-xs text-muted-foreground">
                  Booked on: {{ formatDate(booking.created_at) }}
                </p>
              </div>
            </div>
            <Separator class="my-2" />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-muted/50 rounded-lg p-4 border border-muted flex flex-col gap-2">
                <div class="flex items-center gap-2 mb-2">
                  <CalendarDays class="w-5 h-5 text-primary" />
                  <h4 class="font-semibold text-base text-foreground">Rental Period</h4>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">Start:</span>
                  <span class="font-medium text-foreground">
                    <span class="inline-flex items-center gap-1">
                      <CalendarDays class="w-4 h-4 text-primary" />
                      {{ formatDate(booking.start_date, true) }}
                    </span>
                  </span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">End:</span>
                  <span class="font-medium text-foreground">
                    <span class="inline-flex items-center gap-1">
                      <CalendarDays class="w-4 h-4 text-primary" />
                      {{ formatDate(booking.end_date, true) }}
                    </span>
                  </span>
                </div>
              </div>
              <div class="bg-muted/50 rounded-lg p-4 border border-muted flex flex-col gap-2">
                <div class="flex items-center gap-2 mb-2">
                  <Truck class="w-5 h-5 text-primary" />
                  <h4 class="font-semibold text-base text-foreground">Pickup Details</h4>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">Type:</span>
                  <span class="font-medium text-foreground">{{ booking.pickup_type }}</span>
                </div>
                <div v-if="booking.delivery_location" class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">Location:</span>
                  <span class="font-medium text-foreground">{{ booking.delivery_location }}</span>
                </div>
                <div v-if="booking.delivery_details" class="flex items-start gap-2 text-sm">
                  <span class="text-muted-foreground">Details:</span>
                  <span class="font-medium text-foreground whitespace-pre-line">{{
                    booking.delivery_details
                  }}</span>
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-2 mt-4">
              <Button
                v-if="shouldShowCancelButton(booking)"
                size="sm"
                variant="destructive"
                @click="openCancelDialog(booking)"
              >
                <Ban class="w-4 h-4 mr-2" />
                Cancel Booking
              </Button>
              <RouterLink :to="`/admin/bookings/${booking.id}`">
                <Button size="sm" variant="default">View Details</Button>
              </RouterLink>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Cancel Confirmation Dialog -->
    <ConfirmCancelDialog
      v-model:open="showCancelDialog"
      :booking="selectedBooking"
      :loading="cancelLoading[selectedBooking?.id]"
      @confirm="handleCancelBooking"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Loading from '@/components/features/Loading.vue'
import ConfirmCancelDialog from '@/components/features/ConfirmCancelDialog.vue'
import { useAdminBookings, useAdminCancelBooking } from '@/services/admin/booking-service'
import { getStatusVariant } from '@/lib/utils'
import { CalendarDays, Truck, Ban } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'

const { data: bookings, error, isLoading, refetch } = useAdminBookings()
const cancelBooking = useAdminCancelBooking()
const cancelLoading = ref({})
const showCancelDialog = ref(false)
const selectedBooking = ref(null)

function shouldShowCancelButton(booking) {
  // Admin can cancel pending or confirmed bookings
  return booking && (booking.status === 'pending' || booking.status === 'confirmed')
}

function openCancelDialog(booking) {
  selectedBooking.value = booking
  showCancelDialog.value = true
}

async function handleCancelBooking() {
  const booking = selectedBooking.value
  if (!booking) return

  cancelLoading.value[booking.id] = true
  try {
    await cancelBooking.mutateAsync(booking.id)
    toast.success('Booking cancelled successfully')
    showCancelDialog.value = false
    selectedBooking.value = null
    refetch()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to cancel booking')
  } finally {
    cancelLoading.value[booking.id] = false
  }
}

function formatDate(date, pretty = false) {
  const d = new Date(date)
  if (pretty) {
    return d
      .toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      .replace(',', '')
      .replace(/(\d{4}) (\d{1,2}):(\d{2})/, '$1 · $2:$3')
  }
  return d.toLocaleString()
}
</script>
