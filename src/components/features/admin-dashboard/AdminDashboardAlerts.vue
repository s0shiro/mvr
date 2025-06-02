<template>
  <div class="dashboard-section">
    <h2 class="text-2xl font-bold mb-4">Alerts</h2>
    <div class="alert-cards grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-if="alerts.overdue_returns > 0"
        class="alert-card bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 flex items-center gap-3 p-4 rounded-xl shadow"
      >
        <i class="i-lucide-alert-triangle text-yellow-600 text-2xl"></i>
        <div>
          <div class="font-semibold text-yellow-800 dark:text-yellow-200">Overdue Returns</div>
          <div class="text-lg font-bold">{{ alerts.overdue_returns }}</div>
        </div>
      </div>
      <div
        v-if="alerts.maintenance_due > 0"
        class="alert-card bg-orange-100 dark:bg-orange-900 border-l-4 border-orange-500 flex items-center gap-3 p-4 rounded-xl shadow"
      >
        <i class="i-lucide-wrench text-orange-600 text-2xl"></i>
        <div>
          <div class="font-semibold text-orange-800 dark:text-orange-200">
            Vehicles for Maintenance
          </div>
          <div class="text-lg font-bold">{{ alerts.maintenance_due }}</div>
        </div>
      </div>
      <div
        v-if="alerts.overdue_returns === 0 && alerts.maintenance_due === 0"
        class="alert-card bg-green-100 dark:bg-green-900 border-l-4 border-green-500 flex items-center gap-3 p-4 rounded-xl shadow"
      >
        <i class="i-lucide-badge-check text-green-600 text-2xl"></i>
        <div>
          <div class="font-semibold text-green-800 dark:text-green-200">No critical alerts</div>
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
.dashboard-section {
  margin-bottom: 2rem;
}
.alert-cards {
  margin-top: 1rem;
}
.alert-card {
  transition:
    background 0.2s,
    color 0.2s;
}
</style>
