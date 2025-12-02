<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Release Vehicle</DialogTitle>
        <DialogDescription>
          Log the vehicle's condition and details before releasing to the customer.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="flex gap-4">
          <div class="flex-1 flex flex-col gap-2">
            <Label for="fuel_level">Fuel Level</Label>
            <Input v-model="form.fuel_level" id="fuel_level" placeholder="e.g. Full, 3/4, Half" />
          </div>
          <div class="flex-1 flex flex-col gap-2">
            <Label for="odometer">Odometer</Label>
            <Input v-model="form.odometer" id="odometer" type="number" placeholder="e.g. 12345" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="released_at">Release Date & Time</Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline" class="w-full justify-start text-left font-medium">
                <CalendarIcon class="mr-2 h-5 w-5" />
                {{
                  releasedDate ? df.format(releasedDate.toDate(getLocalTimeZone())) : 'Pick a date'
                }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar v-model="releasedDate" initial-focus />
            </PopoverContent>
          </Popover>
          <Input type="time" v-model="releasedTime" id="released_time" class="rounded-lg mt-2" />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="condition_notes">Condition Notes</Label>
          <Textarea
            v-model="form.condition_notes"
            id="condition_notes"
            placeholder="Describe any scratches, dents, etc."
          />
        </div>
        <div class="flex gap-2 justify-end">
          <Button type="button" variant="secondary" @click="$emit('update:open', false)"
            >Cancel</Button
          >
          <Button type="submit" :disabled="loading">Confirm Release</Button>
        </div>
        <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useReleaseVehicle } from '@/services/admin/vehicle-release-service'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import {
  DateFormatter,
  getLocalTimeZone,
  parseDateTime,
  CalendarDate,
} from '@internationalized/date'

const props = defineProps({
  open: Boolean,
  booking: Object,
})
const emit = defineEmits(['update:open', 'released'])

const df = new DateFormatter('en-US', { dateStyle: 'long' })
const releasedDate = ref(null)
const releasedTime = ref('')

const form = ref({
  condition_notes: '',
  fuel_level: '',
  odometer: '',
  released_at: '',
})
const error = ref('')
const loading = ref(false)
const releaseVehicle = useReleaseVehicle()

watch(
  () => props.open,
  (val) => {
    if (val) {
      error.value = ''

      // Pre-fill date and time from booking's start_date
      if (props.booking?.start_date) {
        const startDate = new Date(props.booking.start_date)
        releasedDate.value = new CalendarDate(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          startDate.getDate(),
        )
        const hours = startDate.getHours().toString().padStart(2, '0')
        const minutes = startDate.getMinutes().toString().padStart(2, '0')
        releasedTime.value = `${hours}:${minutes}`

        // Set form.released_at immediately with correct format
        const year = startDate.getFullYear()
        const month = String(startDate.getMonth() + 1).padStart(2, '0')
        const day = String(startDate.getDate()).padStart(2, '0')
        form.value = {
          condition_notes: '',
          fuel_level: '',
          odometer: '',
          released_at: `${year}-${month}-${day} ${hours}:${minutes}:00`,
        }
      } else {
        releasedDate.value = null
        releasedTime.value = ''
        form.value = {
          condition_notes: '',
          fuel_level: '',
          odometer: '',
          released_at: '',
        }
      }
    }
  },
  { immediate: true },
)

watch([releasedDate, releasedTime], ([date, time]) => {
  if (date && time) {
    // Format as YYYY-MM-DD HH:mm:ss to avoid timezone conversion issues
    const year = date.year
    const month = String(date.month).padStart(2, '0')
    const day = String(date.day).padStart(2, '0')
    const [h, m] = time.split(':')
    form.value.released_at = `${year}-${month}-${day} ${h}:${m}:00`
  }
})

async function onSubmit() {
  loading.value = true
  try {
    await releaseVehicle.mutateAsync({
      bookingId: props.booking.id,
      ...form.value,
    })
    emit('released')
    emit('update:open', false)
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to release vehicle'
  } finally {
    loading.value = false
  }
}
</script>
