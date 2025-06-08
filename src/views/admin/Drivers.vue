<template>
  <div class="container py-8">
    <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">
      <Users class="w-6 h-6" /> Driver Management
    </h1>
    <div class="mb-6 flex flex-row gap-4 items-center">
      <Button @click="openDialog(true)" variant="default">Add Driver</Button>
    </div>
    <div v-if="isLoading" class="flex items-center justify-center h-32">
      <span>Loading drivers...</span>
    </div>
    <div v-else-if="error" class="text-red-500">{{ error.message }}</div>
    <div v-else>
      <table class="min-w-full bg-white border rounded-lg overflow-hidden">
        <thead>
          <tr class="bg-muted text-left">
            <th class="py-2 px-4">Name</th>
            <th class="py-2 px-4">Phone</th>
            <th class="py-2 px-4">Email</th>
            <th class="py-2 px-4">Status</th>
            <th class="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="driver in drivers" :key="driver.id" class="border-b">
            <td class="py-2 px-4">{{ driver.name }}</td>
            <td class="py-2 px-4">{{ driver.phone }}</td>
            <td class="py-2 px-4">{{ driver.email }}</td>
            <td class="py-2 px-4">
              <span :class="driver.status === 'active' ? 'text-green-600' : 'text-gray-400'">
                {{ driver.status }}
              </span>
            </td>
            <td class="py-2 px-4 flex gap-2">
              <Button size="sm" variant="outline" @click="openDialog(false, driver)">Edit</Button>
              <Button size="sm" variant="destructive" @click="deleteDriver(driver.id)"
                >Delete</Button
              >
            </td>
          </tr>
        </tbody>
      </table>
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
            <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
            <Button type="submit" variant="default">{{ editDriverData ? 'Update' : 'Add' }}</Button>
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

const dialogOpen = ref(false)
const editDriverData = ref(null)
const form = ref({ name: '', phone: '', email: '', status: 'active' })

const { data, error, isLoading, refetch } = useDrivers()
const drivers = computed(() => data.value || [])
const createDriver = useCreateDriver()
const updateDriver = useUpdateDriver()
const deleteDriverMutation = useDeleteDriver()

function openDialog(isAdd, driver = null) {
  dialogOpen.value = true
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
}

function onDialogUpdate(val) {
  dialogOpen.value = val
  if (!val) closeDialog()
}

async function handleSubmit() {
  if (editDriverData.value) {
    await updateDriver.mutateAsync({ id: editDriverData.value.id, ...form.value })
  } else {
    await createDriver.mutateAsync(form.value)
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
