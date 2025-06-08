<template>
  <div class="dashboard-summary">
    <div class="summary-cards grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <div
        class="summary-card flex flex-col p-6 bg-card text-card-foreground rounded-2xl shadow border border-border relative overflow-hidden"
      >
        <div class="flex items-center gap-3 mb-4">
          <LucideCar class="text-blue-500 w-7 h-7" />
          <div>
            <div class="text-2xl font-bold">{{ summary.vehicles.total }}</div>
            <div class="text-muted-foreground text-sm">Total Vehicles</div>
          </div>
        </div>
        <div class="flex gap-4 mt-2">
          <div class="flex flex-col items-center">
            <span class="text-green-600 font-semibold">{{ summary.vehicles.available }}</span>
            <span class="text-xs text-muted-foreground">Available</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-blue-600 font-semibold">{{ summary.vehicles.rented }}</span>
            <span class="text-xs text-muted-foreground">Rented</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-yellow-600 font-semibold">{{ summary.vehicles.maintenance }}</span>
            <span class="text-xs text-muted-foreground">Maintenance</span>
          </div>
        </div>
      </div>
      <div
        class="summary-card flex flex-col p-6 bg-card text-card-foreground rounded-2xl shadow border border-border relative overflow-hidden"
      >
        <div class="flex items-center gap-3 mb-4">
          <LucideCalendarDays class="text-green-500 w-7 h-7" />
          <div>
            <div class="text-2xl font-bold">{{ summary.bookings.total }}</div>
            <div class="text-muted-foreground text-sm">Total Bookings</div>
          </div>
        </div>
        <div class="flex gap-4 mt-2">
          <div class="flex flex-col items-center">
            <span class="text-blue-600 font-semibold">{{ summary.bookings.active }}</span>
            <span class="text-xs text-muted-foreground">Active</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-green-600 font-semibold">{{ summary.bookings.completed }}</span>
            <span class="text-xs text-muted-foreground">Completed</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-red-600 font-semibold">{{ summary.bookings.cancelled }}</span>
            <span class="text-xs text-muted-foreground">Cancelled</span>
          </div>
        </div>
      </div>
      <!-- Users summary card - only shown for admin -->
      <div
        v-if="summary.users"
        class="summary-card flex flex-col p-6 bg-card text-card-foreground rounded-2xl shadow border border-border relative overflow-hidden"
      >
        <div class="flex items-center gap-3 mb-4">
          <LucideUsers class="text-purple-500 w-7 h-7" />
          <div>
            <div class="text-2xl font-bold">{{ summary.users.total }}</div>
            <div class="text-muted-foreground text-sm">Total Users</div>
          </div>
        </div>
        <div class="flex gap-4 mt-2">
          <div class="flex flex-col items-center">
            <span class="text-blue-600 font-semibold">{{ summary.users.customers }}</span>
            <span class="text-xs text-muted-foreground">Customers</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-orange-600 font-semibold">{{ summary.users.manager }}</span>
            <span class="text-xs text-muted-foreground">Managers</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-green-600 font-semibold">{{ summary.users.admins }}</span>
            <span class="text-xs text-muted-foreground">Admins</span>
          </div>
        </div>
      </div>
      <div
        class="summary-card flex flex-col p-6 bg-card text-card-foreground rounded-2xl shadow border border-border relative overflow-hidden"
      >
        <div class="flex items-center gap-3 mb-4">
          <LucideCoins class="text-yellow-500 w-7 h-7" />
          <div>
            <div class="text-2xl font-bold">₱{{ summary.revenue.today }}</div>
            <div class="text-muted-foreground text-sm">Revenue Today</div>
          </div>
        </div>
        <div class="flex gap-4 mt-2">
          <div class="flex flex-col items-center">
            <span class="text-green-600 font-semibold">₱{{ summary.revenue.week }}</span>
            <span class="text-xs text-muted-foreground">This Week</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-blue-600 font-semibold">₱{{ summary.revenue.month }}</span>
            <span class="text-xs text-muted-foreground">This Month</span>
          </div>
        </div>
      </div>
    </div>
    <div class="summary-cards grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 mt-6">
      <div
        class="summary-card flex flex-col p-6 bg-card text-card-foreground rounded-2xl shadow border border-border relative overflow-hidden"
      >
        <div class="flex items-center gap-3 mb-4">
          <LucideClock class="text-orange-500 w-7 h-7" />
          <div>
            <div class="text-2xl font-bold">{{ summary.pending.bookings }}</div>
            <div class="text-muted-foreground text-sm">Pending Bookings</div>
          </div>
        </div>
        <div class="flex gap-4 mt-2">
          <div class="flex flex-col items-center">
            <span class="text-yellow-600 font-semibold">{{ summary.pending.refunds }}</span>
            <span class="text-xs text-muted-foreground">Refunds</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-blue-600 font-semibold">{{
              summary.pending.vehicles_to_release
            }}</span>
            <span class="text-xs text-muted-foreground">To Release</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-green-600 font-semibold">{{
              summary.pending.vehicles_to_return
            }}</span>
            <span class="text-xs text-muted-foreground">To Return</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  LucideCar,
  LucideCalendarDays,
  LucideUsers,
  LucideCoins,
  LucideClock,
} from 'lucide-vue-next'
const props = defineProps({
  summary: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.dashboard-summary {
  margin-bottom: 2rem;
}
.summary-cards {
  margin-top: 1rem;
}
.summary-card {
  background: var(--color-card);
  color: var(--color-card-foreground);
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-width: 220px;
  transition:
    background 0.2s,
    color 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--color-border);
}
.summary-card h3 {
  margin-top: 0;
}
</style>
