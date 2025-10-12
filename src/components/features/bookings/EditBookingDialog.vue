<template>
  <Dialog @update:open="$emit('update:open', $event)" :open="open">
    <DialogContent class="sm:max-w-[450px]">
      <DialogHeader>
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogDescription>
          Update your booking details. You can only edit bookings that are pending and more than 24
          hours away.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-1 gap-4">
          <div class="flex flex-col gap-2">
            <Label for="start_date">Start Date</Label>
            <div class="grid grid-cols-1 gap-3">
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    id="start_date"
                    variant="outline"
                    class="w-full justify-start text-left font-medium"
                  >
                    <CalendarIcon class="mr-2 h-5 w-5" />
                    {{
                      startCalendarDate
                        ? df.format(startCalendarDate.toDate(getLocalTimeZone()))
                        : 'Pick a date'
                    }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0">
                  <Calendar v-model="startCalendarDate" initial-focus :is-date-disabled="isDateDisabled" />
                </PopoverContent>
              </Popover>
              <Input id="start_time" type="time" v-model="startTime" />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="end_date">End Date</Label>
            <div class="grid grid-cols-1 gap-3">
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    id="end_date"
                    variant="outline"
                    class="w-full justify-start text-left font-medium"
                  >
                    <CalendarIcon class="mr-2 h-5 w-5" />
                    {{
                      endCalendarDate
                        ? df.format(endCalendarDate.toDate(getLocalTimeZone()))
                        : 'Pick a date'
                    }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0">
                  <Calendar v-model="endCalendarDate" initial-focus :is-date-disabled="isDateDisabled" />
                </PopoverContent>
              </Popover>
              <Input id="end_time" type="time" v-model="endTime" />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="notes">Notes</Label>
            <Textarea id="notes" v-model="notes" placeholder="Any special requirements or notes" />
          </div>
          <div v-if="hasChanges && startDateIso && endDateIso" class="mt-2">
            <div v-if="summary" class="flex items-center gap-2">
              <span class="font-semibold">Total Price:</span>
              <span class="text-primary">₱{{ summary.total_price }}</span>
              <span v-if="!summary.available" class="text-destructive">
                (Not available for selected dates)
              </span>
            </div>
            <div v-if="error" class="text-destructive">{{ error }}</div>
          </div>
        </div>
      </div>
      <DialogFooter class="flex items-center justify-between">
        <Button @click="closeDialog" variant="outline">Cancel</Button>
        <Button
          :disabled="isSubmitDisabled"
          @click="handleSubmit"
          :class="{ 'opacity-50 cursor-not-allowed': isSubmitting }"
        >
          {{ isSubmitting ? 'Updating...' : 'Update Booking' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useUpdateBooking, useBookingSummary } from '@/services/booking-service'
import { toast } from 'vue-sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import { DateTime } from 'luxon'
import { isDateDisabled } from '@/lib/utils'

const props = defineProps({
  open: Boolean,
  booking: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:open', 'updated'])

// Form state
const startCalendarDate = ref(null)
const endCalendarDate = ref(null)
const startTime = ref('')
const endTime = ref('')
const notes = ref('')
const isSubmitting = ref(false)
const startDateIso = ref('')
const endDateIso = ref('')
const originalStartIso = ref('')
const originalEndIso = ref('')
const df = new DateFormatter('en-US', { dateStyle: 'long' })
const initialized = ref(false)

function computeIso(dateValue, timeValue) {
  if (!dateValue || !timeValue) return ''
  const jsDate = dateValue.toDate(getLocalTimeZone())
  const [hours, minutes] = timeValue.split(':')
  jsDate.setHours(Number(hours), Number(minutes), 0, 0)
  return DateTime.fromJSDate(jsDate, { zone: 'Asia/Manila' }).toISO({ suppressMilliseconds: true })
}

watch(
  () => props.booking,
  (booking) => {
    if (!booking || initialized.value) return
    const start = DateTime.fromISO(booking.start_date).setZone('Asia/Manila')
    const end = DateTime.fromISO(booking.end_date).setZone('Asia/Manila')

    startCalendarDate.value = parseDate(start.toISODate())
    endCalendarDate.value = parseDate(end.toISODate())
    startTime.value = start.toFormat('HH:mm')
    endTime.value = end.toFormat('HH:mm')
    notes.value = booking.notes || ''

    startDateIso.value = computeIso(startCalendarDate.value, startTime.value)
    endDateIso.value = computeIso(endCalendarDate.value, endTime.value)
    originalStartIso.value = start.toISO({ suppressMilliseconds: true })
    originalEndIso.value = end.toISO({ suppressMilliseconds: true })
    initialized.value = true
  },
  { immediate: true },
)

watch(
  () => [startCalendarDate.value, startTime.value],
  ([dateValue, timeValue]) => {
    startDateIso.value = computeIso(dateValue, timeValue)
  },
)

watch(
  () => [endCalendarDate.value, endTime.value],
  ([dateValue, timeValue]) => {
    endDateIso.value = computeIso(dateValue, timeValue)
  },
)

const datesChanged = computed(() => {
  return (
    (!!startDateIso.value && startDateIso.value !== originalStartIso.value) ||
    (!!endDateIso.value && endDateIso.value !== originalEndIso.value)
  )
})

// Check if form has any changes
const hasChanges = computed(() => {
  return datesChanged.value || notes.value !== (props.booking.notes || '')
})

// Form validation
const isValidForm = computed(() => {
  if (!startDateIso.value || !endDateIso.value) return false
  const start = DateTime.fromISO(startDateIso.value)
  const end = DateTime.fromISO(endDateIso.value)
  const now = DateTime.now().setZone('Asia/Manila')

  return start > now && end > start
})

const updateBooking = useUpdateBooking()
const bookingSummary = useBookingSummary()
const summary = ref(null)
const error = ref('')

const isSubmitDisabled = computed(() => {
  if (isSubmitting.value) return true
  if (!hasChanges.value) return true
  if (!isValidForm.value) return true

  if (datesChanged.value) {
    return !summary.value?.available
  }

  return false
})

// Watch for date changes to check availability
watch(
  () => [startDateIso.value, endDateIso.value],
  async ([start, end]) => {
    if (!datesChanged.value) {
      summary.value = null
      error.value = ''
      return
    }

    if (start && end && hasChanges.value) {
      try {
        summary.value = await bookingSummary({
          vehicle_id: props.booking.vehicle_id,
          start_date: start,
          end_date: end,
          driver_requested: props.booking.driver_requested,
          pickup_type: props.booking.pickup_type,
          delivery_location: props.booking.delivery_location,
          booking_id: props.booking.id,
        })
        error.value = ''
      } catch (e) {
        summary.value = null
        error.value = e.response?.data?.message || 'Error checking availability'
      }
    }
  },
)

async function handleSubmit() {
  if (!isValidForm.value) return
  if (datesChanged.value && !summary.value?.available) return
  if (!startDateIso.value || !endDateIso.value) return

  isSubmitting.value = true
  try {
    await updateBooking.mutateAsync({
      bookingId: props.booking.id,
      start_date: startDateIso.value,
      end_date: endDateIso.value,
      notes: notes.value,
    })
    toast.success('Booking updated successfully')
    emit('updated')
    closeDialog()
  } catch (err) {
    console.error('Error updating booking:', err)
    error.value = err.response?.data?.message || 'Failed to update booking'
    toast.error(error.value)
  } finally {
    isSubmitting.value = false
  }
}

function closeDialog() {
  emit('update:open', false)
}
</script>
