<template>
  <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    <div class="bg-card rounded-lg shadow p-6 flex flex-col gap-2 transition-colors">
      <div class="text-lg mb-2 flex items-center gap-2">
        <lucide-icon name="Car" class="text-primary" />
        <span class="font-semibold">My Rentals</span>
      </div>
      <div class="text-base">
        <p class="text-muted-foreground">View your current and past rentals.</p>
        <!-- Placeholder for customer rentals -->
      </div>
    </div>
    <div class="bg-card rounded-lg shadow p-6 flex flex-col gap-2 transition-colors">
      <div class="text-lg mb-2 flex items-center gap-2">
        <lucide-icon name="CreditCard" class="text-primary" />
        <span class="font-semibold">Payments</span>
      </div>
      <div class="text-base">
        <p class="text-muted-foreground">Recent payments and outstanding balances.</p>
        <!-- Placeholder for payment info -->
      </div>
    </div>
    <div class="bg-card rounded-lg shadow p-6 flex flex-col gap-2 transition-colors">
      <div class="text-lg mb-2 flex items-center gap-2">
        <lucide-icon name="MessageCircle" class="text-primary" />
        <span class="font-semibold">Support</span>
      </div>
      <div class="text-base">
        <p class="text-muted-foreground">Contact support or view help topics.</p>
        <!-- Placeholder for support info -->
      </div>
    </div>
  </div>
</template>

<script setup>
// Placeholder for customer dashboard logic
// Import Lucide icon component if needed
</script>
