<template>
  <div class="container mx-auto">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Vehicle Maintenance</h1>
        <p class="text-muted-foreground">Track and manage maintenance history for every vehicle</p>
      </div>
    </div>

    <div class="mt-6 rounded-lg border bg-card p-4">
      <div class="mb-2 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="text-sm font-medium">Filters</div>
          <div
            v-if="activeFiltersCount > 0"
            class="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground"
          >
            {{ activeFiltersCount }}
          </div>
        </div>
        <button
          v-if="isFiltersActive"
          class="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary hover:bg-primary/20"
          @click="clearFilters"
        >
          <X class="h-3 w-3" />
          Clear filters
        </button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <Label for="search" class="mb-1">Search</Label>
          <Input id="search" v-model="filterForm.search" placeholder="Search by name" @input="handleFilterChange" />
        </div>
        <div>
          <Label for="brand" class="mb-1">Brand</Label>
          <Input id="brand" v-model="filterForm.brand" placeholder="Filter by brand" @input="handleFilterChange" />
        </div>
        <div>
          <Label class="mb-1">Type</Label>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="w-full justify-between font-normal">
                {{ getActiveLabel(vehicleTypes, filterForm.type) }}
                <ChevronDown class="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-full min-w-[8rem]">
              <DropdownMenuLabel>Vehicle Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-for="type in vehicleTypes"
                :key="type.value"
                @click="() => {
                  filterForm.type = type.value
                  handleFilterChange()
                }"
              >
                <Check class="mr-2 h-4 w-4" :class="cn(filterForm.type === type.value ? 'opacity-100' : 'opacity-0')" />
                {{ type.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <Label class="mb-1">Status</Label>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="w-full justify-between font-normal">
                {{ getActiveLabel(statusTypes, filterForm.status) }}
                <ChevronDown class="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-full min-w-[8rem]">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-for="status in statusTypes"
                :key="status.value"
                @click="() => {
                  filterForm.status = status.value
                  handleFilterChange()
                }"
              >
                <Check class="mr-2 h-4 w-4" :class="cn(filterForm.status === status.value ? 'opacity-100' : 'opacity-0')" />
                {{ status.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="mt-8">
      <Loading text="Loading vehicles..." />
    </div>

    <div v-else-if="error" class="mt-8">
      <Alert variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{{ error?.message || 'Failed to load vehicles' }}</AlertDescription>
      </Alert>
    </div>
    <div v-else class="mt-8">
      <div
        v-if="vehicles?.pages?.length && vehicles.pages[0]?.data?.length"
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <template v-for="page in vehicles.pages" :key="page?.meta?.nextCursor || page?.meta?.cursor">
          <VehicleMaintenanceCard
            v-for="vehicle in page.data"
            :key="vehicle.id"
            :vehicle="vehicle"
            @add-maintenance="openAddMaintenanceDialog"
            @view-history="openHistoryDialog"
          />
        </template>
      </div>

      <div v-else class="mt-8 flex flex-col items-center justify-center text-center">
        <div class="text-3xl mb-2">🔧</div>
        <h3 class="text-lg font-semibold">No vehicles found</h3>
        <p class="text-muted-foreground mt-1">
          {{ isFiltersActive ? 'Try adjusting your filters' : 'No vehicles available at the moment' }}
        </p>
      </div>

      <div v-if="hasNextPage" class="mt-8 flex justify-center" ref="loadMoreRef">
        <Loader2 v-if="isFetchingNextPage" class="h-8 w-8 animate-spin" />
        <span v-else>Loading more...</span>
      </div>
    </div>

    <Dialog :open="isAddDialogOpen" @update:open="handleAddDialogToggle">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Maintenance Record</DialogTitle>
          <DialogDescription>
            {{ selectedVehicleForAdd?.name }} • {{ selectedVehicleForAdd?.plate_number }}
          </DialogDescription>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="submitAddForm">
          <div class="grid gap-2">
            <Label for="maintenance-date">Date</Label>
            <Popover>
              <PopoverTrigger as-child>
                <Button id="maintenance-date" variant="outline" class="justify-start text-left font-normal" type="button">
                  <CalendarIcon class="mr-2 h-4 w-4 text-muted-foreground" />
                  <span v-if="maintenanceDateValue">
                    {{ df.format(maintenanceDateValue.toDate(tz)) }}
                  </span>
                  <span v-else>Pick a date</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar
                  v-model="maintenanceDateValue"
                  @update:model-value="onMaintenanceDateChange"
                />
              </PopoverContent>
            </Popover>
            <p v-if="addErrors.maintenance_date" class="text-sm text-destructive">
              {{ addErrors.maintenance_date[0] }}
            </p>
          </div>
          <div class="grid gap-2">
            <Label for="maintenance-type">Maintenance Type</Label>
            <Input id="maintenance-type" v-model="addForm.maintenance_type" placeholder="e.g. Oil Change" required />
            <p v-if="addErrors.maintenance_type" class="text-sm text-destructive">
              {{ addErrors.maintenance_type[0] }}
            </p>
          </div>
          <div class="grid gap-2">
            <Label for="maintenance-amount">Amount</Label>
            <Input
              id="maintenance-amount"
              type="number"
              min="0"
              step="0.01"
              v-model="addForm.amount"
              placeholder="Enter cost"
              required
            />
            <p v-if="addErrors.amount" class="text-sm text-destructive">
              {{ addErrors.amount[0] }}
            </p>
          </div>
          <div class="grid gap-2">
            <Label for="maintenance-note">Note</Label>
            <Textarea
              id="maintenance-note"
              v-model="addForm.note"
              placeholder="Optional notes"
              rows="4"
            />
            <p v-if="addErrors.note" class="text-sm text-destructive">
              {{ addErrors.note[0] }}
            </p>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" @click="closeAddDialog">Cancel</Button>
            <Button type="submit" :disabled="isCreatingMaintenance">
              <Loader2 v-if="isCreatingMaintenance" class="mr-2 h-4 w-4 animate-spin" />
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog :open="isHistoryDialogOpen" @update:open="handleHistoryDialogToggle">
      <DialogContent class="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Maintenance History</DialogTitle>
          <DialogDescription>
            {{ selectedVehicleForHistory?.name }} • {{ selectedVehicleForHistory?.plate_number }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div class="flex-1">
              <Input
                id="history-search"
                v-model="historySearch"
                placeholder="Search by type or note"
                @input="debouncedHistorySearch"
              />
            </div>
          </div>

          <div v-if="historyBusy" class="py-8">
            <div class="flex justify-center">
              <Loader2 class="h-6 w-6 animate-spin" />
            </div>
          </div>
          <div v-else-if="historyError" class="py-4">
            <Alert variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {{ historyError?.response?.data?.message || historyError?.message || 'Failed to load maintenance history' }}
              </AlertDescription>
            </Alert>
          </div>
          <div v-else>
            <div v-if="historyItems.length" class="space-y-3">
              <div
                v-for="item in historyItems"
                :key="item.id"
                class="rounded-lg border bg-muted/40 p-4"
              >
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div class="text-sm text-muted-foreground">
                      {{ formatDate(item.maintenance_date) }}
                    </div>
                    <div class="text-base font-semibold capitalize">
                      {{ item.maintenance_type }}
                    </div>
                  </div>
                  <div class="text-base font-semibold text-primary">
                    {{ formatCurrency(item.amount) }}
                  </div>
                </div>
                <p v-if="item.note" class="mt-2 text-sm text-muted-foreground">{{ item.note }}</p>
              </div>
            </div>
            <div v-else class="py-8 text-center text-muted-foreground">No maintenance records yet.</div>

            <div
              v-if="historyMeta.total > historyMeta.per_page"
              class="flex items-center justify-between border-t pt-4"
            >
              <div class="text-sm text-muted-foreground">
                Page {{ historyMeta.current_page }} of {{ historyMeta.last_page }} • {{ historyMeta.total }} records
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" :disabled="historyMeta.current_page === 1 || historyBusy" @click="goToPreviousPage">
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="historyMeta.current_page === historyMeta.last_page || historyBusy"
                  @click="goToNextPage"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { Loader2, AlertCircle, ChevronDown, X, Check, Calendar as CalendarIcon } from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import Loading from '@/components/features/Loading.vue'
import VehicleMaintenanceCard from '@/components/features/vehicles/VehicleMaintenanceCard.vue'
import { useVehicles } from '@/services/vehicle-service'
import { useDebounce } from '@/stores/useDebounce'
import { useCreateVehicleMaintenance, useVehicleMaintenanceList } from '@/services/vehicle-maintenance-service'
import { cn } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { DateFormatter, getLocalTimeZone, today as intlToday } from '@internationalized/date'

const debounceStore = useDebounce()

const tz = getLocalTimeZone()
const df = new DateFormatter('en-US', { dateStyle: 'long' })
const maintenanceDateValue = ref(intlToday(tz))

const filterForm = ref({
  search: '',
  brand: '',
  type: '',
  status: '',
})

const filters = ref({})

const handleFilterChange = debounceStore.debounce(
  () => {
    filters.value = Object.entries(filterForm.value).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        const apiKey = key === 'search' ? 'name' : key
        acc[apiKey] = value.trim()
      }
      return acc
    }, {})
  },
  400,
  'vehicle-maintenance-filters',
)

watch(
  filterForm,
  () => {
    handleFilterChange()
  },
  { deep: true },
)

const isFiltersActive = computed(() => {
  return (
    filterForm.value.search ||
    filterForm.value.brand ||
    filterForm.value.type ||
    filterForm.value.status
  )
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filterForm.value.search) count++
  if (filterForm.value.brand) count++
  if (filterForm.value.type) count++
  if (filterForm.value.status) count++
  return count
})

const clearFilters = () => {
  filterForm.value = {
    search: '',
    brand: '',
    type: '',
    status: '',
  }
  filters.value = {}
  setTimeout(() => {
    refetch()
  }, 10)
}

const {
  data: vehicles,
  error,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  refetch,
} = useVehicles(filters)

watch(
  filters,
  () => {
    refetch()
  },
  { deep: true },
)

const loadMoreRef = ref(null)

useIntersectionObserver(loadMoreRef, async ([{ isIntersecting }]) => {
  if (isIntersecting && hasNextPage.value && !isFetchingNextPage.value) {
    await fetchNextPage()
  }
})

const vehicleTypes = [
  { label: 'All types', value: '' },
  { label: 'Car', value: 'car' },
  { label: 'Motorcycle', value: 'motorcycle' },
]

const statusTypes = [
  { label: 'All statuses', value: '' },
  { label: 'Available', value: 'available' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Rented', value: 'rented' },
]

const getActiveLabel = (items, value) => {
  const item = items.find((item) => item.value === value)
  return item?.label || items[0].label
}

const isAddDialogOpen = ref(false)
const selectedVehicleForAdd = ref(null)
const addForm = ref({
  maintenance_date: maintenanceDateValue.value.toString(),
  maintenance_type: '',
  amount: '',
  note: '',
})
const addErrors = ref({})

function resetAddForm() {
  const defaultDate = intlToday(tz)
  maintenanceDateValue.value = defaultDate
  addForm.value = {
    maintenance_date: defaultDate.toString(),
    maintenance_type: '',
    amount: '',
    note: '',
  }
  addErrors.value = {}
}

function onMaintenanceDateChange(val) {
  maintenanceDateValue.value = val
  addForm.value.maintenance_date = val ? val.toString() : ''
}

const { mutate: createMaintenance, isPending: isCreatingMaintenance } = useCreateVehicleMaintenance()

function openAddMaintenanceDialog(vehicle) {
  selectedVehicleForAdd.value = vehicle
  isAddDialogOpen.value = true
  resetAddForm()
}

function closeAddDialog() {
  isAddDialogOpen.value = false
  selectedVehicleForAdd.value = null
}

function handleAddDialogToggle(val) {
  isAddDialogOpen.value = val
  if (!val) {
    selectedVehicleForAdd.value = null
  }
}

function submitAddForm() {
  if (!selectedVehicleForAdd.value) return
  addErrors.value = {}
  const payload = {
    maintenance_date: addForm.value.maintenance_date,
    maintenance_type: addForm.value.maintenance_type,
    amount: Number(addForm.value.amount),
    note: addForm.value.note,
  }

  createMaintenance(
    { vehicleId: selectedVehicleForAdd.value.id, payload },
    {
      onSuccess: () => {
        toast.success('Maintenance record added')
        if (
          isHistoryDialogOpen.value &&
          selectedVehicleForHistory.value?.id === selectedVehicleForAdd.value.id
        ) {
          refetchHistory()
        }
        closeAddDialog()
      },
      onError: (error) => {
        if (error.response && error.response.status === 422) {
          addErrors.value = error.response.data.errors || {}
          toast.error('Validation error', {
            description: 'Please review the form fields.',
          })
        } else {
          toast.error('Failed to add maintenance record')
        }
      },
    },
  )
}

const isHistoryDialogOpen = ref(false)
const selectedVehicleForHistory = ref(null)
const historySearch = ref('')
const historySearchQuery = ref('')
const historyPage = ref(1)
const historyPerPage = ref(4)

const debouncedHistorySearch = debounceStore.debounce(() => {
  historyPage.value = 1
  historySearchQuery.value = historySearch.value
}, 400, 'vehicle-maintenance-history-search')

const historyParams = computed(() => ({
  page: historyPage.value,
  per_page: historyPerPage.value,
  search: historySearchQuery.value ? historySearchQuery.value : undefined,
}))

const {
  data: historyData,
  isLoading: historyIsLoading,
  isFetching: historyIsFetching,
  error: historyError,
  refetch: refetchHistory,
} = useVehicleMaintenanceList(
  computed(() => selectedVehicleForHistory.value?.id || null),
  historyParams,
  {
    enabled: computed(() => isHistoryDialogOpen.value && !!selectedVehicleForHistory.value?.id),
    keepPreviousData: true,
  },
)

const historyBusy = computed(() => historyIsLoading.value || historyIsFetching.value)
const historyItems = computed(() => historyData.value?.data || [])
const historyMeta = computed(() => {
  const meta = historyData.value?.meta
  if (meta) return meta
  return {
    current_page: historyPage.value,
    last_page: historyPage.value,
    per_page: historyPerPage.value,
    total: historyItems.value.length,
  }
})

watch(historyError, (err, previous) => {
  if (err && err !== previous && isHistoryDialogOpen.value) {
    toast.error(err.response?.data?.message || err.message || 'Failed to load maintenance history')
  }
})

function openHistoryDialog(vehicle) {
  selectedVehicleForHistory.value = vehicle
  historySearch.value = ''
  historySearchQuery.value = ''
  historyPage.value = 1
  isHistoryDialogOpen.value = true
}

function handleHistoryDialogToggle(val) {
  isHistoryDialogOpen.value = val
  if (!val) {
    selectedVehicleForHistory.value = null
    historySearch.value = ''
    historySearchQuery.value = ''
    historyPage.value = 1
  }
}

function goToPreviousPage() {
  if (historyMeta.value.current_page > 1) {
    historyPage.value -= 1
  }
}

function goToNextPage() {
  if (historyMeta.value.current_page < historyMeta.value.last_page) {
    historyPage.value += 1
  }
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})

const historyDateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' })

function formatCurrency(value) {
  if (value === null || value === undefined) return '₱0.00'
  return currencyFormatter.format(Number(value))
}

function formatDate(value) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return historyDateFormatter.format(parsed)
}
</script>
