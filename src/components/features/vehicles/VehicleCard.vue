<template>
  <div class="vehicle-card rounded-lg border bg-card text-card-foreground shadow-sm">
    <div class="p-6">
      <div class="flex justify-between">
        <div>
          <h3 class="text-2xl font-semibold">{{ vehicle.name }}</h3>
          <p class="text-sm text-muted-foreground">
            {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})
          </p>
        </div>
        <Badge :variant="getStatusVariant">{{ vehicle.status }}</Badge>
      </div>

      <div class="mt-4 space-y-2">
        <div class="flex items-center gap-2">
          <Users class="h-4 w-4" />
          <span>{{ vehicle.capacity }} passengers</span>
        </div>
        <div class="flex items-center gap-2">
          <Tag class="h-4 w-4" />
          <span>{{ vehicle.plate_number }}</span>
        </div>
        <div class="flex items-center gap-2">
          <DollarSign class="h-4 w-4" />
          <span>{{ formatCurrency(vehicle.rental_rate) }} / day</span>
        </div>
      </div>

      <p v-if="vehicle.description" class="mt-4 text-sm text-muted-foreground">
        {{ vehicle.description }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Users, Tag, DollarSign } from 'lucide-vue-next'
import { formatCurrency as _formatCurrency } from '@/lib/utils'

const props = defineProps({
  vehicle: {
    type: Object,
    required: true,
  },
})
const vehicle = props.vehicle

const formatCurrency = _formatCurrency

const getStatusVariant = computed(() => {
  switch (vehicle.status) {
    case 'available':
      return 'success'
    case 'maintenance':
      return 'warning'
    case 'rented':
      return 'secondary'
    default:
      return 'default'
  }
})
</script>
