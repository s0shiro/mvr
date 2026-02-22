<template>
  <div class="bg-card text-card-foreground rounded-xl shadow-md">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold flex items-center gap-2">
        <Users class="w-6 h-6" /> Driver Management
      </h1>
      <div class="flex gap-2 items-center">
        <Input v-model="filterForm.search" placeholder="Search drivers..." class="w-64" />
        <Button @click="openDialog(true)" variant="default">Add Driver</Button>
      </div>
    </div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading drivers..." />
    </div>
    <div v-else-if="error" class="text-red-500 text-center py-8">{{ error.message }}</div>
    <div v-else>
      <div v-if="drivers.length === 0" class="text-center text-muted-foreground py-8">
        No drivers yet.
      </div>
      <div v-else class="overflow-x-auto rounded-lg border bg-card text-card-foreground">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-100 dark:bg-gray-900">
            <tr>
              <th class="p-3 text-left font-semibold">Name</th>
              <th class="p-3 text-left font-semibold">Phone</th>
              <th class="p-3 text-left font-semibold">Email</th>
              <th class="p-3 text-left font-semibold">Status</th>
              <th class="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="driver in drivers" :key="driver.id" class="border-t">
              <td class="p-3">{{ driver.name }}</td>
              <td class="p-3">{{ driver.phone }}</td>
              <td class="p-3">{{ driver.email }}</td>
              <td class="p-3">
                <span :class="driver.status === 'active' ? 'text-green-600' : 'text-gray-400'">
                  {{ driver.status }}
                </span>
              </td>
              <td class="p-3">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon">
                      <Ellipsis class="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="min-w-[120px]">
                    <DropdownMenuItem @click="openDialog(false, driver)">Edit</DropdownMenuItem>
                    <DropdownMenuItem @click="deleteDriver(driver.id)">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Pagination Controls -->
        <div class="flex justify-between items-center py-4">
          <div class="text-sm text-muted-foreground">
            Showing
            <span class="font-semibold">{{ (currentPage - 1) * perPage + 1 }}</span>
            to
            <span class="font-semibold">{{ Math.min(currentPage * perPage, total) }}</span>
            of
            <span class="font-semibold">{{ total }}</span>
            drivers
          </div>
          <div class="flex gap-2">
            <Button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)"
              >Previous</Button
            >
            <span class="px-2">Page {{ currentPage }} of {{ lastPage }}</span>
            <Button :disabled="currentPage === lastPage" @click="goToPage(currentPage + 1)"
              >Next</Button
            >
          </div>
        </div>
      </div>
    </div>
    <!-- Add/Edit Dialog -->
    <Dialog :open="dialogOpen" @update:open="onDialogUpdate">
      <DialogContent>
        <DialogTitle>{{ editDriverData ? 'Edit Driver' : 'Add Driver' }}</DialogTitle>
        <form @submit.prevent="handleSubmit">
          <div class="flex flex-col gap-4 mt-2">
            <Input v-model="form.name" placeholder="Name" required />
            <Input v-model="form.phone" placeholder="Phone" />
            <Input v-model="form.email" placeholder="Email" type="email" />
            <div class="flex items-center gap-3">
              <Switch :model-value="form.status === 'active'" @update:model-value="updateStatus" />
              <Label>{{ form.status === 'active' ? 'Active' : 'Inactive' }}</Label>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" @click="closeDialog" :disabled="isPending"
              >Cancel</Button
            >
            <Button type="submit" variant="default" :disabled="isPending">
              <span v-if="isPending">Saving...</span>
              <span v-else>{{ editDriverData ? 'Update' : 'Add' }}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  useDrivers,
  useCreateDriver,
  useUpdateDriver,
  useDeleteDriver,
} from '@/services/driver-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Users } from 'lucide-vue-next'
import Loading from '@/components/features/Loading.vue'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Ellipsis } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useDebounce } from '@/stores/useDebounce'

const dialogOpen = ref(false)
const editDriverData = ref(null)
const form = ref({ name: '', phone: '', email: '', status: 'active' })
const currentPage = ref(1)
const perPage = ref(5)
const filterForm = ref({
  search: '',
})
const filters = ref({})
const debounceStore = useDebounce()

const handleFilterChange = debounceStore.debounce(
  () => {
    filters.value = filterForm.value.search ? { search: filterForm.value.search } : {}
    currentPage.value = 1
  },
  400,
  'driver-filters',
)

watch(
  () => filterForm.value.search,
  () => {
    handleFilterChange()
  },
)

const { data, error, isLoading, refetch } = useDrivers(
  currentPage,
  perPage,
  computed(() => filters.value.search || ''),
)

const drivers = computed(() => data.value?.data || [])
const total = computed(() => data.value?.total || 0)
const lastPage = computed(() => data.value?.last_page || 1)
const createDriver = useCreateDriver()
const updateDriver = useUpdateDriver()
const deleteDriverMutation = useDeleteDriver()

const isPending = computed(
  () => createDriver.status.value === 'pending' || updateDriver.status.value === 'pending',
)

watch(currentPage, (val) => {
  refetch()
})

function openDialog(isAdd, driver = null) {
  dialogOpen.value = true
  createDriver.reset()
  updateDriver.reset()
  if (isAdd) {
    editDriverData.value = null
    form.value = { name: '', phone: '', email: '', status: 'active' }
  } else {
    editDriverData.value = driver
    form.value = {
      name: driver.name || '',
      phone: driver.phone || '',
      email: driver.email || '',
      status: driver.status || 'active',
    }
  }
}

function closeDialog() {
  dialogOpen.value = false
  editDriverData.value = null
  form.value = { name: '', phone: '', email: '', status: 'active' }
  createDriver.reset()
  updateDriver.reset()
}

function updateStatus(val) {
  form.value.status = val ? 'active' : 'inactive'
}

function onDialogUpdate(val) {
  dialogOpen.value = val
  if (!val) closeDialog()
}

async function handleSubmit() {
  const payload = {
    name: form.value.name,
    phone: form.value.phone,
    email: form.value.email,
    status: form.value.status,
  }
  if (editDriverData.value) {
    await updateDriver.mutateAsync({ id: editDriverData.value.id, ...payload })
    toast('Driver updated', {
      description: `${form.value.name} has been updated successfully.`,
    })
  } else {
    await createDriver.mutateAsync(payload)
    toast('Driver created', {
      description: `${form.value.name} has been added successfully.`,
    })
  }
  closeDialog()
  refetch()
}

async function deleteDriver(id) {
  if (confirm('Are you sure you want to delete this driver?')) {
    await deleteDriverMutation.mutateAsync(id)
    refetch()
  }
}

function goToPage(page) {
  if (page >= 1 && page <= lastPage.value) {
    currentPage.value = page
  }
}
</script>
