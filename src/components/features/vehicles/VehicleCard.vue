<template>
  <div
    class="vehicle-card rounded-xl border bg-card text-card-foreground shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
  >
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

      <div class="mt-4 space-y-3 bg-muted rounded-lg p-4">
        <div class="flex items-center gap-3">
          <span class="bg-accent rounded-full p-2"
            ><Users class="h-5 w-5 text-muted-foreground"
          /></span>
          <span class="font-medium text-card-foreground">{{ vehicle.capacity }} passengers</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="bg-accent rounded-full p-2"
            ><Tag class="h-5 w-5 text-muted-foreground"
          /></span>
          <span class="font-mono text-card-foreground">{{ vehicle.plate_number }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="bg-accent rounded-full p-2"
            ><DollarSign class="h-5 w-5 text-muted-foreground"
          /></span>
          <span class="font-semibold text-primary"
            >{{ formatCurrency(vehicle.rental_rate) }}
            <span class="text-xs text-muted-foreground font-normal">/ day</span></span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Users, Tag, DollarSign } from 'lucide-vue-next'
import { formatCurrency as _formatCurrency, getStatusVariant } from '@/lib/utils'

const props = defineProps({
  vehicle: {
    type: Object,
    required: true,
  },
})
const vehicle = props.vehicle

const formatCurrency = _formatCurrency

const badgeVariant = computed(() => getStatusVariant(vehicle.status))
</script>
