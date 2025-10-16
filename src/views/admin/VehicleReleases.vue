<template>
  <div class="container space-y-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Vehicle Releases</h1>
    </div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading bookings..." />
    </div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>
    <div v-else>
      <div v-if="!bookings.length" class="text-center text-muted-foreground py-12">
        <div class="text-4xl mb-4">🚗</div>
        <p class="text-lg">No bookings ready for release.</p>
        <p class="text-sm">All vehicles have been released or there are no upcoming rentals.</p>
      </div>
      <div v-else>
        <!-- Summary Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ groupedBookings.today.length }}</div>
            <div class="text-sm text-blue-600 dark:text-blue-400">Today</div>
          </div>
          <div class="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ groupedBookings.nextWeek.length }}</div>
            <div class="text-sm text-orange-600 dark:text-orange-400">Next Week</div>
          </div>
          <div class="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ groupedBookings.nextMonth.length }}</div>
            <div class="text-sm text-green-600 dark:text-green-400">Next Month</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ groupedBookings.later.length }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Later</div>
          </div>
        </div>

        <!-- Grouped Bookings -->
        <div class="space-y-8">
          <div v-for="(bookingsInGroup, groupName) in groupedBookings" :key="groupName" class="space-y-4">
            <div class="flex items-center gap-3 pb-2 border-b">
              <div class="flex items-center gap-2">
                <span class="text-2xl">{{ getGroupIcon(groupName) }}</span>
                <h2 class="text-xl font-semibold capitalize">
                  {{ getGroupLabel(groupName) }}
                </h2>
              </div>
              <Badge :variant="getGroupBadgeVariant(groupName)" class="ml-auto">
                {{ bookingsInGroup.length }} {{ bookingsInGroup.length === 1 ? 'booking' : 'bookings' }}
              </Badge>
            </div>

            <div v-if="!bookingsInGroup.length" class="text-muted-foreground italic text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              No bookings in this period.
            </div>

            <div v-else :class="groupName === 'today' ? 'ring-2 ring-blue-200 dark:ring-blue-800 rounded-lg p-4 bg-blue-50/30 dark:bg-blue-950/10' : ''">
              <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Card v-for="booking in bookingsInGroup" :key="booking.id" class="border border-border bg-card hover:shadow-md transition-shadow">
                  <CardHeader class="pb-3">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex-1 min-w-0">
                        <CardTitle class="text-lg font-semibold truncate">{{
                          booking.vehicle?.name || 'Vehicle'
                        }}</CardTitle>
                        <CardDescription class="truncate">
                          {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }} ({{ booking.vehicle?.year }})
                        </CardDescription>
                      </div>
                      <div class="flex flex-col items-end gap-2">
                        <Badge :variant="getStatusVariant(booking.status)" size="sm">
                          {{ booking.status.replace('_', ' ') }}
                        </Badge>
                        <div class="text-xs text-muted-foreground">
                          ID: {{ booking.id }}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent class="space-y-4">
                    <div v-if="booking.vehicle?.primary_image_url" class="relative">
                      <img
                        :src="booking.vehicle.primary_image_url"
                        alt="Vehicle"
                        class="w-full h-32 object-cover rounded-lg shadow-sm border"
                      />
                      <!-- <div class="absolute top-2 right-2">
                        <Badge variant="secondary" size="sm" class="bg-black/70 text-white border-0">
                          {{ booking.vehicle?.transmission || 'N/A' }}
                        </Badge>
                      </div> -->
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

                    <div class="flex gap-2 pt-2">
                      <Button
                        v-if="!booking.vehicle_release"
                        variant="default"
                        size="sm"
                        @click="openReleaseDialog(booking)"
                        class="flex-1"
                        :class="groupName === 'today' ? 'bg-blue-600 hover:bg-blue-700' : ''"
                      >
                        <span class="mr-2">🚗</span>
                        Release Now
                      </Button>
                      <Badge v-else variant="success" class="flex-1 justify-center py-2">
                        <span class="mr-2">✅</span>
                        Released
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <VehicleReleaseDialog
      v-if="releaseDialogOpen"
      :booking="selectedBooking"
      :open="releaseDialogOpen"
      @update:open="releaseDialogOpen = $event"
      @released="onReleased"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAdminVehicleReleases } from '@/services/admin/vehicle-release-service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Loading from '@/components/features/Loading.vue'
import VehicleReleaseDialog from '@/components/features/vehicle-release/VehicleReleaseDialog.vue'
import { toast } from 'vue-sonner'
import { formatDateTimeUTC } from '@/lib/utils'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return formatDateTimeUTC(dateStr)
}

function getStatusVariant(status) {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'confirmed':
      return 'success'
    case 'for_release':
      return 'default'
    case 'released':
      return 'available'
    default:
      return 'secondary'
  }
}

function getGroupIcon(groupName) {
  switch (groupName) {
    case 'today':
      return '🔥'
    case 'nextWeek':
      return '📅'
    case 'nextMonth':
      return '📆'
    case 'later':
      return '⏰'
    default:
      return '📋'
  }
}

function getGroupLabel(groupName) {
  switch (groupName) {
    case 'today':
      return 'Release Today'
    case 'nextWeek':
      return 'Next 7 Days'
    case 'nextMonth':
      return 'Next Month'
    case 'later':
      return 'Future Releases'
    default:
      return groupName.replace(/([A-Z])/g, ' $1').trim()
  }
}

function getGroupBadgeVariant(groupName) {
  switch (groupName) {
    case 'today':
      return 'destructive'
    case 'nextWeek':
      return 'warning'
    case 'nextMonth':
      return 'secondary'
    case 'later':
      return 'outline'
    default:
      return 'secondary'
  }
}

const { data, error, isLoading, refetch } = useAdminVehicleReleases()
const bookings = computed(() => data.value || [])
const releaseDialogOpen = ref(false)
const selectedBooking = ref(null)

const groupedBookings = computed(() => {
  const groups = {
    today: [],
    nextWeek: [],
    nextMonth: [],
    later: []
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(today)
  endOfToday.setHours(23, 59, 59, 999)

  const nextWeekEnd = new Date(today)
  nextWeekEnd.setDate(today.getDate() + 7)

  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 1)

  bookings.value.forEach(booking => {
    const startDate = new Date(booking.start_date)
    if (startDate >= today && startDate <= endOfToday) {
      groups.today.push(booking)
    } else if (startDate > endOfToday && startDate < nextWeekEnd) {
      groups.nextWeek.push(booking)
    } else if (startDate >= nextMonthStart && startDate < nextMonthEnd) {
      groups.nextMonth.push(booking)
    } else {
      groups.later.push(booking)
    }
  })

  // Sort each group by start_date
  Object.values(groups).forEach(group => {
    group.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
  })

  return groups
})

function openReleaseDialog(booking) {
  selectedBooking.value = booking
  releaseDialogOpen.value = true
}
function onReleased() {
  const releasedName = selectedBooking.value?.vehicle?.name || 'Vehicle'
  releaseDialogOpen.value = false
  toast.success('Vehicle released', {
    description: `${releasedName} released.`,
  })
  selectedBooking.value = null
  refetch()
}
</script>
