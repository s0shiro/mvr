<template>
  <div class="bg-card text-card-foreground rounded-xl shadow-md">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold flex items-center gap-2">
        <Users class="w-6 h-6" /> Driver Management
      </h1>
      <Button @click="openDialog(true)" variant="default">Add Driver</Button>
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
            <Select v-model="form.status">
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
import { ref, computed } from 'vue'
import {
  useDrivers,
  useCreateDriver,
  useUpdateDriver,
  useDeleteDriver,
} from '@/services/driver-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
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

const dialogOpen = ref(false)
const editDriverData = ref(null)
const form = ref({ name: '', phone: '', email: '', status: 'active' })

const { data, error, isLoading, refetch } = useDrivers()
const drivers = computed(() => data.value || [])
const createDriver = useCreateDriver()
const updateDriver = useUpdateDriver()
const deleteDriverMutation = useDeleteDriver()

const isPending = computed(
  () => createDriver.status.value === 'pending' || updateDriver.status.value === 'pending',
)

function openDialog(isAdd, driver = null) {
  dialogOpen.value = true
  createDriver.reset()
  updateDriver.reset()
  if (isAdd) {
    editDriverData.value = null
    form.value = { name: '', phone: '', email: '', status: 'active' }
  } else {
    editDriverData.value = driver
    form.value = { ...driver }
  }
}

function closeDialog() {
  dialogOpen.value = false
  editDriverData.value = null
  form.value = { name: '', phone: '', email: '', status: 'active' }
  createDriver.reset()
  updateDriver.reset()
}

function onDialogUpdate(val) {
  dialogOpen.value = val
  if (!val) closeDialog()
}

async function handleSubmit() {
  if (editDriverData.value) {
    await updateDriver.mutateAsync({ id: editDriverData.value.id, ...form.value })
    toast('Driver updated', {
      description: `${form.value.name} has been updated successfully.`,
    })
  } else {
    await createDriver.mutateAsync(form.value)
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
</script>
