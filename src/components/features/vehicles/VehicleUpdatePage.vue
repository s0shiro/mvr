<template>
  <div class="mx-auto">
    <h1 class="text-2xl font-bold mb-4">Edit Vehicle</h1>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading details..." />
    </div>
    <div v-else-if="isError">
      <div class="flex justify-center items-center py-12">
        <span class="text-destructive">Failed to load vehicle data.</span>
      </div>
    </div>
    <form
      v-else-if="form && Object.keys(form).length"
      @submit.prevent="onSubmit"
      class="space-y-10"
    >
      <!-- Vehicle Details Section -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4 text-primary">Vehicle Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-2">
            <Label for="name">Name <span class="text-red-500">*</span></Label>
            <Input id="name" v-model="form.name" placeholder="Vehicle name" class="w-full" />
            <p v-if="errors.name" class="text-destructive text-xs mt-1">{{ errors.name }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <Label>Type <span class="text-red-500">*</span></Label>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="outline"
                  :class="
                    cn('w-full justify-between font-normal', !form.type && 'text-muted-foreground')
                  "
                >
                  {{ getActiveLabel(vehicleTypes, form.type) }}
                  <ChevronDown class="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-full min-w-[8rem]">
                <DropdownMenuLabel>Vehicle Types</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  v-for="type in vehicleTypes.filter((t) => t.value !== '')"
                  :key="type.value"
                  @click="() => (form.type = type.value)"
                >
                  <Check
                    class="mr-2 h-4 w-4"
                    :class="cn(form.type === type.value ? 'opacity-100' : 'opacity-0')"
                  />
                  {{ type.label }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <p v-if="errors.type" class="text-destructive text-xs mt-1">{{ errors.type }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="brand">Brand <span class="text-red-500">*</span></Label>
            <Input id="brand" v-model="form.brand" placeholder="Brand" class="w-full" />
            <p v-if="errors.brand" class="text-destructive text-xs mt-1">{{ errors.brand }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="model">Model <span class="text-red-500">*</span></Label>
            <Input id="model" v-model="form.model" placeholder="Model" class="w-full" />
            <p v-if="errors.model" class="text-destructive text-xs mt-1">{{ errors.model }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="year">Year</Label>
            <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
              <NumberField
                id="year"
                v-model="form.year"
                :min="1900"
                :max="maxYear"
                :format-options="{ useGrouping: false }"
                class="max-w-[9rem]"
              >
                <NumberFieldContent>
                  <NumberFieldDecrement />
                  <NumberFieldInput />
                  <NumberFieldIncrement />
                </NumberFieldContent>
              </NumberField>
            </div>
            <p v-if="errors.year" class="text-destructive text-xs mt-1">{{ errors.year }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="plate_number">Plate Number <span class="text-red-500">*</span></Label>
            <Input
              id="plate_number"
              v-model="form.plate_number"
              placeholder="Plate number"
              class="w-full"
            />
            <p v-if="errors.plate_number" class="text-destructive text-xs mt-1">
              {{ errors.plate_number }}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="fuel_capacity">Fuel Capacity (L)</Label>
            <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
              <NumberField
                id="fuel_capacity"
                v-model="form.fuel_capacity"
                :min="0"
                :step="1"
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
            <p v-if="errors.fuel_capacity" class="text-destructive text-xs mt-1">
              {{ errors.fuel_capacity }}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="fuel_type">Fuel Type</Label>
            <Input
              id="fuel_type"
              v-model="form.fuel_type"
              placeholder="Fuel type"
              class="w-full"
            />
            <p v-if="errors.fuel_type" class="text-destructive text-xs mt-1">
              {{ errors.fuel_type }}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="color">Color</Label>
            <Input id="color" v-model="form.color" placeholder="Vehicle color" class="w-full" />
            <p v-if="errors.color" class="text-destructive text-xs mt-1">{{ errors.color }}</p>
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
                v-model="form.capacity"
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
            <p v-if="errors.capacity" class="text-destructive text-xs mt-1">
              {{ errors.capacity }}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="rental_rate"
              >Rental Rate (Without Driver) <span class="text-red-500">*</span></Label
            >
            <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
              <NumberField
                id="rental_rate"
                v-model="form.rental_rate"
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
            <p v-if="errors.rental_rate" class="text-destructive text-xs mt-1">
              {{ errors.rental_rate }}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="rental_rate_with_driver"
              >Rental Rate (With Driver) <span class="text-red-500">*</span></Label
            >
            <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
              <NumberField
                id="rental_rate_with_driver"
                v-model="form.rental_rate_with_driver"
                :min="0"
                :step="0.01"
                :default-value="0"
                :disabled="isMotorcycle"
                class="max-w-[9rem]"
              >
                <NumberFieldContent>
                  <NumberFieldDecrement />
                  <NumberFieldInput />
                  <NumberFieldIncrement />
                </NumberFieldContent>
              </NumberField>
            </div>
            <p v-if="errors.rental_rate_with_driver" class="text-destructive text-xs mt-1">
              {{ errors.rental_rate_with_driver }}
            </p>
            <p v-else-if="isMotorcycle" class="text-xs text-muted-foreground">
              Driver service is unavailable for motorcycles.
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="deposit">Deposit <span class="text-red-500">*</span></Label>
            <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
              <NumberField
                id="deposit"
                v-model="form.deposit"
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
            <p v-if="errors.deposit" class="text-destructive text-xs mt-1">{{ errors.deposit }}</p>
          </div>
          <!--
          <div class="flex flex-col gap-2">
            <Label for="fee_per_kilometer"
              >Fee per Kilometer <span class="text-red-500">*</span></Label
            >
            <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
              <NumberField
                id="fee_per_kilometer"
                v-model="form.fee_per_kilometer"
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
            <p v-if="errors.fee_per_kilometer" class="text-destructive text-xs mt-1">
              {{ errors.fee_per_kilometer }}
            </p>
          </div>
          -->
          <div class="flex flex-col gap-2">
            <Label for="late_fee_per_hour"
              >Late Fee per Hour <span class="text-red-500">*</span></Label
            >
            <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
              <NumberField
                id="late_fee_per_hour"
                v-model="form.late_fee_per_hour"
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
            <p v-if="errors.late_fee_per_hour" class="text-destructive text-xs mt-1">
              {{ errors.late_fee_per_hour }}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="late_fee_per_day"
              >Late Fee per Day <span class="text-red-500">*</span></Label
            >
            <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
              <NumberField
                id="late_fee_per_day"
                v-model="form.late_fee_per_day"
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
            <p v-if="errors.late_fee_per_day" class="text-destructive text-xs mt-1">
              {{ errors.late_fee_per_day }}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="gasoline_late_fee_per_liter"
              >Fuel Rate (L) <span class="text-red-500">*</span></Label
            >
            <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
              <NumberField
                id="gasoline_late_fee_per_liter"
                v-model="form.gasoline_late_fee_per_liter"
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
            <p v-if="errors.gasoline_late_fee_per_liter" class="text-destructive text-xs mt-1">
              {{ errors.gasoline_late_fee_per_liter }}
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
                  cn('w-full justify-between font-normal', !form.status && 'text-muted-foreground')
                "
              >
                {{ getActiveLabel(statusTypes, form.status) }}
                <ChevronDown class="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-full min-w-[8rem]">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-for="status in statusTypes.filter((s) => s.value !== '')"
                :key="status.value"
                @click="() => (form.status = status.value)"
              >
                <Check
                  class="mr-2 h-4 w-4"
                  :class="cn(form.status === status.value ? 'opacity-100' : 'opacity-0')"
                />
                {{ status.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <p v-if="errors.status" class="text-destructive text-xs mt-1">{{ errors.status }}</p>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="description">Description</Label>
          <Input
            id="description"
            v-model="form.description"
            placeholder="Description (optional)"
            class="w-full"
          />
          <p v-if="errors.description" class="text-destructive text-xs mt-1">
            {{ errors.description }}
          </p>
        </div>
      </div>
      <hr class="border-muted/30 my-2" />
      <!-- Image Upload Section -->
      <div>
        <h2 class="text-xl font-semibold mb-4 text-primary">Vehicle Images</h2>
        <div class="flex flex-col gap-2 w-full">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              v-for="(img, idx) in imageList"
              :key="img.id || img.preview"
              class="relative aspect-square rounded-xl border-2 border-border overflow-hidden group shadow-sm"
            >
              <img
                :src="img.image_url || img.preview"
                alt="Preview"
                class="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                class="absolute top-2 right-2 h-7 w-7 opacity-80 hover:opacity-100"
                @click="removeImage(idx)"
              >
                <XIcon class="h-4 w-4" />
              </Button>
              <Button
                v-if="!img.is_primary"
                type="button"
                variant="outline"
                size="icon"
                class="absolute bottom-2 left-2 h-7 w-7 bg-white/80"
                @click="setPrimary(idx)"
              >
                <StarIcon class="h-4 w-4 text-yellow-500" />
              </Button>
              <span
                v-if="img.is_primary"
                class="absolute bottom-2 left-2 bg-yellow-400 text-xs px-2 py-1 rounded"
                >Primary</span
              >
            </div>
            <div
              v-if="imageList.length < 5"
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
          <p v-if="errors.images" class="text-destructive text-xs mt-1">{{ errors.images }}</p>
        </div>
      </div>
      <div class="flex flex-row justify-end mt-6">
        <Button type="button" variant="outline" @click="onCancel">Cancel</Button>
        <Button
          type="submit"
          :disabled="isPending || isImagePending"
          class="px-8 py-3 text-lg font-semibold shadow-md ml-2"
        >
          {{ isPending || isImagePending ? 'Updating...' : 'Update Vehicle' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  useUpdateVehicle,
  useUploadVehicleImages,
  useDeleteVehicleImage,
  useSetPrimaryImage,
  useReorderVehicleImages,
  useVehicleDetails,
} from '@/services/vehicle-service'
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
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldInput,
  NumberFieldIncrement,
} from '@/components/ui/number-field'
import { Check, ChevronDown, XIcon, UploadIcon, StarIcon } from 'lucide-vue-next'
import { cn, getActiveLabel } from '@/lib/utils'
import { toast } from 'vue-sonner'
import Loading from '../Loading.vue'

const requiredTextFields = {
  name: 'Name',
  type: 'Type',
  brand: 'Brand',
  model: 'Model',
  plate_number: 'Plate Number',
  status: 'Status',
}

const maxYearUpperBound = new Date().getFullYear() + 1

const requiredNumericFields = {
  year: { label: 'Year', min: 1900, max: maxYearUpperBound },
  capacity: { label: 'Capacity', min: 1 },
  rental_rate: { label: 'Rental Rate (Without Driver)', min: 0 },
  rental_rate_with_driver: { label: 'Rental Rate (With Driver)', min: 0 },
  deposit: { label: 'Deposit', min: 0 },
  fee_per_kilometer: { label: 'Fee per Kilometer', min: 0 },
  late_fee_per_hour: { label: 'Late Fee per Hour', min: 0 },
  late_fee_per_day: { label: 'Late Fee per Day', min: 0 },
  gasoline_late_fee_per_liter: { label: 'Gasoline Late Fee per Liter', min: 0 },
}

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

const route = useRoute()
const router = useRouter()
const vehicleId = route.params.id
const { data: vehicleData, isLoading, isError } = useVehicleDetails(vehicleId)
const form = ref({})
const imageList = ref([])
const errors = ref({})
const isImagePending = ref(false)
const fileInput = ref(null)
const maxYear = maxYearUpperBound
const isInitialized = ref(false)
const isMotorcycle = computed(() => form.value.type === 'motorcycle')

watch(
  () => vehicleData?.value,
  (val) => {
    if (val && !isInitialized.value) {
      // Defensive: prefer val.data if present (like in VehicleDetails.vue), else val
      const vehicle = val.data || val
      form.value = {
        ...vehicle,
        deposit: vehicle.deposit ?? 0,
        fee_per_kilometer: vehicle.fee_per_kilometer ?? 0,
        late_fee_per_hour: vehicle.late_fee_per_hour ?? 0,
        late_fee_per_day: vehicle.late_fee_per_day ?? 0,
        gasoline_late_fee_per_liter: vehicle.gasoline_late_fee_per_liter ?? 0,
        fuel_capacity: vehicle.fuel_capacity ?? 0,
        fuel_type: vehicle.fuel_type ?? '',
        color: vehicle.color ?? '',
        description: vehicle.description ?? '',
      }
      imageList.value = (vehicle.images || []).map((img) => ({ ...img, isNew: false }))
      isInitialized.value = true
    }
  },
  { immediate: true },
)

const { mutate: updateVehicle, isPending } = useUpdateVehicle()
const { mutateAsync: uploadImages } = useUploadVehicleImages()
const { mutateAsync: deleteImage } = useDeleteVehicleImage()
const { mutateAsync: setPrimaryImage } = useSetPrimaryImage()
const { mutateAsync: reorderImages } = useReorderVehicleImages()

watch(
  () => form.value.type,
  (type) => {
    if (type === 'motorcycle' && form.value) {
      form.value.rental_rate_with_driver = 0
    }
  },
)

function triggerFileInput() {
  fileInput.value.click()
}

function handleImageChange(event) {
  const files = Array.from(event.target.files)
  const remainingSlots = 5 - imageList.value.length
  const newFiles = files.slice(0, remainingSlots)
  newFiles.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageList.value.push({ isNew: true, file, preview: e.target.result, is_primary: false })
    }
    reader.readAsDataURL(file)
  })
  event.target.value = ''
}

function removeImage(idx) {
  const removedImage = imageList.value[idx]
  console.log('Removing image at index:', idx)
  console.log('Before removal:', imageList.value.length)
  imageList.value.splice(idx, 1)
  console.log('After removal:', imageList.value.length)
  
  toast.success('Image removed', {
    description: removedImage.isNew 
      ? 'Image removed from upload queue.' 
      : 'Image will be deleted when you save changes.',
  })
}

function setPrimary(idx) {
  imageList.value.forEach((img, i) => (img.is_primary = i === idx))
  toast.success('Primary image set', {
    description: 'This image will be set as the primary image.',
  })
}

async function onSubmit() {
  errors.value = {}
  const clientErrors = {}

  Object.entries(requiredTextFields).forEach(([field, label]) => {
    const value = form.value[field]
    if (typeof value !== 'string' || value.trim() === '') {
      clientErrors[field] = `${label} is required.`
    }
  })

  Object.entries(requiredNumericFields).forEach(([field, rules]) => {
    const value = form.value[field]
    if (value === null || value === '' || Number.isNaN(Number(value))) {
      clientErrors[field] = `${rules.label} is required.`
      return
    }

    const numericValue = Number(value)
    if (rules.min !== undefined && numericValue < rules.min) {
      clientErrors[field] = `${rules.label} must be at least ${rules.min}.`
    }
    if (rules.max !== undefined && numericValue > rules.max) {
      clientErrors[field] = `${rules.label} must be at most ${rules.max}.`
    }
  })

  const fuelCapacityValue = form.value.fuel_capacity
  if (
    fuelCapacityValue !== null &&
    fuelCapacityValue !== '' &&
    Number(fuelCapacityValue) < 0
  ) {
    clientErrors.fuel_capacity = 'Fuel Capacity cannot be negative.'
  }

  if (Object.keys(clientErrors).length > 0) {
    errors.value = clientErrors
    return
  }

  const trimmedDescription =
    typeof form.value.description === 'string' ? form.value.description.trim() : ''
  const trimmedFuelType =
    typeof form.value.fuel_type === 'string' ? form.value.fuel_type.trim() : ''
  const trimmedColor =
    typeof form.value.color === 'string' ? form.value.color.trim() : ''

  const payload = {
    name: form.value.name.trim(),
    type: form.value.type,
    brand: form.value.brand.trim(),
    model: form.value.model.trim(),
    year: Number(form.value.year),
    plate_number: form.value.plate_number.trim(),
    capacity: Number(form.value.capacity),
    rental_rate: Number(form.value.rental_rate),
    rental_rate_with_driver: Number(form.value.rental_rate_with_driver),
    deposit: Number(form.value.deposit),
    fee_per_kilometer: Number(form.value.fee_per_kilometer),
    late_fee_per_hour: Number(form.value.late_fee_per_hour),
    late_fee_per_day: Number(form.value.late_fee_per_day),
    gasoline_late_fee_per_liter: Number(form.value.gasoline_late_fee_per_liter),
    fuel_capacity:
      form.value.fuel_capacity !== null && form.value.fuel_capacity !== ''
        ? Number(form.value.fuel_capacity)
        : null,
    fuel_type: trimmedFuelType !== '' ? trimmedFuelType : null,
    color: trimmedColor !== '' ? trimmedColor : null,
    description: trimmedDescription !== '' ? trimmedDescription : null,
    status: form.value.status,
  }

  isImagePending.value = true
  
  // Show loading toast
  const loadingToast = toast.loading('Updating vehicle...', {
    description: 'Please wait while we update your vehicle information.',
  })
  
  try {
    await new Promise((resolve, reject) => {
      updateVehicle(
        { vehicleId: vehicleId, vehicleData: payload },
        {
          onSuccess: resolve,
          onError: reject,
        },
      )
    })
    // Get original vehicle data safely
    const vehicleDataValue = vehicleData.value?.data || vehicleData.value || {}
    const originalIds = (vehicleDataValue.images || []).map((img) => img.id)
    const currentIds = imageList.value.filter((img) => !img.isNew).map((img) => img.id)
    const toDelete = originalIds.filter((id) => !currentIds.includes(id))
    
    console.log('Original image IDs:', originalIds)
    console.log('Current image IDs:', currentIds)
    console.log('Images to delete:', toDelete)
    
    for (const id of toDelete) {
      await deleteImage({ vehicleId: vehicleId, imageId: id })
    }
    const newImages = imageList.value.filter((img) => img.isNew).map((img) => img.file)
    if (newImages.length > 0) {
      await uploadImages({ vehicleId: vehicleId, images: newImages })
    }
    const primaryIdx = imageList.value.findIndex((img) => img.is_primary)
    if (primaryIdx !== -1 && !imageList.value[primaryIdx].isNew) {
      await setPrimaryImage({
        vehicleId: vehicleId,
        imageId: imageList.value[primaryIdx].id,
      })
    }
    const orderedIds = imageList.value.filter((img) => !img.isNew).map((img) => img.id)
    if (orderedIds.length > 1) {
      await reorderImages({ vehicleId: vehicleId, imageIds: orderedIds })
    }
    
    // Dismiss loading toast and show success
    toast.dismiss(loadingToast)
    toast.success('Vehicle updated successfully!', {
      description: 'Your vehicle information has been updated.',
    })
    
    router.replace({ name: 'vehicles' })
  } catch (error) {
    // Dismiss loading toast and show error
    toast.dismiss(loadingToast)
    
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors || {}
      toast.error('Validation Error', {
        description: 'Please check the form for validation errors.',
      })
    } else {
      errors.value = { general: 'Failed to update vehicle.' }
      toast.error('Update Failed', {
        description: 'Failed to update vehicle. Please try again.',
      })
    }
  } finally {
    isImagePending.value = false
  }
}

function onCancel() {
  router.replace({ name: 'vehicles' })
}
</script>
