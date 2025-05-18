<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="default">Add Vehicle</Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader class="px-6 pt-6">
        <DialogTitle>Add Vehicle</DialogTitle>
        <DialogDescription>Fill out the form to add a new vehicle.</DialogDescription>
      </DialogHeader>
      <ScrollArea class="max-h-[80vh] p-6">
        <form id="add-vehicle-form" @submit.prevent="handleAddVehicle" class="flex flex-col gap-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label for="name" class="block text-sm font-medium mb-1">Name</label>
              <Input id="name" v-model="addForm.name" placeholder="Vehicle name" class="w-full" />
              <p v-if="addErrors.name" class="text-destructive text-xs mt-1">
                {{ addErrors.name }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <label for="type" class="block text-sm font-medium mb-1">Type</label>
              <select
                id="type"
                v-model="addForm.type"
                class="w-full border-input h-9 rounded-md border bg-background px-3 py-1 text-sm"
              >
                <option value="">Select type</option>
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
              <p v-if="addErrors.type" class="text-destructive text-xs mt-1">
                {{ addErrors.type }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <label for="brand" class="block text-sm font-medium mb-1">Brand</label>
              <Input id="brand" v-model="addForm.brand" placeholder="Brand" class="w-full" />
              <p v-if="addErrors.brand" class="text-destructive text-xs mt-1">
                {{ addErrors.brand }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <label for="model" class="block text-sm font-medium mb-1">Model</label>
              <Input id="model" v-model="addForm.model" placeholder="Model" class="w-full" />
              <p v-if="addErrors.model" class="text-destructive text-xs mt-1">
                {{ addErrors.model }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <label for="year" class="block text-sm font-medium mb-1">Year</label>
              <Input
                id="year"
                v-model="addForm.year"
                type="number"
                min="1900"
                :max="maxYear"
                placeholder="Year"
                class="w-full"
              />
              <p v-if="addErrors.year" class="text-destructive text-xs mt-1">
                {{ addErrors.year }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <label for="plate_number" class="block text-sm font-medium mb-1">Plate Number</label>
              <Input
                id="plate_number"
                v-model="addForm.plate_number"
                placeholder="Plate number"
                class="w-full"
              />
              <p v-if="addErrors.plate_number" class="text-destructive text-xs mt-1">
                {{ addErrors.plate_number }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <label for="capacity" class="block text-sm font-medium mb-1">Capacity</label>
              <Input
                id="capacity"
                v-model="addForm.capacity"
                type="number"
                min="1"
                placeholder="Capacity"
                class="w-full"
              />
              <p v-if="addErrors.capacity" class="text-destructive text-xs mt-1">
                {{ addErrors.capacity }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <label for="rental_rate" class="block text-sm font-medium mb-1">Rental Rate</label>
              <Input
                id="rental_rate"
                v-model="addForm.rental_rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="Rental rate"
                class="w-full"
              />
              <p v-if="addErrors.rental_rate" class="text-destructive text-xs mt-1">
                {{ addErrors.rental_rate }}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2 w-full">
            <label for="status" class="block text-sm font-medium mb-1">Status</label>
            <select
              id="status"
              v-model="addForm.status"
              class="w-full border-input h-9 rounded-md border bg-background px-3 py-1 text-sm"
            >
              <option value="">Select status</option>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
              <option value="rented">Rented</option>
            </select>
            <p v-if="addErrors.status" class="text-destructive text-xs mt-1">
              {{ addErrors.status }}
            </p>
          </div>
          <div class="flex flex-col gap-2 w-full">
            <label for="description" class="block text-sm font-medium mb-1">Description</label>
            <Input
              id="description"
              v-model="addForm.description"
              placeholder="Description (optional)"
              class="w-full"
            />
            <p v-if="addErrors.description" class="text-destructive text-xs mt-1">
              {{ addErrors.description }}
            </p>
          </div>
          <DialogFooter class="mt-4">
            <Button type="submit" :disabled="addIsLoading">{{
              addIsLoading ? 'Adding...' : 'Add Vehicle'
            }}</Button>
          </DialogFooter>
        </form>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCreateVehicle } from '@/services/vehicle-service'
import { toast } from 'vue-sonner'

const addForm = ref({
  name: '',
  type: '',
  brand: '',
  model: '',
  year: '',
  plate_number: '',
  capacity: '',
  rental_rate: '',
  status: '',
  description: '',
})
const addErrors = ref({})
const maxYear = new Date().getFullYear() + 1

const { mutateAsync: createVehicle, isPending: addIsLoading } = useCreateVehicle()

const emit = defineEmits(['vehicleAdded'])

async function handleAddVehicle() {
  addErrors.value = {}
  try {
    // Convert numeric fields
    const payload = {
      ...addForm.value,
      year: addForm.value.year ? Number(addForm.value.year) : '',
      capacity: addForm.value.capacity ? Number(addForm.value.capacity) : '',
      rental_rate: addForm.value.rental_rate ? Number(addForm.value.rental_rate) : '',
    }
    const response = await createVehicle(payload)
    // Reset form
    addForm.value = {
      name: '',
      type: '',
      brand: '',
      model: '',
      year: '',
      plate_number: '',
      capacity: '',
      rental_rate: '',
      status: '',
      description: '',
    }
    toast(response?.message || 'Vehicle added successfully', {
      description: `${response.data.name} has been added to the system.`,
    })
    emit('vehicleAdded')
  } catch (error) {
    if (error.response && error.response.status === 422) {
      addErrors.value = error.response.data.errors || {}
    } else {
      addErrors.value = { general: 'Failed to add vehicle.' }
    }
  }
}
</script>
