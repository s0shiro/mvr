<template>
  <div class="container space-y-6">
    <div class="flex justify-between items-center mb-4">
      <h1 id="vehicle-releases-header" class="text-2xl font-bold">Vehicle Releases</h1>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="startTour" class="gap-1">
          <HelpCircle class="w-4 h-4" />
          Guide
        </Button>
      </div>
    </div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading bookings..." />
    </div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>
    <div v-else>
      <div v-if="totalCount === 0" class="text-center text-muted-foreground py-12">
        <div class="text-4xl mb-4">🚗</div>
        <p class="text-lg">No bookings ready for release.</p>
        <p class="text-sm">All vehicles have been released or there are no upcoming rentals.</p>
      </div>
      <div v-else class="space-y-4">
        <Tabs v-model="activeGroup" class="w-full">
          <TabsList data-tour="tabs-list" class="w-full flex gap-2 overflow-x-auto no-scrollbar py-1 md:py-0 md:grid md:grid-cols-4 h-auto md:h-10">
            <TabsTrigger value="today" class="flex items-center gap-2 shrink-0 min-w-[130px] md:min-w-0 px-3 py-2 md:py-0 rounded-md text-xs md:text-sm justify-center transition-colors data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-950/30 data-[state=active]:border data-[state=active]:border-blue-200 dark:data-[state=active]:border-blue-800 data-[state=active]:shadow-sm">
              <Car class="w-4 h-4 text-blue-600" />
              <span class="hidden sm:inline">Today</span>
              <Badge variant="destructive" size="sm">{{ groupedBookings.today.length }}</Badge>
            </TabsTrigger>
            <TabsTrigger value="nextWeek" class="flex items-center gap-2 shrink-0 min-w-[130px] md:min-w-0 px-3 py-2 md:py-0 rounded-md text-xs md:text-sm justify-center transition-colors data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-950/30 data-[state=active]:border data-[state=active]:border-orange-200 dark:data-[state=active]:border-orange-800 data-[state=active]:shadow-sm">
              <CalendarDays class="w-4 h-4 text-orange-600" />
              <span class="hidden sm:inline">Next Week</span>
              <Badge variant="warning" size="sm">{{ groupedBookings.nextWeek.length }}</Badge>
            </TabsTrigger>
            <TabsTrigger value="nextMonth" class="flex items-center gap-2 shrink-0 min-w-[130px] md:min-w-0 px-3 py-2 md:py-0 rounded-md text-xs md:text-sm justify-center transition-colors data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-950/30 data-[state=active]:border data-[state=active]:border-green-200 dark:data-[state=active]:border-green-800 data-[state=active]:shadow-sm">
              <Calendar class="w-4 h-4 text-green-600" />
              <span class="hidden sm:inline">Next Month</span>
              <Badge variant="secondary" size="sm">{{ groupedBookings.nextMonth.length }}</Badge>
            </TabsTrigger>
            <TabsTrigger value="later" class="flex items-center gap-2 shrink-0 min-w-[130px] md:min-w-0 px-3 py-2 md:py-0 rounded-md text-xs md:text-sm justify-center transition-colors data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800/40 data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-700 data-[state=active]:shadow-sm">
              <Clock class="w-4 h-4 text-gray-600" />
              <span class="hidden sm:inline">Later</span>
              <Badge variant="outline" size="sm">{{ groupedBookings.later.length }}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <div class="space-y-4">
              <div class="flex items-center gap-3 pb-2 border-b">
                <div class="flex items-center gap-2">
                  <Car class="w-5 h-5 text-blue-600" />
                  <h2 class="text-xl font-semibold">Release Today</h2>
                </div>
                <Badge variant="destructive" class="ml-auto">
                  {{ groupedBookings.today.length }} {{ groupedBookings.today.length === 1 ? 'booking' : 'bookings' }}
                </Badge>
              </div>
              <div v-if="!groupedBookings.today.length" class="text-muted-foreground text-center py-6 text-sm">
                No bookings in this period.
              </div>
              <div v-else class="ring-2 ring-blue-200 dark:ring-blue-800 rounded-lg p-4 bg-blue-50/30 dark:bg-blue-950/10">
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Card v-for="(booking, idx) in groupedBookings.today" :key="booking.id" :data-tour="idx === 0 ? 'release-card' : null" class="border border-border bg-card shadow-sm hover:shadow-md transition">
                    <CardHeader class="pb-3">
                      <div class="flex items-center justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <CardTitle class="text-base font-semibold truncate flex items-center gap-2">
                            {{ booking.vehicle?.name || 'Vehicle' }}
                            <Badge :variant="getStatusVariant(booking.status)" size="sm" class="capitalize">
                              {{ booking.status.replace('_', ' ') }}
                            </Badge>
                          </CardTitle>
                          <CardDescription class="truncate text-xs">
                            {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }} ({{ booking.vehicle?.year }})
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent class="space-y-4">
                      <div v-if="booking.vehicle?.primary_image_url" class="relative overflow-hidden rounded-md">
                        <img :src="booking.vehicle.primary_image_url" alt="Vehicle" class="w-full h-28 md:h-32 object-cover" />
                      </div>
                      <div class="grid grid-cols-2 gap-3 text-xs md:text-sm">
                        <div>
                          <span class="font-medium text-muted-foreground">Customer</span>
                          <div class="font-medium truncate">{{ booking.user?.name || 'N/A' }}</div>
                        </div>
                        <div>
                          <span class="font-medium text-muted-foreground">Total</span>
                          <div class="font-medium text-primary">₱{{ booking.total_price }}</div>
                        </div>
                        <div class="col-span-2">
                          <span class="font-medium text-muted-foreground">Rental Period</span>
                          <div class="font-medium">{{ formatDate(booking.start_date) }} → {{ formatDate(booking.end_date) }}</div>
                        </div>
                      </div>
                      <div class="flex pt-1">
                        <Button v-if="!booking.vehicle_release" :data-tour="idx === 0 ? 'release-btn' : null" variant="default" size="sm" @click="openReleaseDialog(booking)" class="w-full bg-blue-600 hover:bg-blue-700">
                          <Car class="w-4 h-4 mr-2" /> Release Vehicle
                        </Button>
                        <Badge v-else variant="success" class="w-full justify-center py-2">
                          <CheckCircle2 class="w-4 h-4 mr-2" /> Released
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nextWeek">
            <div class="space-y-4">
              <div class="flex items-center gap-3 pb-2 border-b">
                <div class="flex items-center gap-2">
                  <CalendarDays class="w-5 h-5 text-orange-600" />
                  <h2 class="text-xl font-semibold">Next 7 Days</h2>
                </div>
                <Badge variant="warning" class="ml-auto">
                  {{ groupedBookings.nextWeek.length }} {{ groupedBookings.nextWeek.length === 1 ? 'booking' : 'bookings' }}
                </Badge>
              </div>
              <div v-if="!groupedBookings.nextWeek.length" class="text-muted-foreground text-center py-6 text-sm">
                No bookings in this period.
              </div>
              <div v-else>
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Card v-for="(booking, idx) in groupedBookings.nextWeek" :key="booking.id" class="border border-border bg-card shadow-sm hover:shadow-md transition">
                    <CardHeader class="pb-3">
                      <div class="flex items-center justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <CardTitle class="text-base font-semibold truncate flex items-center gap-2">
                            {{ booking.vehicle?.name || 'Vehicle' }}
                            <Badge :variant="getStatusVariant(booking.status)" size="sm" class="capitalize">
                              {{ booking.status.replace('_', ' ') }}
                            </Badge>
                          </CardTitle>
                          <CardDescription class="truncate text-xs">
                            {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }} ({{ booking.vehicle?.year }})
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent class="space-y-4">
                      <div v-if="booking.vehicle?.primary_image_url" class="relative overflow-hidden rounded-md">
                        <img :src="booking.vehicle.primary_image_url" alt="Vehicle" class="w-full h-28 md:h-32 object-cover" />
                      </div>
                      <div class="grid grid-cols-2 gap-3 text-xs md:text-sm">
                        <div>
                          <span class="font-medium text-muted-foreground">Customer</span>
                          <div class="font-medium truncate">{{ booking.user?.name || 'N/A' }}</div>
                        </div>
                        <div>
                          <span class="font-medium text-muted-foreground">Total</span>
                          <div class="font-medium text-primary">₱{{ booking.total_price }}</div>
                        </div>
                        <div class="col-span-2">
                          <span class="font-medium text-muted-foreground">Rental Period</span>
                          <div class="font-medium">{{ formatDate(booking.start_date) }} → {{ formatDate(booking.end_date) }}</div>
                        </div>
                      </div>
                      <div class="flex pt-1">
                        <Button v-if="!booking.vehicle_release" :data-tour="idx === 0 ? 'release-btn' : null" variant="default" size="sm" @click="openReleaseDialog(booking)" class="w-full">
                          <Car class="w-4 h-4 mr-2" /> Release Vehicle
                        </Button>
                        <Badge v-else variant="success" class="w-full justify-center py-2">
                          <CheckCircle2 class="w-4 h-4 mr-2" /> Released
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nextMonth">
            <div class="space-y-4">
              <div class="flex items-center gap-3 pb-2 border-b">
                <div class="flex items-center gap-2">
                  <Calendar class="w-5 h-5 text-green-600" />
                  <h2 class="text-xl font-semibold">Next Month</h2>
                </div>
                <Badge variant="secondary" class="ml-auto">
                  {{ groupedBookings.nextMonth.length }} {{ groupedBookings.nextMonth.length === 1 ? 'booking' : 'bookings' }}
                </Badge>
              </div>
              <div v-if="!groupedBookings.nextMonth.length" class="text-muted-foreground text-center py-6 text-sm">
                No bookings in this period.
              </div>
              <div v-else>
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Card v-for="(booking, idx) in groupedBookings.nextMonth" :key="booking.id" class="border border-border bg-card shadow-sm hover:shadow-md transition">
                    <CardHeader class="pb-3">
                      <div class="flex items-center justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <CardTitle class="text-base font-semibold truncate flex items-center gap-2">
                            {{ booking.vehicle?.name || 'Vehicle' }}
                            <Badge :variant="getStatusVariant(booking.status)" size="sm" class="capitalize">
                              {{ booking.status.replace('_', ' ') }}
                            </Badge>
                          </CardTitle>
                          <CardDescription class="truncate text-xs">
                            {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }} ({{ booking.vehicle?.year }})
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent class="space-y-4">
                      <div v-if="booking.vehicle?.primary_image_url" class="relative overflow-hidden rounded-md">
                        <img :src="booking.vehicle.primary_image_url" alt="Vehicle" class="w-full h-28 md:h-32 object-cover" />
                      </div>
                      <div class="grid grid-cols-2 gap-3 text-xs md:text-sm">
                        <div>
                          <span class="font-medium text-muted-foreground">Customer</span>
                          <div class="font-medium truncate">{{ booking.user?.name || 'N/A' }}</div>
                        </div>
                        <div>
                          <span class="font-medium text-muted-foreground">Total</span>
                          <div class="font-medium text-primary">₱{{ booking.total_price }}</div>
                        </div>
                        <div class="col-span-2">
                          <span class="font-medium text-muted-foreground">Rental Period</span>
                          <div class="font-medium">{{ formatDate(booking.start_date) }} → {{ formatDate(booking.end_date) }}</div>
                        </div>
                      </div>
                      <div class="flex pt-1">
                        <Button v-if="!booking.vehicle_release" :data-tour="idx === 0 ? 'release-btn' : null" variant="default" size="sm" @click="openReleaseDialog(booking)" class="w-full">
                          <Car class="w-4 h-4 mr-2" /> Release Vehicle
                        </Button>
                        <Badge v-else variant="success" class="w-full justify-center py-2">
                          <CheckCircle2 class="w-4 h-4 mr-2" /> Released
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="later">
            <div class="space-y-4">
              <div class="flex items-center gap-3 pb-2 border-b">
                <div class="flex items-center gap-2">
                  <Clock class="w-5 h-5 text-gray-600" />
                  <h2 class="text-xl font-semibold">Future Releases</h2>
                </div>
                <Badge variant="outline" class="ml-auto">
                  {{ groupedBookings.later.length }} {{ groupedBookings.later.length === 1 ? 'booking' : 'bookings' }}
                </Badge>
              </div>
              <div v-if="!groupedBookings.later.length" class="text-muted-foreground text-center py-6 text-sm">
                No bookings in this period.
              </div>
              <div v-else>
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Card v-for="(booking, idx) in groupedBookings.later" :key="booking.id" class="border border-border bg-card shadow-sm hover:shadow-md transition">
                    <CardHeader class="pb-3">
                      <div class="flex items-center justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <CardTitle class="text-base font-semibold truncate flex items-center gap-2">
                            {{ booking.vehicle?.name || 'Vehicle' }}
                            <Badge :variant="getStatusVariant(booking.status)" size="sm" class="capitalize">
                              {{ booking.status.replace('_', ' ') }}
                            </Badge>
                          </CardTitle>
                          <CardDescription class="truncate text-xs">
                            {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }} ({{ booking.vehicle?.year }})
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent class="space-y-4">
                      <div v-if="booking.vehicle?.primary_image_url" class="relative overflow-hidden rounded-md">
                        <img :src="booking.vehicle.primary_image_url" alt="Vehicle" class="w-full h-28 md:h-32 object-cover" />
                      </div>
                      <div class="grid grid-cols-2 gap-3 text-xs md:text-sm">
                        <div>
                          <span class="font-medium text-muted-foreground">Customer</span>
                          <div class="font-medium truncate">{{ booking.user?.name || 'N/A' }}</div>
                        </div>
                        <div>
                          <span class="font-medium text-muted-foreground">Total</span>
                          <div class="font-medium text-primary">₱{{ booking.total_price }}</div>
                        </div>
                        <div class="col-span-2">
                          <span class="font-medium text-muted-foreground">Rental Period</span>
                          <div class="font-medium">{{ formatDate(booking.start_date) }} → {{ formatDate(booking.end_date) }}</div>
                        </div>
                      </div>
                      <div class="flex pt-1">
                        <Button v-if="!booking.vehicle_release" :data-tour="idx === 0 ? 'release-btn' : null" variant="default" size="sm" @click="openReleaseDialog(booking)" class="w-full">
                          <Car class="w-4 h-4 mr-2" /> Release Vehicle
                        </Button>
                        <Badge v-else variant="success" class="w-full justify-center py-2">
                          <CheckCircle2 class="w-4 h-4 mr-2" /> Released
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
import { ref, computed, onMounted } from 'vue'
import { driver as createDriver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useAdminVehicleReleases } from '@/services/admin/vehicle-release-service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Car, CalendarDays, Calendar, Clock, CheckCircle2, HelpCircle } from 'lucide-vue-next'
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
const activeGroup = ref('today')

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

const totalCount = computed(() =>
  Object.values(groupedBookings.value).reduce((sum, arr) => sum + arr.length, 0)
)

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

function startTour() {
  const steps = buildTourSteps()
  if (!steps.length) {
    console.warn('[VehicleReleases Tour] No steps available.')
    return
  }
  const d = createDriver({
    showProgress: true,
    allowClose: true,
    popoverClass: 'text-sm',
    nextBtnText: 'Next',
    prevBtnText: 'Previous',
    doneBtnText: 'Finish',
    closeBtnText: 'Skip',
    steps
  })
  console.debug('[VehicleReleases Tour] Starting; total steps:', steps.length, steps)
  // driver.js expects optional starting index in drive(); no steps array here
  d.drive() // start at step 0
  localStorage.setItem('vehicleReleasesTourSeen', '1')
}

function buildTourSteps() {
  const steps = []
  // Always include header as first step
  if (document.querySelector('#vehicle-releases-header')) {
    steps.push({
      element: '#vehicle-releases-header',
      popover: {
        title: 'Vehicle Releases',
        description: 'View and release upcoming vehicle bookings.'
      }
    })
  }
  // Tabs step
  if (document.querySelector('[data-tour="tabs-list"]')) {
    steps.push({
      element: '[data-tour="tabs-list"]',
      popover: {
        title: 'Choose Time Range',
        description: 'Select a tab (Today, Next Week, Next Month, Later) to filter bookings.'
      }
    })
  }
  // Card or fallback explanation
  if (document.querySelector('[data-tour="release-card"]')) {
    steps.push({
      element: '[data-tour="release-card"]',
      popover: {
        title: 'Booking Card',
        description: 'Shows vehicle details, customer, price and rental period.'
      }
    })
  } else {
    steps.push({
      element: '#vehicle-releases-header',
      popover: {
        title: 'No Booking Cards',
        description: 'No bookings in this range yet. When they appear, each will have a card.'
      }
    })
  }
  // Release button (visible in current tab only)
  const releaseBtns = Array.from(document.querySelectorAll('[data-tour="release-btn"]'))
  const visibleReleaseBtn = releaseBtns.find(el => el && el.offsetParent !== null)
  if (visibleReleaseBtn) {
    steps.push({
      element: visibleReleaseBtn,
      popover: {
        title: 'Release Vehicle',
        description: 'Open the form to release this vehicle to the customer.'
      }
    })
  }
  return steps
}

onMounted(() => {
  if (!localStorage.getItem('vehicleReleasesTourSeen')) {
    // delay to ensure DOM rendered
    setTimeout(() => startTour(), 600)
  }
})
</script>

<style scoped>
/* Hide scrollbar cross-browser */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
