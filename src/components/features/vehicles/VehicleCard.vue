<template>
  <div
    class="vehicle-card rounded-xl border bg-card text-card-foreground shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
  >
    <!-- Vehicle Image -->
    <div class="relative w-full aspect-video bg-muted">
      <img
        v-if="vehicle.primary_image_url"
        :src="vehicle.primary_image_url"
        :alt="vehicle.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <ImageIcon class="w-8 h-8 text-muted-foreground/50" />
      </div>
    </div>

    <div class="p-6">
      <div class="flex justify-between items-center min-h-[84px]">
        <div>
          <h3 class="text-2xl font-bold tracking-tight text-card-foreground">{{ vehicle.name }}</h3>
          <p class="text-sm text-muted-foreground mt-1">
            {{ vehicle.brand }} {{ vehicle.model }}
            <span class="text-muted-foreground/70">({{ vehicle.year }})</span>
          </p>
        </div>
        <Badge
          :variant="badgeVariant"
          class="px-3 py-1 rounded-full text-xs font-semibold shadow-sm uppercase tracking-wide"
          >{{ vehicle.status }}</Badge
        >
      </div>

      <div class="my-4 border-t border-border"></div>

      <p class="text-sm text-muted-foreground mb-4 line-clamp-2">
        {{ vehicle.description || 'No description available' }}
      </p>

      <div class="mt-4 flex justify-end">
        <Button variant="outline" class="w-full" @click="navigateToDetails">
          <Info class="w-4 h-4 mr-2" />
          View Details
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Info, ImageIcon } from 'lucide-vue-next'
import { getStatusVariant } from '@/lib/utils'

const router = useRouter()
const props = defineProps({
  vehicle: {
    type: Object,
    required: true,
  },
})

const vehicle = props.vehicle
const badgeVariant = computed(() => getStatusVariant(vehicle.status))

const navigateToDetails = () => {
  router.push({ name: 'vehicle-details', params: { id: vehicle.id } })
}
</script>
