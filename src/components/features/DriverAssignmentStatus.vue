<template>
  <div v-if="driver">
    <div class="flex items-center gap-2">
      <span class="font-semibold">Assigned Driver:</span>
      <span>{{ driver.name }}</span>
      <span v-if="driver.phone" class="text-muted-foreground">({{ driver.phone }})</span>
      <span v-if="driver.email" class="text-muted-foreground">{{ driver.email }}</span>
    </div>
  </div>
  <div v-else>
    <span class="text-red-500 font-semibold">No driver assigned</span>
  </div>
</template>

<script setup>
const props = defineProps({
  driver: { type: Object, default: null },
})
</script>
