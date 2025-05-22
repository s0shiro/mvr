<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Payment Proof</DialogTitle>
        <DialogDescription>
          Payment proof image submitted {{ formatDate(paymentDate) }}
        </DialogDescription>
      </DialogHeader>
      <div class="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
        <div
          class="absolute inset-0 flex items-center justify-center"
          @mousedown="startPan"
          @mousemove="pan"
          @mouseup="stopPan"
          @mouseleave="stopPan"
          @touchstart="startPan"
          @touchmove="pan"
          @touchend="stopPan"
        >
          <img
            ref="image"
            :src="imageUrl"
            alt="Payment Proof"
            class="max-h-full max-w-full transition-transform duration-200 cursor-move"
            :style="{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              cursor: isPanning ? 'grabbing' : scale > 1 ? 'grab' : 'default',
            }"
            @dragstart.prevent
          />
        </div>
        <div class="absolute bottom-4 right-4 flex gap-2">
          <Button size="icon" variant="secondary" @click="zoomOut" :disabled="scale <= 1">
            <Minus class="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" @click="zoomIn" :disabled="scale >= 3">
            <Plus class="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            @click="resetView"
            :disabled="scale === 1 && !position.x && !position.y"
          >
            <RotateCcw class="h-4 w-4" />
          </Button>
        </div>
      </div>
      <DialogFooter>
        <Button @click="$emit('update:open', false)">Close</Button>
      </DialogFooter>
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Minus, Plus, RotateCcw } from 'lucide-vue-next'
import { ref, watch } from 'vue'

const scale = ref(1)
const position = ref({ x: 0, y: 0 })
const isPanning = ref(false)
const startPos = ref({ x: 0, y: 0 })
const image = ref(null)

function zoomIn() {
  if (scale.value < 3) {
    scale.value = Math.min(scale.value + 0.5, 3)
  }
}

function zoomOut() {
  if (scale.value > 1) {
    scale.value = Math.max(scale.value - 0.5, 1)
  }
}

function resetView() {
  scale.value = 1
  position.value = { x: 0, y: 0 }
}

// Reset position when zooming out to 1
watch(scale, (newScale) => {
  if (newScale === 1) {
    position.value = { x: 0, y: 0 }
  }
})

function getEventPos(event) {
  if (event.touches) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }
  return { x: event.clientX, y: event.clientY }
}

function startPan(event) {
  if (scale.value <= 1) return
  isPanning.value = true
  const pos = getEventPos(event)
  startPos.value = {
    x: pos.x - position.value.x,
    y: pos.y - position.value.y,
  }
}

function pan(event) {
  if (!isPanning.value) return
  event.preventDefault()
  const pos = getEventPos(event)
  const newX = pos.x - startPos.value.x
  const newY = pos.y - startPos.value.y

  // Calculate bounds to prevent dragging outside of visible area
  const bounds = {
    x: (image.value?.width * (scale.value - 1)) / 2 || 0,
    y: (image.value?.height * (scale.value - 1)) / 2 || 0,
  }

  position.value = {
    x: Math.max(-bounds.x, Math.min(bounds.x, newX)),
    y: Math.max(-bounds.y, Math.min(bounds.y, newY)),
  }
}

function stopPan() {
  isPanning.value = false
}

defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  paymentDate: {
    type: String,
    required: true,
  },
})

defineEmits(['update:open'])

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>
