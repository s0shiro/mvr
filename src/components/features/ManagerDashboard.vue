<template>
  <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    <div class="bg-card rounded-lg shadow p-6 flex flex-col gap-2 transition-colors">
      <div class="text-lg mb-2 flex items-center gap-2">
        <lucide-icon name="ClipboardList" class="text-primary" />
        <span class="font-semibold">Bookings Overview</span>
      </div>
      <div class="text-base">
        <p class="text-muted-foreground">Total bookings, pending approvals, and cancellations.</p>
        <!-- Placeholder for manager stats -->
      </div>
    </div>
    <div class="bg-card rounded-lg shadow p-6 flex flex-col gap-2 transition-colors">
      <div class="text-lg mb-2 flex items-center gap-2">
        <lucide-icon name="Users" class="text-primary" />
        <span class="font-semibold">Team Activity</span>
      </div>
      <div class="text-base">
        <p class="text-muted-foreground">Recent actions by your team.</p>
        <!-- Placeholder for team activity -->
      </div>
    </div>
    <div class="bg-card rounded-lg shadow p-6 flex flex-col gap-2 transition-colors">
      <div class="text-lg mb-2 flex items-center gap-2">
        <lucide-icon name="AlertCircle" class="text-primary" />
        <span class="font-semibold">Alerts</span>
      </div>
      <div class="text-base">
        <p class="text-muted-foreground">Important notifications for managers.</p>
        <!-- Placeholder for alerts -->
      </div>
    </div>
  </div>
</template>

<script setup>
// Placeholder for manager dashboard logic
// Import Lucide icon component if needed
</script>
