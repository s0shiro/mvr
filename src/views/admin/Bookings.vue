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
    <div v-else-if="!bookings || bookings.length === 0" class="h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center space-y-4">
      <div class="w-24 h-24 mx-auto mb-4 opacity-50">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-muted-foreground">
          <path d="M16 3h5v5"></path>
          <path d="m21 3-5 5"></path>
          <path d="M4 20h5v-5"></path>
          <path d="m4 20 5-5"></path>
          <path d="M8 8h8v8H8z"></path>
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-foreground">No bookings found</h3>
      <p class="text-muted-foreground max-w-md">
        There are currently no bookings in the system. New bookings will appear here once customers start making reservations.
      </p>
    </div>
    <div v-else>
      <!-- Summary Stats -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ groupedBookings.pending.length }}</div>
          <div class="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
        </div>
        <div class="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ groupedBookings.confirmed.length }}</div>
          <div class="text-sm text-blue-600 dark:text-blue-400">Confirmed</div>
        </div>
      </div>

      <!-- Grouped Bookings -->
      <div class="space-y-8">
        <div v-for="(bookingsInGroup, groupName) in groupedBookings" :key="groupName" class="space-y-4">
          <div class="flex items-center gap-3 pb-2 border-b">
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ getGroupIcon(groupName) }}</span>
              <h2 class="text-xl font-semibold">
                {{ getGroupLabel(groupName) }}
              </h2>
            </div>
            <Badge :variant="getGroupBadgeVariant(groupName)" class="ml-auto">
              {{ bookingsInGroup.length }} {{ bookingsInGroup.length === 1 ? 'booking' : 'bookings' }}
            </Badge>
          </div>

          <div v-if="!bookingsInGroup.length" class="text-muted-foreground italic text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            No bookings in this category.
          </div>

          <div v-else :class="groupName === 'pending' ? 'ring-2 ring-yellow-200 dark:ring-yellow-800 rounded-lg p-4 bg-yellow-50/30 dark:bg-yellow-950/10' : ''">
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Card
                v-for="booking in bookingsInGroup"
                :key="booking.id"
                class="relative border border-border bg-card hover:shadow-md transition-shadow"
              >
                <!-- Pending Payment indicator -->
                <div
                  v-if="booking.has_pending_payment"
                  class="absolute top-3 right-3 flex items-center gap-1 z-10"
                >
                  <span
                    class="inline-block w-3 h-3 rounded-full bg-yellow-400 animate-pulse"
                    title="Pending Payment"
                  ></span>
                </div>

                <CardHeader class="pb-3">
                  <div class="flex flex-col gap-2">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex-1 min-w-0">
                        <CardTitle class="text-lg font-semibold truncate">{{
                          booking.vehicle?.name || 'Vehicle'
                        }}</CardTitle>
                        <CardDescription class="truncate">
                          {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }} ({{ booking.vehicle?.year }})
                        </CardDescription>
                      </div>
                    </div>
                    <div>
                      <Badge :variant="getStatusVariant(booking.status)" size="sm">
                        {{ booking.status.replace('_', ' ') }}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent class="space-y-4">
                  <!-- Vehicle Image -->
                  <div v-if="booking.vehicle?.primary_image_url" class="relative">
                    <img
                      :src="booking.vehicle.primary_image_url"
                      alt="Vehicle"
                      class="w-full h-32 object-cover rounded-lg shadow-sm border"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span class="font-medium text-muted-foreground">Customer:</span>
                      <div class="font-medium truncate">{{ booking.user?.name || 'N/A' }}</div>
                    </div>
                    <div>
                      <span class="font-medium text-muted-foreground">Total:</span>
                      <div class="font-medium text-primary">₱{{ booking.total_price }}</div>
                    </div>
                    <div class="col-span-2">
                      <span class="font-medium text-muted-foreground">Rental Period:</span>
                      <div class="font-medium">
                        {{ formatDate(booking.start_date) }} → {{ formatDate(booking.end_date) }}
                      </div>
                    </div>
                  </div>

                  <!-- Pickup Details (condensed) -->
                  <div v-if="booking.pickup_type" class="text-sm p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div class="flex items-center gap-2 mb-1">
                      <Truck class="w-4 h-4 text-primary" />
                      <span class="font-medium text-muted-foreground">Pickup:</span>
                      <span class="font-medium">{{ booking.pickup_type }}</span>
                    </div>
                    <div v-if="booking.delivery_location" class="text-xs text-muted-foreground truncate">
                      {{ booking.delivery_location }}
                    </div>
                  </div>

                  <div class="flex flex-col gap-2 pt-2">
                    <div class="flex gap-2">
                      <Button
                        v-if="shouldShowCancelButton(booking)"
                        size="sm"
                        variant="destructive"
                        @click="openCancelDialog(booking)"
                        class="flex-1"
                      >
                        <Ban class="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        @click="openContractDialog(booking)"
                        class="flex-1"
                      >
                        <FileText class="w-4 h-4 mr-2" />
                        Contract
                      </Button>
                    </div>
                    <RouterLink :to="`/admin/bookings/${booking.id}`" class="w-full">
                      <Button size="sm" variant="default" class="w-full">
                        Details
                      </Button>
                    </RouterLink>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Confirmation Dialog -->
    <ConfirmCancelDialog
      v-model:open="showCancelDialog"
      :booking="selectedBooking"
      :loading="cancelLoading[selectedBooking?.id]"
      @confirm="handleCancelBooking"
    />

    <!-- Contract Print Modal -->
    <div v-if="contractDialogOpen">
      <div class="modal-overlay" @click="closeContractDialog"></div>
      <div class="modal-content">
        <button class="modal-close" @click="closeContractDialog">&times;</button>
        <ContractPrint 
          v-if="selectedBookingForContract"
          :booking="selectedBookingForContract" 
          :show-print-button="true" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Loading from '@/components/features/Loading.vue'
import ConfirmCancelDialog from '@/components/features/ConfirmCancelDialog.vue'
import ContractPrint from '@/components/features/ContractPrint.vue'
import { useAdminBookings, useAdminCancelBooking } from '@/services/admin/booking-service'
import { getStatusVariant, formatDateTimeUTC } from '@/lib/utils'
import { CalendarDays, Truck, Ban, FileText, CheckCircle } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'

const { data: bookings, error, isLoading, refetch } = useAdminBookings()
const cancelBooking = useAdminCancelBooking()
const cancelLoading = ref({})
const showCancelDialog = ref(false)
const selectedBooking = ref(null)

// Contract dialog state
const contractDialogOpen = ref(false)
const selectedBookingForContract = ref(null)

const groupedBookings = computed(() => {
  const groups = {
    pending: [],
    confirmed: []
  }

  bookings.value?.forEach(booking => {
    switch (booking.status) {
      case 'pending':
        groups.pending.push(booking)
        break
      case 'confirmed':
        groups.confirmed.push(booking)
        break
      default:
        // Only show pending and confirmed bookings in this view
        break
    }
  })

  // Sort each group by created_at (newest first)
  Object.values(groups).forEach(group => {
    group.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  })

  return groups
})

function shouldShowCancelButton(booking) {
  // Admin can cancel pending or confirmed bookings
  return booking && (booking.status === 'pending' || booking.status === 'confirmed')
}

function getGroupIcon(groupName) {
  switch (groupName) {
    case 'pending':
      return '⏳'
    case 'confirmed':
      return '✅'
    default:
      return '📋'
  }
}

function getGroupLabel(groupName) {
  switch (groupName) {
    case 'pending':
      return 'Pending Bookings'
    case 'confirmed':
      return 'Confirmed Bookings'
    default:
      return groupName.replace(/([A-Z])/g, ' $1').trim()
  }
}

function getGroupBadgeVariant(groupName) {
  switch (groupName) {
    case 'pending':
      return 'warning'
    case 'confirmed':
      return 'default'
    default:
      return 'secondary'
  }
}

function openCancelDialog(booking) {
  selectedBooking.value = booking
  showCancelDialog.value = true
}

function openContractDialog(booking) {
  console.log('Opening contract for booking:', booking)
  selectedBookingForContract.value = booking
  contractDialogOpen.value = true
}

function closeContractDialog() {
  contractDialogOpen.value = false
  selectedBookingForContract.value = null
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
  if (!date) return ''
  if (!pretty) {
    return formatDateTimeUTC(date)
  }
  return formatDateTimeUTC(date, 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
    .replace(',', '')
    .replace(',', '')
    .replace(/(\d{4}) (\d{1,2}):(\d{2})/, '$1 · $2:$3')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}
.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  z-index: 1001;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  z-index: 1002;
}
</style>
