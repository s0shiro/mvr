<template>
  <div class="dashboard-section space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold tracking-tight">Alerts</h2>
      <span class="text-xs text-muted-foreground font-medium">System health summary</span>
    </div>
    <div class="alert-cards grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Overdue Returns -->
      <div
        v-if="alerts.overdue_returns > 0"
        class="alert-card flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500"
      >
        <div class="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
          <i class="i-lucide-alert-triangle text-yellow-600 text-xl"></i>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-muted-foreground">Overdue Returns</p>
          <p class="text-2xl font-bold tracking-tight">{{ alerts.overdue_returns }}</p>
        </div>
      </div>
      <!-- Maintenance Due -->
      <div
        v-if="alerts.maintenance_due > 0"
        class="alert-card flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500"
      >
        <div class="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
          <i class="i-lucide-wrench text-orange-600 text-xl"></i>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-muted-foreground">Vehicles for Maintenance</p>
          <p class="text-2xl font-bold tracking-tight">{{ alerts.maintenance_due }}</p>
        </div>
      </div>
      <!-- All Clear -->
      <div
        v-if="alerts.overdue_returns === 0 && alerts.maintenance_due === 0"
        class="alert-card flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500"
      >
        <div class="p-2 rounded-lg bg-green-100 dark:bg-green-900">
          <i class="i-lucide-badge-check text-green-600 text-xl"></i>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-muted-foreground">No critical alerts</p>
          <p class="text-xs text-muted-foreground">All systems nominal</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  alerts: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.dashboard-section { margin-bottom: 2rem; }
.alert-cards { margin-top: .5rem; }
.alert-card { transition: box-shadow .25s, background .25s, border-color .25s; }
</style>
