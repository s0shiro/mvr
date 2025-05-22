<template>
  <Dialog v-model:open="dialogStore.addOpen">
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
              <Label for="rental_rate">Rental Rate (Without Driver)</Label>
              <Input
                id="rental_rate"
                v-model="addForm.rental_rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="Daily rate without driver"
                class="w-full"
              />
              <p v-if="addErrors.rental_rate" class="text-destructive text-xs mt-1">
                {{ addErrors.rental_rate }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="rental_rate_with_driver">Rental Rate (With Driver)</Label>
              <Input
                id="rental_rate_with_driver"
                v-model="addForm.rental_rate_with_driver"
                type="number"
                min="0"
                step="0.01"
                placeholder="Daily rate with driver"
                class="w-full"
              />
              <p v-if="addErrors.rental_rate_with_driver" class="text-destructive text-xs mt-1">
                {{ addErrors.rental_rate_with_driver }}
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

          <!-- Image Upload Section -->
          <div class="flex flex-col gap-2 w-full">
            <Label>Vehicle Images</Label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <!-- Image Preview -->
              <div
                v-for="(preview, index) in imagePreviews"
                :key="index"
                class="relative aspect-square rounded-lg border-2 border-border overflow-hidden"
              >
                <img :src="preview" alt="Preview" class="w-full h-full object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  class="absolute top-2 right-2 h-6 w-6"
                  @click="removeImage(index)"
                >
                  <XIcon class="h-4 w-4" />
                </Button>
              </div>

              <!-- Upload Button -->
              <div
                v-if="imagePreviews.length < 5"
                class="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex items-center justify-center"
                @click="triggerFileInput"
              >
                <div class="flex flex-col items-center gap-2">
                  <UploadIcon class="h-8 w-8 text-muted-foreground" />
                  <span class="text-sm text-muted-foreground">Add Image</span>
                </div>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handleImageChange"
            />
            <p class="text-sm text-muted-foreground">
              Upload up to 5 images. First image will be set as primary.
            </p>
            <p v-if="addErrors.images" class="text-destructive text-xs mt-1">
              {{ addErrors.images }}
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
import { Check, ChevronDown, XIcon, UploadIcon } from 'lucide-vue-next'
import { useCreateVehicle, useUploadVehicleImages } from '@/services/vehicle-service'
import { toast } from 'vue-sonner'
import { cn, getActiveLabel } from '@/lib/utils'
import { useVehicleDialogStore } from '@/stores/vehicleDialogStore'

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

const addForm = ref({
  name: '',
  type: '',
  brand: '',
  model: '',
  year: '',
  plate_number: '',
  capacity: '',
  rental_rate: '',
  rental_rate_with_driver: '',
  status: '',
  description: '',
})
const addErrors = ref({})
const maxYear = new Date().getFullYear() + 1

const fileInput = ref(null)
const selectedFiles = ref([])
const imagePreviews = ref([])

const { mutateAsync: createVehicle, isPending: addIsLoading } = useCreateVehicle()
const { mutateAsync: uploadImages } = useUploadVehicleImages()
const dialogStore = useVehicleDialogStore()

const emit = defineEmits(['vehicleAdded'])

function triggerFileInput() {
  fileInput.value.click()
}

function handleImageChange(event) {
  const files = Array.from(event.target.files)
  const remainingSlots = 5 - selectedFiles.value.length
  const newFiles = files.slice(0, remainingSlots)

  // Add new files
  selectedFiles.value = [...selectedFiles.value, ...newFiles]

  // Create previews for new files
  newFiles.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviews.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })

  // Reset input
  event.target.value = ''
}

function removeImage(index) {
  selectedFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

async function handleAddVehicle() {
  addErrors.value = {}
  try {
    // Convert numeric fields
    const payload = {
      ...addForm.value,
      year: addForm.value.year ? Number(addForm.value.year) : '',
      capacity: addForm.value.capacity ? Number(addForm.value.capacity) : '',
      rental_rate: addForm.value.rental_rate ? Number(addForm.value.rental_rate) : '',
      rental_rate_with_driver: addForm.value.rental_rate_with_driver
        ? Number(addForm.value.rental_rate_with_driver)
        : '',
    }

    // First create the vehicle
    const response = await createVehicle(payload)
    const vehicleData = response.data

    // Then upload images if any
    if (selectedFiles.value.length > 0) {
      await uploadImages({
        vehicleId: vehicleData.id,
        images: selectedFiles.value,
      })
    }

    // Reset form and images
    addForm.value = {
      name: '',
      type: '',
      brand: '',
      model: '',
      year: '',
      plate_number: '',
      capacity: '',
      rental_rate: '',
      rental_rate_with_driver: '',
      status: '',
      description: '',
    }
    selectedFiles.value = []
    imagePreviews.value = []

    // Close the dialog first
    dialogStore.closeAdd()
    emit('vehicleAdded')

    // Show toast after a small delay to ensure dialog is closed
    setTimeout(() => {
      toast.success('Vehicle Added', {
        description: `${vehicleData.name} has been added to the system.`,
        duration: 5000,
      })
    }, 300)
  } catch (error) {
    if (error.response && error.response.status === 422) {
      addErrors.value = error.response.data.errors || {}
    } else {
      addErrors.value = { general: 'Failed to add vehicle.' }
    }
  }
}
</script>
