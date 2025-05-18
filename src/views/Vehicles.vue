<template>
  <div class="container mx-auto">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Vehicles</h1>
        <p class="text-muted-foreground">Browse our available vehicles</p>
      </div>
      <!-- Add Vehicle Button (admin only, but for demo always visible) -->
      <AddVehicleDialog @vehicle-added="refetch" />
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
          <label for="search" class="mb-1 block text-sm font-medium">Search</label>
          <Input
            id="search"
            v-model="filterForm.search"
            placeholder="Search by name"
            @input="handleFilterChange"
          />
        </div>
        <div>
          <label for="brand" class="mb-1 block text-sm font-medium">Brand</label>
          <Input
            id="brand"
            v-model="filterForm.brand"
            placeholder="Filter by brand"
            @input="handleFilterChange"
          />
        </div>
        <div>
          <label for="type" class="mb-1 block text-sm font-medium">Type</label>
          <div class="relative">
            <select
              id="type"
              v-model="filterForm.type"
              class="border-input focus-visible:ring-ring/50 aria-invalid:border-destructive flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"
              @change="handleFilterChange"
            >
              <option value="">All types</option>
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown class="h-4 w-4 opacity-50" />
            </div>
          </div>
        </div>
        <div>
          <label for="status" class="mb-1 block text-sm font-medium">Status</label>
          <div class="relative">
            <select
              id="status"
              v-model="filterForm.status"
              class="border-input focus-visible:ring-ring/50 aria-invalid:border-destructive flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"
              @change="handleFilterChange"
            >
              <option value="">All statuses</option>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
              <option value="rented">Rented</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown class="h-4 w-4 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLoading && !hasNextPage" class="mt-8 flex justify-center">
      <Loader2 class="h-8 w-8 animate-spin" />
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
import { Loader2, AlertCircle, ChevronDown, X } from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import VehicleCard from '@/components/features/vehicles/VehicleCard.vue'
import AddVehicleDialog from '@/components/features/vehicles/AddVehicleDialog.vue'
import { useVehicles } from '@/services/vehicle-service'
import { useIntersectionObserver } from '@vueuse/core'
import { useDebounce } from '@/stores/useDebounce'

const debounceStore = useDebounce()

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
</script>
