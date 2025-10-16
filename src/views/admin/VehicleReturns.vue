<template>
  <div class="container space-y-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Vehicle Returns</h1>
    </div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading bookings..." />
    </div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>
    <div v-else>
      <div v-if="!bookings.length" class="text-center text-muted-foreground py-12">
        <div class="text-4xl mb-4">🔄</div>
        <p class="text-lg">No vehicles are currently out for return.</p>
        <p class="text-sm">All rentals are either active or completed.</p>
      </div>
      <div v-else>
        <!-- Summary Stats -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ groupedBookings.overdue.length }}</div>
            <div class="text-sm text-red-600 dark:text-red-400">Overdue</div>
          </div>
          <div class="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ groupedBookings.dueToday.length }}</div>
            <div class="text-sm text-orange-600 dark:text-orange-400">Due Today</div>
          </div>
          <div class="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ groupedBookings.dueThisWeek.length }}</div>
            <div class="text-sm text-yellow-600 dark:text-yellow-400">This Week</div>
          </div>
          <div class="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ groupedBookings.dueNextWeek.length }}</div>
            <div class="text-sm text-blue-600 dark:text-blue-400">Next Week</div>
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
                <h2 class="text-xl font-semibold">
                  {{ getGroupLabel(groupName) }}
                </h2>
              </div>
              <Badge :variant="getGroupBadgeVariant(groupName)" class="ml-auto">
                {{ bookingsInGroup.length }} {{ bookingsInGroup.length === 1 ? 'vehicle' : 'vehicles' }}
              </Badge>
            </div>

            <div v-if="!bookingsInGroup.length" class="text-muted-foreground italic text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              No vehicles in this period.
            </div>

            <div v-else :class="groupName === 'overdue' ? 'ring-2 ring-red-200 dark:ring-red-800 rounded-lg p-4 bg-red-50/30 dark:bg-red-950/10' : groupName === 'dueToday' ? 'ring-2 ring-orange-200 dark:ring-orange-800 rounded-lg p-4 bg-orange-50/30 dark:bg-orange-950/10' : ''">
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
                      <div v-if="groupName === 'overdue'" class="absolute top-2 left-2">
                        <Badge variant="destructive" size="sm" class="bg-red-600 text-white border-0">
                          OVERDUE
                        </Badge>
                      </div>
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

                    <!-- Return Status Section -->
                    <div v-if="booking.vehicle_return" class="space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium">Return Status:</span>
                        <Badge :variant="getReturnStatusVariant(booking.vehicle_return.status)" size="sm">
                          {{ getReturnStatusLabel(booking.vehicle_return.status) }}
                        </Badge>
                      </div>

                      <div v-if="booking.vehicle_return.status === 'customer_submitted'" class="text-xs text-muted-foreground">
                        Customer submitted: {{ formatDate(booking.vehicle_return.customer_submitted_at) }}
                      </div>

                      <div v-if="booking.vehicle_return.deposit_status" class="flex items-center justify-between mt-2">
                        <span class="text-sm font-medium">Deposit:</span>
                        <div class="flex items-center gap-2">
                          <Badge :variant="getDepositStatusVariant(booking.vehicle_return.deposit_status)" size="sm">
                            {{ getDepositStatusLabel(booking.vehicle_return.deposit_status) }}
                          </Badge>
                          <span v-if="booking.vehicle_return.deposit_status === 'refunded'" class="text-sm text-green-600 font-medium">
                            ₱{{ booking.vehicle_return.deposit_refund_amount || 0 }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="flex gap-2 pt-2">
                      <Button
                        v-if="!booking.vehicle_return"
                        variant="default"
                        size="sm"
                        @click="goToReturnPage(booking)"
                        class="flex-1"
                        :class="groupName === 'overdue' ? 'bg-red-600 hover:bg-red-700' : groupName === 'dueToday' ? 'bg-orange-600 hover:bg-orange-700' : ''"
                      >
                        <span class="mr-2">🔄</span>
                        Process Return
                      </Button>
                      <Button
                        v-else-if="booking.vehicle_return.status === 'customer_submitted'"
                        variant="default"
                        size="sm"
                        @click="goToReturnPage(booking)"
                        class="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <span class="mr-2">👀</span>
                        Review Return
                      </Button>
                      <Badge v-else-if="booking.vehicle_return.status === 'completed'" variant="success" class="flex-1 justify-center py-2">
                        <span class="mr-2">✅</span>
                        Completed
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminVehicleReturns } from '@/services/admin/vehicle-return-service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Loading from '@/components/features/Loading.vue'
import { getStatusVariant, formatDateTimeUTC } from '@/lib/utils'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return formatDateTimeUTC(dateStr)
}

const { data, error, isLoading } = useAdminVehicleReturns()
const bookings = computed(() => data.value || [])
const router = useRouter()

const groupedBookings = computed(() => {
  const groups = {
    overdue: [],
    dueToday: [],
    dueThisWeek: [],
    dueNextWeek: [],
    later: []
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(today)
  endOfToday.setHours(23, 59, 59, 999)

  const endOfThisWeek = new Date(today)
  endOfThisWeek.setDate(today.getDate() + (7 - today.getDay())) // End of current week (Sunday)

  const endOfNextWeek = new Date(endOfThisWeek)
  endOfNextWeek.setDate(endOfThisWeek.getDate() + 7) // End of next week

  bookings.value.forEach(booking => {
    const endDate = new Date(booking.end_date)
    if (endDate < today) {
      groups.overdue.push(booking)
    } else if (endDate >= today && endDate <= endOfToday) {
      groups.dueToday.push(booking)
    } else if (endDate > endOfToday && endDate <= endOfThisWeek) {
      groups.dueThisWeek.push(booking)
    } else if (endDate > endOfThisWeek && endDate <= endOfNextWeek) {
      groups.dueNextWeek.push(booking)
    } else {
      groups.later.push(booking)
    }
  })

  // Sort each group by end_date
  Object.values(groups).forEach(group => {
    group.sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
  })

  return groups
})

function goToReturnPage(booking) {
  router.push({ name: 'admin-vehicle-return-process', params: { id: booking.id } })
}

function getDepositStatusVariant(status) {
  switch (status) {
    case 'refunded':
      return 'success'
    case 'withheld':
      return 'destructive'
    case 'pending':
    default:
      return 'secondary'
  }
}

function getDepositStatusLabel(status) {
  switch (status) {
    case 'refunded':
      return 'Refunded'
    case 'withheld':
      return 'Withheld'
    case 'pending':
    default:
      return 'Pending Refund'
  }
}

function getGroupIcon(groupName) {
  switch (groupName) {
    case 'overdue':
      return '🚨'
    case 'dueToday':
      return '⏰'
    case 'dueThisWeek':
      return '📅'
    case 'dueNextWeek':
      return '📆'
    case 'later':
      return '🕐'
    default:
      return '🔄'
  }
}

function getGroupLabel(groupName) {
  switch (groupName) {
    case 'overdue':
      return 'Overdue Returns'
    case 'dueToday':
      return 'Due Today'
    case 'dueThisWeek':
      return 'Due This Week'
    case 'dueNextWeek':
      return 'Due Next Week'
    case 'later':
      return 'Future Returns'
    default:
      return groupName.replace(/([A-Z])/g, ' $1').trim()
  }
}

function getGroupBadgeVariant(groupName) {
  switch (groupName) {
    case 'overdue':
      return 'destructive'
    case 'dueToday':
      return 'warning'
    case 'dueThisWeek':
      return 'secondary'
    case 'dueNextWeek':
      return 'outline'
    case 'later':
      return 'outline'
    default:
      return 'secondary'
  }
}

function getReturnStatusVariant(status) {
  switch (status) {
    case 'completed':
      return 'success'
    case 'customer_submitted':
      return 'warning'
    case 'admin_processing':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getReturnStatusLabel(status) {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'customer_submitted':
      return 'Customer Submitted'
    case 'admin_processing':
      return 'Admin Processing'
    default:
      return status.replace('_', ' ')
  }
}
</script>
