<script setup>
import { computed, ref, watch } from 'vue'
import UserList from '@/components/features/UserList.vue'
import Loading from '@/components/features/Loading.vue'
import { useUsers } from '@/services/userService'
import { useDebounce } from '@/stores/useDebounce'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const debounceStore = useDebounce()
const searchInput = ref('')
const roleFilter = ref(null)

const debouncedFilters = ref({
  role: null,
  search: '',
})

// Set up the debounced search with watchEffect
const updateFilters = () => {
  console.log('Updating filters:', { role: roleFilter.value, search: searchInput.value }) // Debug log
  debouncedFilters.value = {
    role: roleFilter.value,
    search: searchInput.value,
  }
}

const debouncedSearch = debounceStore.debounce(updateFilters, 300, 'userSearch')

// Watch for role changes
watch(roleFilter, (newValue) => {
  console.log('Role changed to:', newValue) // Debug log
  updateFilters()
})

const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } =
  useUsers(computed(() => debouncedFilters.value))

const users = computed(() => {
  if (!data.value?.pages) return []
  return data.value.pages.reduce((acc, page) => {
    if (page?.data) {
      return [...acc, ...page.data]
    }
    return acc
  }, [])
})
</script>

<template>
  <div class="container mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">User Management</h1>
    </div>

    <!-- Filters -->
    <div class="flex gap-4">
      <div class="flex-1">
        <Input v-model="searchInput" placeholder="Search users..." @input="debouncedSearch()" />
      </div>
      <div class="">
        <Select v-model="roleFilter">
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="null">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading bookings..." />
    </div>

    <UserList
      v-else
      :users="users"
      :isLoading="isLoading"
      :isFetchingNextPage="isFetchingNextPage"
      :fetchNextPage="fetchNextPage"
      :hasNextPage="hasNextPage"
    />
  </div>
</template>
