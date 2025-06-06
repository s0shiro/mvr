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
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'

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
      form.value = {
        condition_notes: '',
        fuel_level: '',
        odometer: '',
        released_at: '',
      }
      releasedDate.value = null
      releasedTime.value = ''
      error.value = ''
    }
  },
)

watch([releasedDate, releasedTime], ([date, time]) => {
  if (date && time) {
    const d = date.toDate(getLocalTimeZone())
    const [h, m] = time.split(':')
    d.setHours(Number(h))
    d.setMinutes(Number(m))
    form.value.released_at = d.toISOString().slice(0, 16)
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
