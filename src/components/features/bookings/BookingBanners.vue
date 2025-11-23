<template>
  <div class="space-y-6">
    <div v-if="bookingsNeedingAttention.length" class="rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-sm" data-tour="attention-banner">
      <div class="flex flex-col sm:flex-row sm:items-start sm:gap-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck class="h-5 w-5" />
        </div>
        <div class="mt-3 sm:mt-0 space-y-2">
          <h2 class="text-base font-semibold text-primary">Complete your booking steps</h2>
          <p class="text-sm text-muted-foreground max-w-3xl">
            {{ bookingsNeedingAttention.length }}
            {{ bookingsNeedingAttention.length === 1 ? 'booking still needs action.' : 'bookings still need action.' }}
            Submit your security deposit first, then pay the rental fee whenever you're ready—no need to wait for deposit approval.
          </p>
        </div>
      </div>
    </div>
    <div v-if="bookingsNeedingRefundDetails.length" class="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-500/60 dark:bg-amber-950/30 p-5 shadow-sm" data-tour="refund-banner">
      <div class="flex flex-col sm:flex-row sm:items-start sm:gap-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-800/40 dark:text-amber-200">
          <Wallet class="h-5 w-5" />
        </div>
        <div class="mt-3 sm:mt-0 space-y-2">
          <h2 class="text-base font-semibold text-amber-700 dark:text-amber-200">Refund details needed</h2>
          <p class="text-sm text-muted-foreground max-w-3xl">
            {{
              bookingsNeedingRefundDetails.length === 1
                ? 'One cancelled booking still needs your refund account details so we can process your refund.'
                : `${bookingsNeedingRefundDetails.length} cancelled bookings still need your refund account details so we can process your refunds.`
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ShieldCheck, Wallet } from 'lucide-vue-next'
const props = defineProps({
  bookingsNeedingAttention: { type: Array, default: () => [] },
  bookingsNeedingRefundDetails: { type: Array, default: () => [] }
})
</script>
