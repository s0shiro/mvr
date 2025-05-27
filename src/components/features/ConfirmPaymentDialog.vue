<script setup>
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

defineProps({
  open: Boolean,
  loading: Boolean,
  paymentType: String,
})
const emit = defineEmits(['update:open', 'confirm'])

const handleCancel = () => {
  emit('update:open', false)
}
const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Payment</DialogTitle>
      </DialogHeader>
      <div class="py-2 text-sm text-muted-foreground">
        Are you sure you want to confirm this
        <span class="font-semibold text-foreground">{{ paymentType }}</span> payment?
      </div>
      <DialogFooter>
        <Button variant="outline" @click="handleCancel" :disabled="loading">Cancel</Button>
        <Button variant="success" @click="handleConfirm" :disabled="loading"> Yes, Confirm </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
