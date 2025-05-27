<script setup>
import { ref } from 'vue'
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
        <DialogTitle>Confirm Logout</DialogTitle>
      </DialogHeader>
      <div class="py-2 text-sm text-muted-foreground">Are you sure you want to log out?</div>
      <DialogFooter>
        <Button variant="outline" @click="handleCancel" :disabled="loading">Cancel</Button>
        <Button variant="destructive" @click="handleConfirm" :disabled="loading">
          Yes, Log Out
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
