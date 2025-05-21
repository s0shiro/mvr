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
            <input
              id="start_date"
              type="datetime-local"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              v-model="startDate"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="end_date">End Date</Label>
            <input
              id="end_date"
              type="datetime-local"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              v-model="endDate"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="notes">Notes</Label>
            <Textarea id="notes" v-model="notes" placeholder="Any special requirements or notes" />
          </div>
          <div v-if="hasChanges && startDate && endDate" class="mt-2">
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
          :disabled="isSubmitting || !hasChanges || !isValidForm || !summary?.available"
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
import { ref, onMounted, computed, watch } from 'vue'
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
import { useUpdateBooking, useBookingSummary } from '@/services/booking-service'
import { toast } from 'vue-sonner'

const props = defineProps({
  open: Boolean,
  booking: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:open', 'updated'])

// Form state
const startDate = ref('')
const endDate = ref('')
const notes = ref('')
const isSubmitting = ref(false)

// Initialize form with booking data
onMounted(() => {
  if (props.booking) {
    startDate.value = new Date(props.booking.start_date).toISOString().slice(0, 16)
    endDate.value = new Date(props.booking.end_date).toISOString().slice(0, 16)
    notes.value = props.booking.notes || ''
  }
})

// Check if form has any changes
const hasChanges = computed(() => {
  const originalStartDate = new Date(props.booking.start_date).toISOString().slice(0, 16)
  const originalEndDate = new Date(props.booking.end_date).toISOString().slice(0, 16)

  return (
    startDate.value !== originalStartDate ||
    endDate.value !== originalEndDate ||
    notes.value !== (props.booking.notes || '')
  )
})

// Form validation
const isValidForm = computed(() => {
  if (!startDate.value || !endDate.value) return false
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const now = new Date()

  return start > now && end > start
})

const updateBooking = useUpdateBooking()
const bookingSummary = useBookingSummary()
const summary = ref(null)
const error = ref('')

// Watch for date changes to check availability
watch(
  () => [startDate.value, endDate.value],
  async ([start, end]) => {
    if (start && end && hasChanges.value) {
      try {
        summary.value = await bookingSummary({
          vehicle_id: props.booking.vehicle_id,
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

async function handleSubmit() {
  if (!isValidForm.value || !summary.value?.available) return

  isSubmitting.value = true
  try {
    await updateBooking.mutateAsync({
      bookingId: props.booking.id,
      start_date: startDate.value,
      end_date: endDate.value,
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
