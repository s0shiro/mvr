<template>
  <Dialog :open="open" @update:open="(val) => $emit('update:open', val)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader class="px-6 pt-6">
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>Fill out the form to book this vehicle.</DialogDescription>
      </DialogHeader>
      <form @submit.prevent="onSubmit" class="flex flex-col gap-4 px-6 pb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <Label for="start_date">Start Date</Label>
            <Popover>
              <PopoverTrigger as-child>
                <Button variant="outline" class="w-full justify-start text-left font-normal">
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ startDate ? df.format(startDate.toDate(getLocalTimeZone())) : 'Pick a date' }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar v-model="startDate" initial-focus />
              </PopoverContent>
            </Popover>
            <Input type="time" v-model="form.start_time" id="start_time" required />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="end_date">End Date</Label>
            <Popover>
              <PopoverTrigger as-child>
                <Button variant="outline" class="w-full justify-start text-left font-normal">
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ endDate ? df.format(endDate.toDate(getLocalTimeZone())) : 'Pick a date' }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar v-model="endDate" initial-focus />
              </PopoverContent>
            </Popover>
            <Input type="time" v-model="form.end_time" id="end_time" required />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="notes">Notes</Label>
          <Textarea v-model="form.notes" id="notes" placeholder="Any special requests?" />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="form.driver_requested" id="driver_requested" />
          <Label for="driver_requested">Request a Driver</Label>
        </div>
        <hr class="my-2 border-muted-foreground/30" />
        <div class="flex flex-col gap-2">
          <Label>Pickup Options</Label>
          <RadioGroup v-model="form.pickup_type" class="flex flex-row gap-6">
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label for="pickup">Pick up</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label for="delivery">Deliver</Label>
            </div>
          </RadioGroup>
        </div>
        <div v-if="form.pickup_type === 'delivery'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <Label for="delivery_location">Delivery Location</Label>
            <Select v-model="form.delivery_location">
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
          </div>
          <div class="flex flex-col gap-2">
            <Label for="delivery_details">Delivery Details</Label>
            <Textarea
              v-model="form.delivery_details"
              id="delivery_details"
              placeholder="Barangay, landmark, instructions"
              required
            />
          </div>
        </div>
        <hr class="my-2 border-muted-foreground/30" />
        <div v-if="summary" class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="font-semibold">Daily Rate:</span>
            <span class="text-primary">₱{{ summary.rental_rate }}</span>
            <span class="text-sm text-muted-foreground">
              ({{ summary.with_driver ? 'With' : 'Without' }} Driver)
            </span>
          </div>
          <div
            v-if="form.pickup_type === 'delivery' && form.delivery_location"
            class="flex items-center gap-2"
          >
            <span class="font-semibold">Delivery Fee:</span>
            <span class="text-primary">₱{{ summary.delivery_options?.delivery_fee || 0 }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold">Total Price:</span>
            <span class="text-primary">₱{{ summary.total_price }}</span>
            <span v-if="!summary.available" class="text-red-500">
              (Not available for selected dates)
            </span>
          </div>
        </div>
        <div v-if="error" class="text-red-500">{{ error }}</div>
        <DialogFooter class="mt-4">
          <Button type="button" variant="secondary" @click="onClose">Cancel</Button>
          <Button type="submit" :disabled="!summary?.available || loading">Book Now</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { useBookingSummary, useCreateBooking } from '@/services/booking-service'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'

const df = new DateFormatter('en-US', { dateStyle: 'long' })
const startDate = ref(null)
const endDate = ref(null)

const props = defineProps({
  vehicleId: { type: [String, Number], required: true },
  open: { type: Boolean, required: true },
  onClose: { type: Function, required: true },
})

const emit = defineEmits(['booked'])

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

const dialogTitle = computed(() => 'Book Vehicle')

const bookingSummary = useBookingSummary()
const createBooking = useCreateBooking()

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
          vehicle_id: props.vehicleId,
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
    // Compose ISO string for API
    const d = date.toDate(getLocalTimeZone())
    const [h, m] = time.split(':')
    d.setHours(Number(h))
    d.setMinutes(Number(m))
    form.value.start_date = d.toISOString().slice(0, 16).replace('T', ' ')
  }
})

watch([endDate, () => form.value.end_time], ([date, time]) => {
  if (date && time) {
    const d = date.toDate(getLocalTimeZone())
    const [h, m] = time.split(':')
    d.setHours(Number(h))
    d.setMinutes(Number(m))
    form.value.end_date = d.toISOString().slice(0, 16).replace('T', ' ')
  }
})

async function onSubmit() {
  loading.value = true
  try {
    // Only send delivery fields if delivery is selected
    const payload = {
      vehicle_id: props.vehicleId,
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      notes: form.value.notes,
      driver_requested: form.value.driver_requested,
      pickup_type: form.value.pickup_type,
    }
    if (form.value.pickup_type === 'delivery') {
      payload.delivery_location = form.value.delivery_location
      payload.delivery_details = form.value.delivery_details
    }
    const res = await createBooking.mutateAsync(payload)
    emit('booked', res.booking)
    onClose()
  } catch (e) {
    error.value = e.response?.data?.message || 'Booking failed'
  } finally {
    loading.value = false
  }
}
</script>
