<template>
  <Dialog :open="open" @update:open="(val) => $emit('update:open', val)">
    <DialogContent class="max-h-[90vh] p-0">
      <DialogHeader class="px-6 pt-6">
        <DialogTitle>Submit Payment</DialogTitle>
        <DialogDescription>Upload your payment details to confirm your booking.</DialogDescription>
      </DialogHeader>
      <ScrollArea class="px-4 pb-4 max-h-[70vh]">
        <PaymentForm
          :booking-id="bookingId"
          :type="type"
          @submitted="handlePaid"
        >
          <template #submit-label>
            Submit Payment
          </template>
        </PaymentForm>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import PaymentForm from '@/components/features/bookings/PaymentForm.vue'

const props = defineProps({
  bookingId: { type: [String, Number], required: true },
  open: { type: Boolean, required: true },
  onClose: { type: Function, required: true },
  type: { type: String, default: 'deposit' }, // 'deposit' or 'rental'
})

const emit = defineEmits(['paid'])

function handlePaid() {
  emit('paid')
  props.onClose()
}
</script>

