<template>
  <Dialog :open="openLocal" @update:open="onDialogUpdate">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Sale Details</DialogTitle>
      </DialogHeader>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-2">
          <div class="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon class="w-4 h-4" /> Date
          </div>
          <div class="font-medium">{{ sale.date || '-' }}</div>
          <div class="flex items-center gap-2 text-muted-foreground">
            <CoinsIcon class="w-4 h-4" /> Amount
          </div>
          <div class="font-medium">
            ₱{{ sale.amount !== null ? sale.amount.toLocaleString() : '-' }}
          </div>
          <div class="flex items-center gap-2 text-muted-foreground">
            <TagIcon class="w-4 h-4" /> Type
          </div>
          <div class="font-medium capitalize">{{ sale.type }}</div>
          <div class="flex items-center gap-2 text-muted-foreground">
            <StickyNoteIcon class="w-4 h-4" /> Note
          </div>
          <div class="font-medium">{{ sale.note || '-' }}</div>
        </div>
        <div v-if="businessType === 'photography'">
          <div v-if="sale.details?.eventType" class="flex justify-between items-center">
            <span class="flex items-center gap-2 text-muted-foreground"
              ><CameraIcon class="w-4 h-4" /> Event</span
            >
            <span class="font-medium">{{ sale.details.eventType }}</span>
          </div>
          <div v-if="sale.details?.clientName" class="flex justify-between items-center">
            <span class="flex items-center gap-2 text-muted-foreground"
              ><UserIcon class="w-4 h-4" /> Client</span
            >
            <span class="font-medium">{{ sale.details.clientName }}</span>
          </div>
          <div v-if="sale.details?.eventDate" class="flex justify-between items-center">
            <span class="flex items-center gap-2 text-muted-foreground"
              ><CalendarDaysIcon class="w-4 h-4" /> Event Date</span
            >
            <span class="font-medium">{{ sale.details.eventDate }}</span>
          </div>
        </div>
        <div v-else-if="businessType === 'resort'">
          <div v-if="sale.details?.roomNumber" class="flex justify-between items-center">
            <span class="flex items-center gap-2 text-muted-foreground"
              ><BedDoubleIcon class="w-4 h-4" /> Room</span
            >
            <span class="font-medium">{{ sale.details.roomNumber }}</span>
          </div>
          <div v-if="sale.details?.guestName" class="flex justify-between items-center">
            <span class="flex items-center gap-2 text-muted-foreground"
              ><UserIcon class="w-4 h-4" /> Guest</span
            >
            <span class="font-medium">{{ sale.details.guestName }}</span>
          </div>
        </div>
      </div>
      <div class="flex justify-end pt-4">
        <Button type="button" variant="secondary" @click="close">Close</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Calendar as CalendarIcon,
  Coins as CoinsIcon,
  Tag as TagIcon,
  StickyNote as StickyNoteIcon,
  Camera as CameraIcon,
  User as UserIcon,
  CalendarDays as CalendarDaysIcon,
  BedDouble as BedDoubleIcon,
} from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  sale: { type: Object, required: true },
  businessType: { type: String, default: 'resort' },
})
const emit = defineEmits(['close', 'update:open'])

const openLocal = ref(props.open)
watch(
  () => props.open,
  (val) => {
    openLocal.value = val
  },
)

function close() {
  openLocal.value = false
  emit('update:open', false)
  emit('close')
}
function onDialogUpdate(val) {
  openLocal.value = val
  if (!val) emit('close')
  emit('update:open', val)
}
</script>
