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
              <Label for="name">Name</Label>
              <Input id="name" v-model="addForm.name" placeholder="Vehicle name" class="w-full" />
              <p v-if="addErrors.name" class="text-destructive text-xs mt-1">
                {{ addErrors.name }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <Label>Type</Label>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="outline"
                    :class="
                      cn(
                        'w-full justify-between font-normal',
                        !addForm.type && 'text-muted-foreground',
                      )
                    "
                  >
                    {{ getActiveLabel(vehicleTypes, addForm.type) }}
                    <ChevronDown class="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-full min-w-[8rem]">
                  <DropdownMenuLabel>Vehicle Types</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    v-for="type in vehicleTypes.filter((t) => t.value !== '')"
                    :key="type.value"
                    @click="() => (addForm.type = type.value)"
                  >
                    <Check
                      class="mr-2 h-4 w-4"
                      :class="cn(addForm.type === type.value ? 'opacity-100' : 'opacity-0')"
                    />
                    {{ type.label }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <p v-if="addErrors.type" class="text-destructive text-xs mt-1">
                {{ addErrors.type }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="brand">Brand</Label>
              <Input id="brand" v-model="addForm.brand" placeholder="Brand" class="w-full" />
              <p v-if="addErrors.brand" class="text-destructive text-xs mt-1">
                {{ addErrors.brand }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="model">Model</Label>
              <Input id="model" v-model="addForm.model" placeholder="Model" class="w-full" />
              <p v-if="addErrors.model" class="text-destructive text-xs mt-1">
                {{ addErrors.model }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="year">Year</Label>
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
              <Label for="plate_number">Plate Number</Label>
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
              <Label for="capacity">Capacity</Label>
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
              <Label for="rental_rate">Rental Rate</Label>
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
            <Label>Status</Label>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="outline"
                  :class="
                    cn(
                      'w-full justify-between font-normal',
                      !addForm.status && 'text-muted-foreground',
                    )
                  "
                >
                  {{ getActiveLabel(statusTypes, addForm.status) }}
                  <ChevronDown class="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-full min-w-[8rem]">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  v-for="status in statusTypes.filter((s) => s.value !== '')"
                  :key="status.value"
                  @click="() => (addForm.status = status.value)"
                >
                  <Check
                    class="mr-2 h-4 w-4"
                    :class="cn(addForm.status === status.value ? 'opacity-100' : 'opacity-0')"
                  />
                  {{ status.label }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <p v-if="addErrors.status" class="text-destructive text-xs mt-1">
              {{ addErrors.status }}
            </p>
          </div>
          <div class="flex flex-col gap-2 w-full">
            <Label for="description">Description</Label>
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
import { Label } from '@/components/ui/label'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Check, ChevronDown } from 'lucide-vue-next'
import { useCreateVehicle } from '@/services/vehicle-service'
import { toast } from 'vue-sonner'
import { cn } from '@/lib/utils'

const vehicleTypes = [
  { label: 'Select type', value: '' },
  { label: 'Car', value: 'car' },
  { label: 'Motorcycle', value: 'motorcycle' },
]

const statusTypes = [
  { label: 'Select status', value: '' },
  { label: 'Available', value: 'available' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Rented', value: 'rented' },
]

const getActiveLabel = (items, value) => {
  const item = items.find((item) => item.value === value)
  return item?.label || items[0].label
}

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
