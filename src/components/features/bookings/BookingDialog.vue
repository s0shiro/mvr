<template>
  <Dialog :open="open" @update:open="(val) => $emit('update:open', val)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader class="px-6 pt-6">
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>Fill out the form to book this vehicle.</DialogDescription>
      </DialogHeader>
      <form @submit.prevent="onSubmit" class="flex flex-col gap-6 px-6 pb-6">
        <div class="flex flex-col gap-2">
          <Label for="start_date">Start Date</Label>
          <Input type="datetime-local" v-model="form.start_date" id="start_date" required />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="end_date">End Date</Label>
          <Input type="datetime-local" v-model="form.end_date" id="end_date" required />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="notes">Notes</Label>
          <Textarea v-model="form.notes" id="notes" placeholder="Any special requests?" />
        </div>
        <div v-if="summary">
          <div class="flex items-center gap-2">
            <span class="font-semibold">Total Price:</span>
            <span class="text-primary">₱{{ summary.total_price }}</span>
            <span v-if="!summary.available" class="text-red-500"
              >(Not available for selected dates)</span
            >
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
import { useBookingSummary, useCreateBooking } from '@/services/booking-service'

const props = defineProps({
  vehicleId: { type: [String, Number], required: true },
  open: { type: Boolean, required: true },
  onClose: { type: Function, required: true },
})

const emit = defineEmits(['booked'])

const form = ref({
  start_date: '',
  end_date: '',
  notes: '',
})
const summary = ref(null)
const error = ref('')
const loading = ref(false)

const dialogTitle = computed(() => 'Book Vehicle')

const bookingSummary = useBookingSummary()
const createBooking = useCreateBooking()

watch(
  () => [form.value.start_date, form.value.end_date],
  async ([start, end]) => {
    if (start && end) {
      try {
        summary.value = await bookingSummary({
          vehicle_id: props.vehicleId,
          start_date: start,
          end_date: end,
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

async function onSubmit() {
  loading.value = true
  try {
    const res = await createBooking.mutateAsync({
      vehicle_id: props.vehicleId,
      ...form.value,
    })
    emit('booked', res.booking)
    onClose()
  } catch (e) {
    error.value = e.response?.data?.message || 'Booking failed'
  } finally {
    loading.value = false
  }
}
</script>
