<template>
  <div class="rounded-lg border bg-card p-4 shadow-sm transition hover:shadow-md">
    <div class="flex flex-col gap-4">
      <div class="relative overflow-hidden rounded-md bg-muted aspect-video">
        <img
          v-if="vehicle.primary_image_url"
          :src="vehicle.primary_image_url"
          :alt="vehicle.name"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center text-muted-foreground/60"
        >
          <ImageIcon class="h-12 w-12" />
        </div>
        <Badge
          :variant="statusVariant"
          class="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
        >
          {{ vehicle.status }}
        </Badge>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-lg font-semibold">{{ vehicle.name }}</h3>
          <span class="text-sm text-muted-foreground">Plate: {{ vehicle.plate_number }}</span>
        </div>
        <p class="text-sm text-muted-foreground">
          {{ vehicle.brand }} • {{ vehicle.model }} • {{ vehicle.year }}
        </p>
        <p v-if="vehicle.description" class="text-sm text-muted-foreground line-clamp-2">
          {{ vehicle.description }}
        </p>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-2">
      <Button variant="default" size="lg" class="w-full" @click="$emit('add-maintenance', vehicle)">
        Add Maintenance
      </Button>
      <Button variant="outline" size="lg" class="w-full" @click="$emit('view-history', vehicle)">
        View History
      </Button>
      <Button variant="secondary" size="lg" class="w-full" @click="navigateToDetails">
        View Details
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { ImageIcon } from 'lucide-vue-next'
import { getStatusVariant } from '@/lib/utils'

const props = defineProps({
  vehicle: {
    type: Object,
    required: true,
  },
})

defineEmits(['add-maintenance', 'view-history'])

const router = useRouter()
const vehicle = computed(() => props.vehicle)
const statusVariant = computed(() => getStatusVariant(vehicle.value.status))

function navigateToDetails() {
  router.push({ name: 'vehicle-details', params: { id: vehicle.value.id } })
}
</script>
