<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <AlertTriangle class="w-5 h-5 text-destructive" />
          {{ title }}
        </DialogTitle>
        <DialogDescription>
          {{ description }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="booking" class="space-y-3 py-4">
        <div class="bg-muted/50 rounded-lg p-3 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Customer:</span>
            <span class="font-medium">{{ booking.user?.name }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Vehicle:</span>
            <span class="font-medium">{{ booking.vehicle?.name }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Period:</span>
            <span class="font-medium">{{
              formatDateRange(booking.start_date, booking.end_date)
            }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Total:</span>
            <span class="font-medium">₱{{ booking.total_price }}</span>
          </div>
        </div>

        <div class="text-sm text-muted-foreground">
          <p class="mb-2">
            <strong>Note:</strong> The customer will be notified about this cancellation and refund
            information.
          </p>
        </div>
      </div>

      <DialogFooter class="gap-2">
        <Button variant="outline" @click="$emit('update:open', false)" :disabled="loading">
          Cancel
        </Button>
        <Button variant="destructive" @click="$emit('confirm')" :loading="loading">
          <Ban class="w-4 h-4 mr-2" />
          {{ confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Ban } from 'lucide-vue-next'

defineEmits(['update:open', 'confirm'])

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirm Cancellation',
  },
  description: {
    type: String,
    default: 'Are you sure you want to cancel this booking? This action cannot be undone.',
  },
  confirmText: {
    type: String,
    default: 'Cancel Booking',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  booking: {
    type: Object,
    default: null,
  },
})

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const formatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }

  const startStr = start.toLocaleDateString('en-US', formatOptions)
  const endStr = end.toLocaleDateString('en-US', formatOptions)

  return `${startStr} - ${endStr}`
}
</script>
