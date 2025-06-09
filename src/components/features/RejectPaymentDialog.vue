<script setup>
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Loading from '../features/Loading.vue'

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
        <DialogTitle>Reject Payment</DialogTitle>
      </DialogHeader>
      <div class="py-2 text-sm text-muted-foreground">
        Are you sure you want to <span class="font-semibold text-destructive">reject</span> this
        <span class="font-semibold text-foreground">{{ paymentType }}</span> payment?
      </div>
      <DialogFooter>
        <Button variant="outline" @click="handleCancel" :disabled="loading">Cancel</Button>
        <Button variant="destructive" @click="handleConfirm" :disabled="loading">
          Yes, Reject
        </Button>
      </DialogFooter>
      <Loading v-if="loading" text="Rejecting payment..." :fullscreen="true" />
    </DialogContent>
  </Dialog>
</template>
