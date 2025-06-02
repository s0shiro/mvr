<template>
  <div class="dashboard-section">
    <h2 class="text-2xl font-bold mb-4">Recent Activity</h2>
    <div class="recent-lists grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="recent-card flex flex-col p-5">
        <div class="flex items-center gap-2 mb-4">
          <i class="i-lucide-calendar-check text-blue-500 text-2xl"></i>
          <h3 class="font-semibold text-lg">Recent Bookings</h3>
        </div>
        <ul class="flex-1 space-y-2">
          <li
            v-for="b in bookings"
            :key="b.id"
            class="flex items-center gap-2 bg-muted/50 dark:bg-muted/20 rounded-lg px-3 py-2"
          >
            <i class="i-lucide-car text-gray-400"></i>
            <span class="font-medium">{{ b.user?.name || 'N/A' }}</span>
            <span class="text-gray-500"
              >- {{ b.vehicle?.id ? 'Vehicle #' + b.vehicle.id : 'N/A' }}</span
            >
            <span
              class="ml-auto px-2 py-0.5 rounded text-xs font-semibold"
              :class="statusClass(b.status)"
              >{{ b.status }}</span
            >
          </li>
        </ul>
      </div>
      <div class="recent-card flex flex-col p-5">
        <div class="flex items-center gap-2 mb-4">
          <i class="i-lucide-credit-card text-green-500 text-2xl"></i>
          <h3 class="font-semibold text-lg">Recent Payments</h3>
        </div>
        <ul class="flex-1 space-y-2">
          <li
            v-for="p in payments"
            :key="p.id"
            class="flex items-center gap-2 bg-muted/50 dark:bg-muted/20 rounded-lg px-3 py-2"
          >
            <i class="i-lucide-receipt text-gray-400"></i>
            <span>Booking #{{ p.booking_id }}</span>
            <span class="text-gray-500">- {{ p.method }}</span>
            <span
              class="ml-auto px-2 py-0.5 rounded text-xs font-semibold"
              :class="statusClass(p.status)"
              >{{ p.status }}</span
            >
          </li>
        </ul>
      </div>
      <div class="recent-card flex flex-col p-5">
        <div class="flex items-center gap-2 mb-4">
          <i class="i-lucide-message-circle text-purple-500 text-2xl"></i>
          <h3 class="font-semibold text-lg">Recent Feedback</h3>
        </div>
        <ul class="flex-1 space-y-2">
          <li
            v-for="f in feedback"
            :key="f.id"
            class="flex items-center gap-2 bg-muted/50 dark:bg-muted/20 rounded-lg px-3 py-2"
          >
            <i class="i-lucide-user text-gray-400"></i>
            <span class="font-medium">{{ f.user?.name || 'N/A' }}</span>
            <span class="text-gray-500">: {{ f.comment || f.content || 'No comment' }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getStatusVariant } from '@/lib/utils'

const props = defineProps({
  bookings: Array,
  payments: Array,
  feedback: Array,
})

function statusClass(status) {
  const variant = getStatusVariant(status)
  switch (variant) {
    case 'available':
      return 'bg-green-100 text-green-700'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-700'
    case 'rented':
      return 'bg-blue-100 text-blue-700'
    case 'destructive':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}
</script>

<style scoped>
.dashboard-section {
  margin-bottom: 2rem;
}
.recent-lists {
  margin-top: 1rem;
}
.recent-card {
  background: var(--color-card);
  color: var(--color-card-foreground);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-width: 220px;
  transition:
    background 0.2s,
    color 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.recent-card h3 {
  margin-top: 0;
}
</style>
