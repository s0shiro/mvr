<template>
  <div class="dashboard-section">
    <h2 class="text-2xl font-bold mb-4">Recent Activity</h2>
    <div class="recent-lists grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Recent Bookings -->
      <div
        class="recent-card flex flex-col p-0 bg-card text-card-foreground rounded-2xl shadow border border-border relative overflow-hidden"
      >
        <div class="px-6 pt-6 pb-2 flex items-center gap-3 border-b border-border">
          <i class="i-lucide-calendar-check text-blue-500 text-2xl"></i>
          <h3 class="font-semibold text-lg">Recent Bookings</h3>
        </div>
        <ul class="flex-1 divide-y divide-border">
          <li
            v-for="b in bookings"
            :key="b.id"
            class="flex items-center gap-3 px-6 py-4 hover:bg-muted/60 transition group"
          >
            <i class="i-lucide-car text-blue-400 text-lg"></i>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="font-semibold text-base truncate">{{ b.user?.name || 'N/A' }}</span>
              <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span>{{
                  b.pickup_type
                    ? b.pickup_type.charAt(0).toUpperCase() + b.pickup_type.slice(1)
                    : 'N/A'
                }}</span>
                <span class="text-gray-400">• {{ b.days }} day{{ b.days === 1 ? '' : 's' }}</span>
                <span v-if="b.driver_requested" class="text-blue-500 font-medium">with Driver</span>
              </div>
            </div>
            <span
              class="ml-2 px-2 py-0.5 rounded text-xs font-bold border whitespace-nowrap"
              :class="statusClass(b.status)"
              >{{ b.status }}</span
            >
          </li>
        </ul>
      </div>
      <!-- Recent Payments -->
      <div
        class="recent-card flex flex-col p-0 bg-card text-card-foreground rounded-2xl shadow border border-border relative overflow-hidden"
      >
        <div class="px-6 pt-6 pb-2 flex items-center gap-3 border-b border-border">
          <i class="i-lucide-credit-card text-green-500 text-2xl"></i>
          <h3 class="font-semibold text-lg">Recent Payments</h3>
        </div>
        <ul class="flex-1 divide-y divide-border">
          <li
            v-for="p in payments"
            :key="p.id"
            class="flex items-center gap-3 px-6 py-4 hover:bg-muted/60 transition group"
          >
            <i class="i-lucide-receipt text-green-400 text-lg"></i>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="font-semibold text-base truncate">Booking #{{ p.booking_id }}</span>
              <span class="text-xs text-gray-500 mt-0.5 truncate">{{ p.method }}</span>
            </div>
            <span
              class="ml-2 px-2 py-0.5 rounded text-xs font-bold border whitespace-nowrap"
              :class="statusClass(p.status)"
              >{{ p.status }}</span
            >
          </li>
        </ul>
      </div>
      <!-- Recent Feedback -->
      <div
        class="recent-card flex flex-col p-0 bg-card text-card-foreground rounded-2xl shadow border border-border relative overflow-hidden"
      >
        <div class="px-6 pt-6 pb-2 flex items-center gap-3 border-b border-border">
          <i class="i-lucide-message-circle text-purple-500 text-2xl"></i>
          <h3 class="font-semibold text-lg">Recent Feedback</h3>
        </div>
        <ul class="flex-1 divide-y divide-border">
          <li
            v-for="f in feedback"
            :key="f.id"
            class="flex items-center gap-3 px-6 py-4 hover:bg-muted/60 transition group"
          >
            <i class="i-lucide-user text-purple-400 text-lg"></i>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="font-semibold text-base truncate">{{ f.user?.name || 'N/A' }}</span>
              <span class="text-xs text-gray-500 mt-0.5 truncate">{{
                f.comment || f.content || 'No comment'
              }}</span>
            </div>
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
      return 'bg-green-100 text-green-700 border-green-300'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case 'rented':
      return 'bg-blue-100 text-blue-700 border-blue-300'
    case 'destructive':
      return 'bg-red-100 text-red-700 border-red-300'
    case 'approved':
      return 'bg-green-100 text-green-700 border-green-300'
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-300'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case 'confirmed':
      return 'bg-green-100 text-green-700 border-green-300'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'
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
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-width: 220px;
  transition:
    background 0.2s,
    color 0.2s,
    box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--color-border);
}
.recent-card h3 {
  margin-top: 0;
}
</style>
