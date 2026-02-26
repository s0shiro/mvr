<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl w-full max-h-[90vh] flex flex-col">
      <DialogHeader class="flex-shrink-0">
        <DialogTitle>Submit Vehicle Return</DialogTitle>
        <DialogDescription>
          Share return details and optionally include photos to help admins verify the vehicle
          condition.
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto pr-2">
        <form @submit.prevent="handleSubmit" class="h-full flex flex-col">
          <div class="flex-1 space-y-4 pb-4">
            <div class="flex flex-col gap-2">
              <Label>Return Photos (optional)</Label>
              <div
                class="border-2 border-dashed border-primary/40 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-background hover:border-primary transition relative min-h-[96px]"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                :class="{ 'border-primary': isDragging }"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  class="absolute inset-0 opacity-0 cursor-pointer"
                  @change="handleFileChange"
                  @click.stop
                />
                <div
                  v-if="!form.customer_images.length && !isDragging"
                  class="flex flex-col items-center"
                >
                  <Upload class="w-8 h-8 text-muted-foreground mb-2" />
                  <span class="text-muted-foreground text-sm text-center">
                    Drag & drop images here or click to upload<br />
                    <span class="text-xs">Photos help admins verify the return condition.</span>
                  </span>
                </div>
                <div v-if="isDragging" class="flex flex-col items-center">
                  <span class="text-primary font-semibold">Drop files to upload</span>
                </div>
                <div
                  v-if="form.customer_images.length"
                  class="flex flex-wrap gap-2 mt-2 justify-center"
                >
                  <div v-for="(img, i) in form.customer_images" :key="i" class="relative group">
                    <img :src="img" class="w-16 h-16 object-cover rounded border" />
                    <button
                      type="button"
                      @click="removeImage(i)"
                      class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
              <p v-if="imageError" class="text-sm text-red-600">{{ imageError }}</p>
            </div>

            <!-- Vehicle Condition Information -->
            <div class="grid grid-cols-1 gap-4">
              <div class="flex flex-col gap-2">
                <Label>Return Date *</Label>
                <Popover>
                  <PopoverTrigger as-child>
                    <Button variant="outline" class="justify-start text-left font-medium">
                      <CalendarIcon class="mr-2 h-5 w-5" />
                      {{
                        returnedDate
                          ? df.format(returnedDate.toDate(getLocalTimeZone()))
                          : 'Select date'
                      }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0">
                    <Calendar v-model="returnedDate" initial-focus :is-date-disabled="isPastDate" />
                  </PopoverContent>
                </Popover>
              </div>
              <div class="flex flex-col gap-2">
                <Label>Return Time *</Label>
                <Input v-model="form.returned_time" type="time" required />
              </div>
            </div>

            <!-- Security Deposit Refund Information -->
            <div class="border border-border rounded-lg p-4 space-y-3">
              <h3 class="font-semibold text-foreground">
                Security Deposit Refund (₱{{ booking?.vehicle?.deposit || 0 }})
              </h3>

              <div class="flex flex-col gap-2">
                <Label>Preferred Refund Method *</Label>
                <Select v-model="form.customer_refund_method" :required="true">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select refund method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Refund Method</SelectLabel>
                      <SelectItem value="gcash">GCash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash Pickup</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <!-- GCash Details -->
              <div
                v-if="form.customer_refund_method === 'gcash'"
                class="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <div class="flex flex-col gap-2">
                  <Label>GCash Number *</Label>
                  <Input
                    v-model="form.customer_account_number"
                    type="tel"
                    placeholder="09XXXXXXXXX"
                    required
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <Label>Account Holder Name *</Label>
                  <Input
                    v-model="form.customer_account_name"
                    placeholder="Full name as registered"
                    required
                  />
                </div>
              </div>

              <!-- Bank Transfer Details -->
              <div v-if="form.customer_refund_method === 'bank_transfer'" class="space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="flex flex-col gap-2">
                    <Label>Bank Name *</Label>
                    <Input
                      v-model="form.customer_bank_name"
                      placeholder="e.g. BDO, BPI, Metrobank"
                      required
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <Label>Account Number *</Label>
                    <Input
                      v-model="form.customer_account_number"
                      placeholder="Bank account number"
                      required
                    />
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <Label>Account Holder Name *</Label>
                  <Input
                    v-model="form.customer_account_name"
                    placeholder="Full name as registered in bank"
                    required
                  />
                </div>
              </div>

              <!-- Additional Notes -->
              <div class="flex flex-col gap-2">
                <Label
                  >{{
                    form.customer_refund_method === 'cash'
                      ? 'Pickup Instructions'
                      : 'Additional Notes'
                  }}
                  (optional)</Label
                >
                <Textarea
                  v-model="form.customer_refund_notes"
                  :placeholder="
                    form.customer_refund_method === 'cash'
                      ? 'Specify pickup location or special instructions...'
                      : 'Any special instructions for the refund process...'
                  "
                  rows="2"
                />
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p class="text-sm text-blue-800">
                  <strong>Note:</strong> After submission, an admin will review your return and
                  assess any fees before processing your deposit refund.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <DialogFooter class="flex-shrink-0 border-t pt-4">
        <Button type="button" variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button type="button" @click="handleSubmit" :disabled="isSubmitting" class="min-w-[120px]">
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin mr-2" />
          {{ isSubmitting ? 'Submitting...' : 'Submit Return' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, nextTick, onMounted } from 'vue'
import { useSubmitVehicleReturn } from '@/services/customer/vehicle-return-service'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Loader2, Calendar as CalendarIcon } from 'lucide-vue-next'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DateFormatter,
  getLocalTimeZone,
  parseDate,
  CalendarDate,
  today,
} from '@internationalized/date'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from '@/components/ui/select'

const props = defineProps({
  booking: Object,
  open: Boolean,
})

const emit = defineEmits(['update:open', 'submitted'])

const form = ref({
  customer_images: [],
  returned_time: '',
  returned_at: '',
  // Customer refund account information
  customer_refund_method: '',
  customer_account_number: '',
  customer_account_name: '',
  customer_bank_name: '',
  customer_refund_notes: '',
})

// Calendar date for returned date
const returnedDate = ref(null)
const df = new DateFormatter('en-US', { dateStyle: 'long' })

const isDragging = ref(false)
const imageError = ref('')
const isSubmitting = ref(false)

// Check if a date is in the past (before today) - these dates should be disabled
function isPastDate(date) {
  const todayDate = today(getLocalTimeZone())
  return date.compare(todayDate) < 0
}

// Update returned_at when date or time changes
watch([returnedDate, () => form.value.returned_time], ([date, time]) => {
  if (date && time) {
    const year = date.year
    const month = String(date.month).padStart(2, '0')
    const day = String(date.day).padStart(2, '0')
    const [h, m] = time.split(':')
    form.value.returned_at = `${year}-${month}-${day} ${h}:${m}:00`
  }
})

watch(
  () => props.open,
  (val) => {
    if (val) {
      // Pre-fill date and time from booking's end_date
      if (props.booking?.end_date) {
        const endDate = new Date(props.booking.end_date)
        returnedDate.value = new CalendarDate(
          endDate.getFullYear(),
          endDate.getMonth() + 1,
          endDate.getDate(),
        )
        const hours = endDate.getHours().toString().padStart(2, '0')
        const minutes = endDate.getMinutes().toString().padStart(2, '0')

        // Set returned_at immediately with correct format
        const year = endDate.getFullYear()
        const month = String(endDate.getMonth() + 1).padStart(2, '0')
        const day = String(endDate.getDate()).padStart(2, '0')

        form.value = {
          customer_images: [],
          returned_time: `${hours}:${minutes}`,
          returned_at: `${year}-${month}-${day} ${hours}:${minutes}:00`,
          // Reset refund fields
          customer_refund_method: '',
          customer_account_number: '',
          customer_account_name: '',
          customer_bank_name: '',
          customer_refund_notes: '',
        }
      } else {
        const now = new Date()
        returnedDate.value = new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')

        form.value = {
          customer_images: [],
          returned_time: `${hours}:${minutes}`,
          returned_at: `${year}-${month}-${day} ${hours}:${minutes}:00`,
          // Reset refund fields
          customer_refund_method: '',
          customer_account_number: '',
          customer_account_name: '',
          customer_bank_name: '',
          customer_refund_notes: '',
        }
      }
      imageError.value = ''
    }
  },
  { immediate: true },
)

const { mutate: submitReturn } = useSubmitVehicleReturn()

// Helper to compose datetime string from calendar + time (without timezone conversion)
function composeReturnedAtISO() {
  if (!returnedDate.value || !form.value.returned_time) return null

  // Format as YYYY-MM-DD HH:mm:ss to avoid timezone conversion issues
  const year = returnedDate.value.year
  const month = String(returnedDate.value.month).padStart(2, '0')
  const day = String(returnedDate.value.day).padStart(2, '0')
  const [hh, mm] = form.value.returned_time.split(':')

  return `${year}-${month}-${day} ${hh}:${mm}:00`
}

function handleDrop(e) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'))
  processFiles(files)
}

function handleFileChange(e) {
  const files = Array.from(e.target.files).filter((file) => file.type.startsWith('image/'))
  processFiles(files)
}

function processFiles(files) {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const validFiles = files.filter((file) => {
    if (file.size > maxSize) {
      imageError.value = `File ${file.name} is too large. Maximum size is 5MB.`
      return false
    }
    return true
  })

  if (validFiles.length === 0) return

  imageError.value = ''

  const readers = validFiles.map(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target.result)
        reader.readAsDataURL(file)
      }),
  )

  Promise.all(readers).then((images) => {
    form.value.customer_images = [...form.value.customer_images, ...images]
  })
}

function removeImage(index) {
  form.value.customer_images.splice(index, 1)
}

function handleSubmit() {
  if (!props.booking) return

  if (!returnedDate.value || !form.value.returned_time) {
    imageError.value = 'Please provide the return date and time'
    return
  }

  // Validate refund method is selected
  if (!form.value.customer_refund_method) {
    imageError.value = 'Please select a refund method for your security deposit'
    return
  }

  // Validate refund account details based on method
  if (form.value.customer_refund_method === 'gcash') {
    if (!form.value.customer_account_number || !form.value.customer_account_name) {
      imageError.value = 'Please provide your GCash number and account holder name'
      return
    }
  } else if (form.value.customer_refund_method === 'bank_transfer') {
    if (
      !form.value.customer_bank_name ||
      !form.value.customer_account_number ||
      !form.value.customer_account_name
    ) {
      imageError.value = 'Please provide complete bank account details'
      return
    }
  }

  imageError.value = ''
  isSubmitting.value = true

  const payload = {
    ...form.value,
    returned_at: form.value.returned_at,
  }

  submitReturn(
    { bookingId: props.booking.id, ...payload },
    {
      onSuccess: () => {
        isSubmitting.value = false
        emit('update:open', false)
        emit('submitted')
      },
      onError: (error) => {
        isSubmitting.value = false
        console.error('Return submission failed:', error)
        imageError.value =
          error?.response?.data?.message || 'Failed to submit return. Please try again.'
      },
    },
  )
}
</script>
