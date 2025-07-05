<template>
  <form id="add-vehicle-form" @submit.prevent="handleAddVehicle" class="space-y-10">
    <!-- Vehicle Details Section -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4 text-primary">Vehicle Details</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex flex-col gap-2">
          <Label for="name">Name <span class="text-red-500">*</span></Label>
          <Input id="name" v-model="addForm.name" placeholder="Vehicle name" class="w-full" />
          <p v-if="addErrors.name" class="text-destructive text-xs mt-1">
            {{ Array.isArray(addErrors.name) ? addErrors.name[0] : addErrors.name }}
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <Label>Type <span class="text-red-500">*</span></Label>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="outline"
                :class="
                  cn('w-full justify-between font-normal', !addForm.type && 'text-muted-foreground')
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
            {{ Array.isArray(addErrors.type) ? addErrors.type[0] : addErrors.type }}
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="brand">Brand <span class="text-red-500">*</span></Label>
          <Input id="brand" v-model="addForm.brand" placeholder="Brand" class="w-full" />
          <p v-if="addErrors.brand" class="text-destructive text-xs mt-1">
            {{ Array.isArray(addErrors.brand) ? addErrors.brand[0] : addErrors.brand }}
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="model">Model <span class="text-red-500">*</span></Label>
          <Input id="model" v-model="addForm.model" placeholder="Model" class="w-full" />
          <p v-if="addErrors.model" class="text-destructive text-xs mt-1">
            {{ Array.isArray(addErrors.model) ? addErrors.model[0] : addErrors.model }}
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="year">Year</Label>
          <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
            <NumberField
              id="year"
              v-model="addForm.year"
              :min="1900"
              :max="maxYear"
              class="max-w-[9rem]"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
          <p v-if="addErrors.year" class="text-destructive text-xs mt-1">
            {{ Array.isArray(addErrors.year) ? addErrors.year[0] : addErrors.year }}
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="plate_number">Plate Number <span class="text-red-500">*</span></Label>
          <Input
            id="plate_number"
            v-model="addForm.plate_number"
            placeholder="Plate number"
            class="w-full"
          />
          <p v-if="addErrors.plate_number" class="text-destructive text-xs mt-1">
            {{ Array.isArray(addErrors.plate_number) ? addErrors.plate_number[0] : addErrors.plate_number }}
          </p>
        </div>
      </div>
    </div>
    <hr class="border-muted/30 my-2" />
    <!-- Rental & Capacity Section -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4 text-primary">Rental & Capacity</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex flex-col gap-2">
          <Label for="capacity">Capacity <span class="text-red-500">*</span></Label>
          <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
            <NumberField
              id="capacity"
              v-model="addForm.capacity"
              :min="1"
              :default-value="1"
              class="max-w-[9rem]"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
          <p v-if="addErrors.capacity" class="text-destructive text-xs mt-1">
            {{ Array.isArray(addErrors.capacity) ? addErrors.capacity[0] : addErrors.capacity }}
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="rental_rate"
            >Rental Rate (Without Driver) <span class="text-red-500">*</span></Label
          >
          <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
            <NumberField
              id="rental_rate"
              v-model="addForm.rental_rate"
              :min="0"
              :step="0.01"
              :default-value="0"
              class="max-w-[9rem]"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
          <p v-if="addErrors.rental_rate" class="text-destructive text-xs mt-1">
            {{ Array.isArray(addErrors.rental_rate) ? addErrors.rental_rate[0] : addErrors.rental_rate }}
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="rental_rate_with_driver"
            >Rental Rate (With Driver) <span class="text-red-500">*</span></Label
          >
          <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
            <NumberField
              id="rental_rate_with_driver"
              v-model="addForm.rental_rate_with_driver"
              :min="0"
              :step="0.01"
              :default-value="0"
              class="max-w-[9rem]"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
          <p v-if="addErrors.rental_rate_with_driver" class="text-destructive text-xs mt-1">
            {{ Array.isArray(addErrors.rental_rate_with_driver) ? addErrors.rental_rate_with_driver[0] : addErrors.rental_rate_with_driver }}
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="deposit">Deposit</Label>
          <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
            <NumberField
              id="deposit"
              v-model="addForm.deposit"
              :min="0"
              :step="0.01"
              :default-value="0"
              class="max-w-[9rem]"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
          <p v-if="addErrors.deposit" class="text-destructive text-xs mt-1">
            {{ Array.isArray(addErrors.deposit) ? addErrors.deposit[0] : addErrors.deposit }}
          </p>
        </div>
      </div>
    </div>
    <hr class="border-muted/30 my-2" />
    <!-- Status & Description Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="flex flex-col gap-2">
        <Label>Status <span class="text-red-500">*</span></Label>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              :class="
                cn('w-full justify-between font-normal', !addForm.status && 'text-muted-foreground')
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
          {{ Array.isArray(addErrors.status) ? addErrors.status[0] : addErrors.status }}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <Label for="description">Description</Label>
        <Input
          id="description"
          v-model="addForm.description"
          placeholder="Description (optional)"
          class="w-full"
        />
        <p v-if="addErrors.description" class="text-destructive text-xs mt-1">
          {{ Array.isArray(addErrors.description) ? addErrors.description[0] : addErrors.description }}
        </p>
      </div>
    </div>
    <hr class="border-muted/30 my-2" />
    <!-- Image Upload Section -->
    <div>
      <h2 class="text-xl font-semibold mb-4 text-primary">Vehicle Images</h2>
      <div class="flex flex-col gap-2 w-full">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <!-- Image Preview -->
          <div
            v-for="(preview, index) in imagePreviews"
            :key="index"
            class="relative aspect-square rounded-xl border-2 border-border overflow-hidden group shadow-sm"
          >
            <img
              :src="preview"
              alt="Preview"
              class="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              class="absolute top-2 right-2 h-7 w-7 opacity-80 hover:opacity-100"
              @click="removeImage(index)"
            >
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
          <!-- Upload Button -->
          <div
            v-if="imagePreviews.length < 5"
            class="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer flex items-center justify-center bg-muted/40 hover:bg-muted/60 transition-colors"
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
        <p class="text-sm text-muted-foreground mt-2">
          Upload up to 5 images. First image will be set as primary.
        </p>
        <p v-if="addErrors.images" class="text-destructive text-xs mt-1">
          {{ Array.isArray(addErrors.images) ? addErrors.images[0] : addErrors.images }}
        </p>
      </div>
    </div>
    <div class="flex flex-row justify-end mt-6">
      <Button
        type="submit"
        :disabled="addIsLoading"
        class="px-8 py-3 text-lg font-semibold shadow-md"
      >
        {{ addIsLoading ? 'Adding...' : 'Add Vehicle' }}
      </Button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldInput,
  NumberFieldIncrement,
} from '@/components/ui/number-field'

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

const router = useRouter()

const addForm = ref({
  name: '',
  type: '',
  brand: '',
  model: '',
  year: null,
  plate_number: '',
  capacity: null,
  rental_rate: null,
  rental_rate_with_driver: null,
  status: '',
  description: '',
  deposit: null,
})
const addErrors = ref({})
const maxYear = new Date().getFullYear() + 1

const fileInput = ref(null)
const selectedFiles = ref([])
const imagePreviews = ref([])

const { mutateAsync: createVehicle, isPending: addIsLoading } = useCreateVehicle()
const { mutateAsync: uploadImages } = useUploadVehicleImages()

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
      year: addForm.value.year != null ? Number(addForm.value.year) : null,
      capacity: addForm.value.capacity != null ? Number(addForm.value.capacity) : null,
      rental_rate: addForm.value.rental_rate != null ? Number(addForm.value.rental_rate) : null,
      rental_rate_with_driver:
        addForm.value.rental_rate_with_driver != null
          ? Number(addForm.value.rental_rate_with_driver)
          : null,
      deposit: addForm.value.deposit != null ? Number(addForm.value.deposit) : null,
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
      year: null,
      plate_number: '',
      capacity: null,
      rental_rate: null,
      rental_rate_with_driver: null,
      status: '',
      description: '',
      deposit: null,
    }
    selectedFiles.value = []
    imagePreviews.value = []

    // Show toast
    toast.success('Vehicle Added', {
      description: `${vehicleData.name} has been added to the system.`,
      duration: 5000,
    })
    router.push({ name: 'vehicles' })
  } catch (error) {
    if (error.response && error.response.status === 422) {
      addErrors.value = error.response.data.errors || {}
    } else {
      addErrors.value = { general: 'Failed to add vehicle.' }
    }
  }
}
</script>
