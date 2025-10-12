<template>
  <div class="">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-3xl font-extrabold text-primary">Book This Vehicle</h1>
      <Button variant="ghost" @click="goBack">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="inline-block mr-2 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Vehicle
      </Button>
    </div>
    <p class="text-muted-foreground mb-8">
      Complete the form below to reserve your vehicle. Fields marked with
      <span class="text-red-500">*</span> are required.
    </p>
    <!-- Driver Unavailable Alert -->
    <div
      v-if="error === 'No driver available for selected dates'"
      class="mb-6"
      ref="driverUnavailableRef"
    >
      <DriverUnavailableAlert />
      <div class="text-sm text-muted-foreground mt-2">
        No drivers are available for your selected dates. You may try adjusting your booking dates,
        or proceed without requesting a driver.
      </div>
    </div>
    <form @submit.prevent="onSubmit" class="space-y-8">
      <!-- Date/Time Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          ref="startDateRef"
          class="bg-muted/60 rounded-xl p-6 flex flex-col gap-3 border border-border"
        >
          <Label for="start_date" class="font-semibold">
            Start Date <span class="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline" class="w-full justify-start text-left font-medium" :disabled="blockedDatesLoading">
                <CalendarIcon class="mr-2 h-5 w-5" />
                {{ startDate ? df.format(startDate.toDate(getLocalTimeZone())) : 'Pick a date' }}
                <span v-if="blockedDatesLoading" class="ml-2 text-sm text-muted-foreground">Loading...</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar v-model="startDate" initial-focus :is-date-disabled="customIsDateDisabled" />
            </PopoverContent>
          </Popover>
          <Input type="time" v-model="form.start_time" id="start_time" class="rounded-lg" />
        </div>
        <div
          ref="endDateRef"
          class="bg-muted/60 rounded-xl p-6 flex flex-col gap-3 border border-border"
        >
          <Label for="end_date" class="font-semibold">
            End Date <span class="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline" class="w-full justify-start text-left font-medium" :disabled="blockedDatesLoading">
                <CalendarIcon class="mr-2 h-5 w-5" />
                {{ endDate ? df.format(endDate.toDate(getLocalTimeZone())) : 'Pick a date' }}
                <span v-if="blockedDatesLoading" class="ml-2 text-sm text-muted-foreground">Loading...</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar v-model="endDate" initial-focus :is-date-disabled="customIsDateDisabled" />
            </PopoverContent>
          </Popover>
          <Input type="time" v-model="form.end_time" id="end_time" class="rounded-lg" />
        </div>
      </div>
      <!-- Pickup/Delivery Section -->
      <div class="bg-muted/60 rounded-xl p-6 border border-border flex flex-col gap-4">
        <Label class="font-semibold">Pickup Options <span class="text-red-500">*</span></Label>
        <RadioGroup v-model="form.pickup_type" class="flex flex-row gap-8">
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="pickup" id="pickup" />
            <Label for="pickup">Pick up</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="delivery" id="delivery" />
            <Label for="delivery">Deliver</Label>
          </div>
        </RadioGroup>
        <transition name="fade">
          <div
            v-if="form.pickup_type === 'delivery'"
            class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2"
          >
            <div class="flex flex-col gap-2">
              <Label for="delivery_location">
                Delivery Location <span class="text-red-500">*</span>
              </Label>
              <Select v-model="form.delivery_location" ref="deliveryLocationRef">
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Locations</SelectLabel>
                    <SelectItem
                      v-for="location in deliveryLocations"
                      :key="location.name"
                      :value="location.name"
                    >
                      {{ location.name }} - ₱{{ location.fee }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span v-if="fieldErrors.delivery_location" class="text-red-500 text-xs mt-1">{{
                fieldErrors.delivery_location
              }}</span>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="delivery_details">
                Delivery Details <span class="text-red-500">*</span>
              </Label>
              <Textarea
                v-model="form.delivery_details"
                id="delivery_details"
                ref="deliveryDetailsRef"
                placeholder="Barangay, landmark, instructions"
                class="rounded-lg"
              />
              <span v-if="fieldErrors.delivery_details" class="text-red-500 text-xs mt-1">{{
                fieldErrors.delivery_details
              }}</span>
            </div>
          </div>
        </transition>
      </div>
      <!-- Notes & Driver -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="flex flex-col gap-2">
          <Label for="notes" class="font-semibold">Notes</Label>
          <Textarea
            v-model="form.notes"
            id="notes"
            placeholder="Any special requests?"
            class="rounded-lg"
          />
        </div>
        <div
          v-if="isDriverOptionAvailable"
          class="flex items-center gap-3 mt-6 md:mt-0"
        >
          <Checkbox v-model="form.driver_requested" id="driver_requested" />
          <Label for="driver_requested">Request a Driver</Label>
        </div>
        <div
          v-else
          class="flex items-center mt-6 md:mt-0 text-sm text-muted-foreground"
        >
          Driver service isn't available for motorcycles.
        </div>
      </div>
      <!-- Price Summary -->
      <BookingSummaryReceipt
        v-if="summary"
        :summary="summary"
        :form="form"
        :loading="loading"
        v-model:minimized="minimizedSummary"
        @book-now="onSubmit"
      />

      <!-- Contract Preview -->
      <div v-if="summary" class="bg-gradient-to-br from-muted/40 to-muted/60 rounded-xl border border-border overflow-hidden">
        <div class="bg-primary/5 px-6 py-4 border-b border-border/50">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-foreground">Rental Contract Preview</h2>
              <p class="text-sm text-muted-foreground">
                Review the contract template below.
              </p>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-border/50 overflow-hidden">
            <div class="max-h-[600px] overflow-y-auto custom-scrollbar">
              <ContractPrint :booking="null" :showPrintButton="false" />
            </div>
          </div>
        </div>
      </div>

      <!-- ID Upload Section -->
      <div
        ref="idUploadSectionRef"
        class="bg-muted/60 rounded-xl p-6 border border-border flex flex-col gap-3"
      >
        <Label class="font-semibold">Upload 2 Valid IDs <span class="text-red-500">*</span></Label>
        <div class="grid grid-cols-2 gap-6">
          <div
            v-for="(preview, idx) in [0, 1]"
            :key="idx"
            class="relative aspect-video rounded-lg border-2 border-dashed border-primary/40 overflow-hidden flex items-center justify-center bg-background hover:border-primary transition"
          >
            <img
              v-if="idPreviews[idx]"
              :src="idPreviews[idx]"
              :alt="`ID ${idx + 1} Preview`"
              class="w-full h-full object-cover"
            />
            <Button
              v-if="idPreviews[idx]"
              type="button"
              variant="destructive"
              size="icon"
              class="absolute top-2 right-2 h-7 w-7"
              @click="removeIdImage(idx)"
            >
              <XIcon class="h-5 w-5" />
            </Button>
            <div
              v-if="!idPreviews[idx]"
              class="flex flex-col items-center justify-center w-full h-full cursor-pointer"
              @click="() => triggerIdFileInput(idx)"
            >
              <UploadIcon class="h-10 w-10 text-muted-foreground mb-1" />
              <span class="text-xs text-muted-foreground">Add ID {{ idx + 1 }}</span>
            </div>
            <input
              :ref="(el) => (idFileInputs[idx] = el)"
              type="file"
              accept="image/*"
              class="hidden"
              @change="(e) => handleIdImageChange(e, idx)"
            />
          </div>
        </div>
        <div v-if="idUploadError" class="text-red-500 text-xs mt-1">{{ idUploadError }}</div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBookingSummary, useCreateBooking, useBlockedDates } from '@/services/booking-service'
import { useVehicleDetails } from '@/services/vehicle-service'
import {
  Calendar as CalendarIcon,
  XIcon,
  UploadIcon,
  DollarSign,
  Truck,
  Calculator,
} from 'lucide-vue-next'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DateFormatter, getLocalTimeZone, today, parseDate } from '@internationalized/date'
import { DateTime } from 'luxon'
import { isDateDisabled } from '@/lib/utils'
import BookingSummaryReceipt from '@/components/features/BookingSummaryReceipt.vue'
import DriverUnavailableAlert from '@/components/features/DriverUnavailableAlert.vue'
import ContractPrint from '@/components/features/ContractPrint.vue'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const vehicleId = route.params.id

const df = new DateFormatter('en-US', { dateStyle: 'long' })
const startDate = ref(null)
const endDate = ref(null)

const deliveryLocations = [
  { name: 'Boac', fee: 300 },
  { name: 'Gasan', fee: 300 },
  { name: 'Gasan Port', fee: 300 },
  { name: 'Balanacan', fee: 300 },
  { name: 'Buenavista', fee: 300 },
  { name: 'Sta. Cruz', fee: 500 },
  { name: 'Sta. Cruz Port', fee: 500 },
  { name: 'Torrijos', fee: 700 },
  { name: 'Maniwaya', fee: 500 },
  { name: 'Mogpog', fee: 150 },
]

const form = ref({
  notes: '',
  driver_requested: false,
  pickup_type: 'pickup',
  delivery_location: '',
  delivery_details: '',
  start_time: '',
  end_time: '',
})
const summary = ref(null)
const error = ref('')
const loading = ref(false)
const fieldErrors = ref({})

const bookingSummary = useBookingSummary()
const createBooking = useCreateBooking()
const { data: blockedDatesData, isLoading: blockedDatesLoading } = useBlockedDates(vehicleId)
const { data: vehicleData } = useVehicleDetails(vehicleId)

const vehicle = computed(() => vehicleData.value?.data || null)
const isDriverOptionAvailable = computed(() => {
  const type = vehicle.value?.type
  return (type ? type.toLowerCase() : '') !== 'motorcycle'
})

watch(isDriverOptionAvailable, (available) => {
  if (!available && form.value.driver_requested) {
    form.value.driver_requested = false
  }
})

watch(
  () => [
    form.value.start_date,
    form.value.end_date,
    form.value.driver_requested,
    form.value.pickup_type,
    form.value.delivery_location,
  ],
  async ([start, end, driverRequested, pickupType, deliveryLocation]) => {
    if (start && end) {
      try {
        summary.value = await bookingSummary({
          vehicle_id: vehicleId,
          start_date: start,
          end_date: end,
          driver_requested: driverRequested,
          pickup_type: pickupType,
          delivery_location: deliveryLocation,
        })
        error.value = ''
      } catch (e) {
        summary.value = null
        error.value = e.response?.data?.message || 'Error checking availability'
      }
    } else {
      summary.value = null
    }
  },
)

watch([startDate, () => form.value.start_time], ([date, time]) => {
  if (date && time) {
    // Use Luxon to create a DateTime in Asia/Manila
    const d = date.toDate(getLocalTimeZone())
    const [h, m] = time.split(':')
    d.setHours(Number(h), Number(m), 0, 0)
    // Format as ISO 8601 with +08:00 offset
    form.value.start_date = DateTime.fromJSDate(d, { zone: 'Asia/Manila' }).toISO({
      suppressMilliseconds: true,
    })
  }
})

watch([endDate, () => form.value.end_time], ([date, time]) => {
  if (date && time) {
    // Use Luxon to create a DateTime in Asia/Manila
    const d = date.toDate(getLocalTimeZone())
    const [h, m] = time.split(':')
    d.setHours(Number(h), Number(m), 0, 0)
    // Format as ISO 8601 with +08:00 offset
    form.value.end_date = DateTime.fromJSDate(d, { zone: 'Asia/Manila' }).toISO({
      suppressMilliseconds: true,
    })
  }
})

const idFileInputs = [null, null]
const idFiles = ref([null, null])
const idPreviews = ref([null, null])
const idUploadError = ref('')

function triggerIdFileInput(idx) {
  if (idFileInputs[idx]) idFileInputs[idx].click()
}

function handleIdImageChange(event, idx) {
  const file = event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    idUploadError.value = 'Only image files are allowed.'
    idFiles.value[idx] = null
    idPreviews.value[idx] = null
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    idPreviews.value[idx] = e.target.result
    idFiles.value[idx] = file
    idUploadError.value = ''
  }
  reader.readAsDataURL(file)
}

function removeIdImage(idx) {
  idFiles.value[idx] = null
  idPreviews.value[idx] = null
}

function isBlocked(date) {
  return (blockedDatesData.value || []).some(range => {
    const start = parseDate(range.start_date.split('T')[0])
    const end = parseDate(range.end_date.split('T')[0])
    return date.compare(start) >= 0 && date.compare(end) <= 0
  })
}

function customIsDateDisabled(date) {
  return isDateDisabled(date) || blockedDatesLoading.value || isBlocked(date)
}

const minimizedSummary = ref(false)

async function onSubmit() {
  loading.value = true
  fieldErrors.value = {}
  try {
    if (!idFiles.value[0] || !idFiles.value[1]) {
      idUploadError.value = 'Please upload exactly two valid ID images.'
      toast.error('Valid IDs Required', {
        description: 'Please upload exactly two valid ID images to proceed with your booking.',
      })
      loading.value = false
      // Scroll to ID upload section
      nextTick(() => {
        idUploadSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return
    }
    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    const [id1, id2] = await Promise.all([toBase64(idFiles.value[0]), toBase64(idFiles.value[1])])
    const payload = {
      vehicle_id: vehicleId,
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      notes: form.value.notes,
      driver_requested: form.value.driver_requested,
      pickup_type: form.value.pickup_type,
      valid_ids: { id1, id2 },
    }
    if (form.value.pickup_type === 'delivery') {
      payload.delivery_location = form.value.delivery_location
      payload.delivery_details = form.value.delivery_details
    }
    const res = await createBooking.mutateAsync(payload)
    router.push({ name: 'my-bookings' })
  } catch (e) {
    // Handle backend validation errors
    if (e.response && e.response.data && e.response.data.errors) {
      fieldErrors.value = Object.fromEntries(
        Object.entries(e.response.data.errors).map(([k, v]) => [k, v[0]]),
      )
      error.value = e.response.data.message
      // Auto-scroll to first error field
      nextTick(() => {
        if (fieldErrors.value.start_date && startDateRef.value) {
          startDateRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (fieldErrors.value.end_date && endDateRef.value) {
          endDateRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (fieldErrors.value.delivery_location && deliveryLocationRef.value) {
          deliveryLocationRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (fieldErrors.value.delivery_details && deliveryDetailsRef.value) {
          deliveryDetailsRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (idUploadSectionRef.value) {
          idUploadSectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    } else {
      error.value = e.response?.data?.message || 'Booking failed'
      // If the error is 'No driver available for selected dates', scroll to the alert after DOM update
      nextTick(() => {
        setTimeout(() => {
          if (
            error.value === 'No driver available for selected dates' &&
            driverUnavailableRef.value
          ) {
            driverUnavailableRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 50)
      })
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--primary) / 0.3) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: hsl(var(--primary) / 0.3);
  border-radius: 4px;
  transition: background-color 0.2s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: hsl(var(--primary) / 0.5);
}
</style>
