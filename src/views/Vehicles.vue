<template>
  <div class="container mx-auto">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Vehicles</h1>
        <p class="text-muted-foreground">Browse our available vehicles</p>
      </div>
      <!-- Add Vehicle Button (admin only) -->
      <template v-if="userAuth.isAdmin()">
        <AddVehicleDialog
          :open="dialogStore.addOpen"
          @vehicle-added="refetch"
          @close="dialogStore.closeAdd"
        />
        <RouterLink :to="{ name: 'add-vehicle' }">
          <Button class="cursor-pointer" variant="default">Add Vehicle</Button>
        </RouterLink>
      </template>
    </div>

    <!-- Filter form -->
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
          <Input
            id="search"
            v-model="filterForm.search"
            placeholder="Search by name"
            @input="handleFilterChange"
          />
        </div>
        <div>
          <Label for="brand" class="mb-1">Brand</Label>
          <Input
            id="brand"
            v-model="filterForm.brand"
            placeholder="Filter by brand"
            @input="handleFilterChange"
          />
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
                @click="
                  () => {
                    filterForm.type = type.value
                    handleFilterChange()
                  }
                "
              >
                <Check
                  class="mr-2 h-4 w-4"
                  :class="cn(filterForm.type === type.value ? 'opacity-100' : 'opacity-0')"
                />
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
                @click="
                  () => {
                    filterForm.status = status.value
                    handleFilterChange()
                  }
                "
              >
                <Check
                  class="mr-2 h-4 w-4"
                  :class="cn(filterForm.status === status.value ? 'opacity-100' : 'opacity-0')"
                />
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
        <template
          v-for="page in vehicles.pages"
          :key="page?.meta?.nextCursor || page?.meta?.cursor"
        >
          <VehicleCard v-for="vehicle in page.data" :key="vehicle.id" :vehicle="vehicle" />
        </template>
      </div>

      <div v-else class="mt-8 flex flex-col items-center justify-center text-center">
        <div class="text-3xl mb-2">🔍</div>
        <h3 class="text-lg font-semibold">No vehicles found</h3>
        <p class="text-muted-foreground mt-1">
          {{
            isFiltersActive ? 'Try adjusting your filters' : 'No vehicles available at the moment'
          }}
        </p>
      </div>

      <div v-if="hasNextPage" class="mt-8 flex justify-center" ref="loadMoreRef">
        <Loader2 v-if="isFetchingNextPage" class="h-8 w-8 animate-spin" />
        <span v-else>Loading more...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Loader2, AlertCircle, ChevronDown, X, Check } from 'lucide-vue-next'
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
import VehicleCard from '@/components/features/vehicles/VehicleCard.vue'
import { useVehicles } from '@/services/vehicle-service'
import { useIntersectionObserver } from '@vueuse/core'
import { useDebounce } from '@/stores/useDebounce'
import Loading from '@/components/features/Loading.vue'
import { cn } from '@/lib/utils'
import { useVehicleDialogStore } from '@/stores/vehicleDialogStore'
import { useUserAuth } from '@/services/useUserAuth'

const debounceStore = useDebounce()
const dialogStore = useVehicleDialogStore()
const userAuth = useUserAuth()

// Filter form state
const filterForm = ref({
  search: '',
  brand: '',
  type: '',
  status: '',
})

// Actual filter values used for the API query
const filters = ref({})

// Apply filters with debounce
const handleFilterChange = debounceStore.debounce(
  () => {
    // Only add non-empty values to the filters
    filters.value = Object.entries(filterForm.value).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        // Use the key as is, but map 'search' to 'name' for backward compatibility
        const apiKey = key === 'search' ? 'name' : key
        acc[apiKey] = value.trim()
      }
      return acc
    }, {})
  },
  400,
  'vehicle-filters',
)

// Watch for filter changes
watch(
  filterForm,
  () => {
    handleFilterChange()
  },
  { deep: true },
)

// Check if any filters are active
const isFiltersActive = computed(() => {
  return (
    filterForm.value.search ||
    filterForm.value.brand ||
    filterForm.value.type ||
    filterForm.value.status
  )
})

// Count active filters
const activeFiltersCount = computed(() => {
  let count = 0
  if (filterForm.value.search) count++
  if (filterForm.value.brand) count++
  if (filterForm.value.type) count++
  if (filterForm.value.status) count++
  return count
})

// Clear all filters
const clearFilters = () => {
  filterForm.value = {
    search: '',
    brand: '',
    type: '',
    status: '',
  }
  filters.value = {}

  // Force a refetch after clearing
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

// Refetch when filters change
watch(
  filters,
  () => {
    // Ensure we refetch data when filters change
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
</script>
