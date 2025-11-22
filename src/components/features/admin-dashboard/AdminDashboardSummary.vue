<template>
  <div class="dashboard-summary">
    <div
      class="summary-bento-grid grid grid-cols-1 md:grid-cols-3 grid-rows-3 md:grid-rows-2 gap-6"
    >
      <div
        class="summary-card bento-vehicles flex flex-col justify-center items-center p-6 bg-card text-card-foreground rounded-2xl border relative overflow-hidden col-span-1 md:col-span-2 row-span-1 md:row-span-2 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500"
      >
        <!-- Watermark Icon -->
        <LucideCar
          class="absolute right-4 bottom-4 opacity-10 text-blue-400 w-32 h-32 pointer-events-none select-none hidden md:block"
        />
        <div class="flex flex-col items-center z-10">
          <div class="flex items-center gap-3 mb-4">
            <LucideCar class="text-blue-500 w-10 h-10 md:w-14 md:h-14" />
            <div>
              <div class="text-4xl md:text-5xl font-extrabold">{{ summary.vehicles.total }}</div>
              <div class="text-muted-foreground text-lg md:text-xl font-medium">Total Vehicles</div>
            </div>
          </div>
          <div class="flex gap-8 mt-4">
            <div class="flex flex-col items-center">
              <span class="text-green-600 font-bold text-xl">{{ summary.vehicles.available }}</span>
              <span class="text-xs text-muted-foreground">Available</span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-blue-600 font-bold text-xl">{{ summary.vehicles.rented }}</span>
              <span class="text-xs text-muted-foreground">Rented</span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-yellow-600 font-bold text-xl">{{
                summary.vehicles.maintenance
              }}</span>
              <span class="text-xs text-muted-foreground">Maintenance</span>
            </div>
          </div>
        </div>
      </div>
      <div
        class="summary-card bento-bookings flex flex-col p-6 bg-card text-card-foreground rounded-2xl border relative overflow-hidden col-span-1 md:col-span-1 row-span-1 hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500"
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
      <div
        v-if="summary.users"
        class="summary-card bento-users flex flex-col p-6 bg-card text-card-foreground rounded-2xl border relative overflow-hidden col-span-1 md:col-span-1 row-span-1 hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500"
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
        class="summary-card bento-revenue flex flex-col p-6 bg-card text-card-foreground rounded-2xl border relative overflow-hidden col-span-1 md:col-span-1 row-span-1 hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500"
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
      <div
        class="summary-card bento-pending flex flex-col justify-center items-center p-6 bg-card text-card-foreground rounded-2xl border relative overflow-hidden col-span-1 md:col-span-2 row-span-1 hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500"
      >
        <!-- Watermark Icon -->
        <LucideClock
          class="absolute right-4 bottom-4 opacity-10 text-orange-400 w-32 h-32 pointer-events-none select-none hidden md:block"
        />
        <div class="flex flex-col items-center z-10">
          <div class="flex items-center gap-3 mb-4">
            <LucideClock class="text-orange-500 w-10 h-10 md:w-14 md:h-14" />
            <div>
              <div class="text-4xl md:text-5xl font-extrabold">{{ summary.pending.bookings }}</div>
              <div class="text-muted-foreground text-lg md:text-xl font-medium">
                Pending Bookings
              </div>
            </div>
          </div>
          <div class="flex gap-8 mt-4">
            <div class="flex flex-col items-center">
              <span class="text-yellow-600 font-bold text-xl">{{ summary.pending.refunds }}</span>
              <span class="text-xs text-muted-foreground">Refunds</span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-blue-600 font-bold text-xl">{{
                summary.pending.vehicles_to_release
              }}</span>
              <span class="text-xs text-muted-foreground">To Release</span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-green-600 font-bold text-xl">{{
                summary.pending.vehicles_to_return
              }}</span>
              <span class="text-xs text-muted-foreground">To Return</span>
            </div>
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
.summary-bento-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-template-rows: repeat(5, minmax(0, 1fr));
  gap: 1.5rem;
}
@media (min-width: 768px) {
  .summary-bento-grid {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, minmax(0, 1fr));
  }
  .bento-vehicles {
    grid-column: span 2 / span 2;
    grid-row: span 2 / span 2;
  }
  .bento-pending {
    grid-column: span 2 / span 2;
  }
}
.summary-card { min-width: 220px; }
.summary-card h3 {
  margin-top: 0;
}
</style>
