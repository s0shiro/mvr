<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader class="px-6 pt-6">
        <DialogTitle>Edit Vehicle</DialogTitle>
        <DialogDescription>Update the details of this vehicle.</DialogDescription>
      </DialogHeader>
      <ScrollArea class="max-h-[80vh] p-6">
        <form @submit.prevent="onSubmit" class="flex flex-col gap-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <Label for="name">Name</Label>
              <Input id="name" v-model="form.name" placeholder="Vehicle name" class="w-full" />
              <p v-if="errors.name" class="text-destructive text-xs mt-1">{{ errors.name }}</p>
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
                        !form.type && 'text-muted-foreground',
                      )
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
              <Label for="brand">Brand</Label>
              <Input id="brand" v-model="form.brand" placeholder="Brand" class="w-full" />
              <p v-if="errors.brand" class="text-destructive text-xs mt-1">{{ errors.brand }}</p>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="model">Model</Label>
              <Input id="model" v-model="form.model" placeholder="Model" class="w-full" />
              <p v-if="errors.model" class="text-destructive text-xs mt-1">{{ errors.model }}</p>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="year">Year</Label>
              <Input
                id="year"
                v-model="form.year"
                type="number"
                min="1900"
                :max="maxYear"
                placeholder="Year"
                class="w-full"
              />
              <p v-if="errors.year" class="text-destructive text-xs mt-1">{{ errors.year }}</p>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="plate_number">Plate Number</Label>
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
              <Label for="capacity">Capacity</Label>
              <Input
                id="capacity"
                v-model="form.capacity"
                type="number"
                min="1"
                placeholder="Capacity"
                class="w-full"
              />
              <p v-if="errors.capacity" class="text-destructive text-xs mt-1">
                {{ errors.capacity }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="rental_rate">Rental Rate (Without Driver)</Label>
              <Input
                class="w-full"
                id="rental_rate"
                v-model="form.rental_rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="Daily rate without driver"
              />
              <p v-if="errors.rental_rate" class="text-destructive text-xs mt-1">
                {{ errors.rental_rate }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="rental_rate_with_driver">Rental Rate (With Driver)</Label>
              <Input
                class="w-full"
                id="rental_rate_with_driver"
                v-model="form.rental_rate_with_driver"
                type="number"
                min="0"
                step="0.01"
                placeholder="Daily rate with driver"
              />
              <p v-if="errors.rental_rate_with_driver" class="text-destructive text-xs mt-1">
                {{ errors.rental_rate_with_driver }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="deposit">Deposit</Label>
              <Input
                id="deposit"
                v-model="form.deposit"
                type="number"
                min="0"
                step="0.01"
                placeholder="Deposit amount"
                class="w-full"
              />
              <p v-if="errors.deposit" class="text-destructive text-xs mt-1">
                {{ errors.deposit }}
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
                      !form.status && 'text-muted-foreground',
                    )
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
          <div class="flex flex-col gap-2 w-full">
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

          <!-- Image Edit Section -->
          <div class="flex flex-col gap-2 w-full">
            <Label>Vehicle Images</Label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <!-- Existing Images -->
              <div
                v-for="(img, idx) in imageList"
                :key="img.id || img.preview"
                class="relative aspect-square rounded-lg border-2 border-border overflow-hidden group"
              >
                <img
                  :src="img.image_url || img.preview"
                  alt="Preview"
                  class="w-full h-full object-cover"
                />
                <Button
                  v-if="!img.isNew"
                  type="button"
                  variant="destructive"
                  size="icon"
                  class="absolute top-2 right-2 h-6 w-6 opacity-80 group-hover:opacity-100"
                  @click="removeImage(idx)"
                >
                  <XIcon class="h-4 w-4" />
                </Button>
                <Button
                  v-if="!img.isNew && !img.is_primary"
                  type="button"
                  variant="outline"
                  size="icon"
                  class="absolute bottom-2 left-2 h-6 w-6 bg-white/80"
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
              <!-- Upload Button -->
              <div
                v-if="imageList.length < 5"
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
            <p v-if="errors.images" class="text-destructive text-xs mt-1">
              {{ errors.images }}
            </p>
          </div>

          <DialogFooter class="mt-4">
            <Button type="button" variant="outline" @click="$emit('close')">Cancel</Button>
            <Button type="submit" :disabled="isPending || isImagePending">{{
              isPending || isImagePending ? 'Updating...' : 'Update Vehicle'
            }}</Button>
          </DialogFooter>
        </form>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  useUpdateVehicle,
  useUploadVehicleImages,
  useDeleteVehicleImage,
  useSetPrimaryImage,
  useReorderVehicleImages,
} from '@/services/vehicle-service'
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
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Check, ChevronDown, XIcon, UploadIcon, StarIcon } from 'lucide-vue-next'
import { cn, getActiveLabel } from '@/lib/utils'

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

const props = defineProps({
  vehicle: { type: Object, required: true },
})
const emit = defineEmits(['updated', 'close'])

const isOpen = ref(true)
const form = ref({ ...props.vehicle })
const errors = ref({})
const maxYear = new Date().getFullYear() + 1
const fileInput = ref(null)
const imageList = ref([]) // [{id, image_url, is_primary, isNew, file, preview}]
const isImagePending = ref(false)

watch(
  () => props.vehicle,
  (val) => {
    form.value = { ...val }
    // Initialize imageList from vehicle.images
    imageList.value = (val.images || []).map((img) => ({ ...img, isNew: false }))
  },
  { immediate: true },
)

const { mutate: updateVehicle, isPending } = useUpdateVehicle()
const { mutateAsync: uploadImages } = useUploadVehicleImages()
const { mutateAsync: deleteImage } = useDeleteVehicleImage()
const { mutateAsync: setPrimaryImage } = useSetPrimaryImage()
const { mutateAsync: reorderImages } = useReorderVehicleImages()

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
  imageList.value.splice(idx, 1)
}

function setPrimary(idx) {
  imageList.value.forEach((img, i) => (img.is_primary = i === idx))
}

async function onSubmit() {
  errors.value = {}
  // Convert numeric fields
  const payload = {
    ...form.value,
    year: form.value.year ? Number(form.value.year) : '',
    capacity: form.value.capacity ? Number(form.value.capacity) : '',
    rental_rate: form.value.rental_rate ? Number(form.value.rental_rate) : '',
    deposit: form.value.deposit ? Number(form.value.deposit) : '',
  }
  isImagePending.value = true
  try {
    // 1. Update vehicle info
    await new Promise((resolve, reject) => {
      updateVehicle(
        { vehicleId: props.vehicle.id, vehicleData: payload },
        {
          onSuccess: resolve,
          onError: reject,
        },
      )
    })
    // 2. Handle images
    // a. Delete removed images
    const originalIds = (props.vehicle.images || []).map((img) => img.id)
    const currentIds = imageList.value.filter((img) => !img.isNew).map((img) => img.id)
    const toDelete = originalIds.filter((id) => !currentIds.includes(id))
    for (const id of toDelete) {
      await deleteImage({ vehicleId: props.vehicle.id, imageId: id })
    }
    // b. Upload new images
    const newImages = imageList.value.filter((img) => img.isNew).map((img) => img.file)
    if (newImages.length > 0) {
      await uploadImages({ vehicleId: props.vehicle.id, images: newImages })
    }
    // c. Set primary image
    const primaryIdx = imageList.value.findIndex((img) => img.is_primary)
    if (primaryIdx !== -1 && !imageList.value[primaryIdx].isNew) {
      await setPrimaryImage({
        vehicleId: props.vehicle.id,
        imageId: imageList.value[primaryIdx].id,
      })
    }
    // d. Reorder images (only for existing images)
    const orderedIds = imageList.value.filter((img) => !img.isNew).map((img) => img.id)
    if (orderedIds.length > 1) {
      await reorderImages({ vehicleId: props.vehicle.id, imageIds: orderedIds })
    }
    emit('updated')
    emit('close')
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors || {}
    } else {
      errors.value = { general: 'Failed to update vehicle.' }
    }
  } finally {
    isImagePending.value = false
  }
}
</script>
