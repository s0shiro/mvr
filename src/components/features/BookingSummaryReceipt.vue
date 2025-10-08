<template>
  <div
    :class="[
      'fixed bottom-6 right-6 z-40 w-full max-w-xs md:max-w-sm bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl border border-border receipt-border animate-fade-in-up transition-all',
      minimized ? 'h-16 overflow-hidden p-2 cursor-pointer' : 'p-6',
    ]"
    style="box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15)"
    @click="minimized ? (minimized = !minimized) : null"
  >
    <div class="flex items-center justify-between mb-2">
      <span class="font-bold text-lg text-primary">Booking Summary</span>
      <button
        type="button"
        class="ml-2 text-xs text-muted-foreground hover:text-primary focus:outline-none"
        @click.stop="minimized = !minimized"
        :title="minimized ? 'Expand' : 'Minimize'"
      >
        <svg
          v-if="!minimized"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
    <template v-if="!minimized">
      <div class="border-b border-dashed border-border mb-3"></div>
      <div class="flex flex-col gap-2 text-sm">
        <div class="flex justify-between">
          <span>Daily Rate</span>
          <span class="font-semibold text-green-700 dark:text-green-300"
            >Php {{ summary.rental_rate }}</span
          >
        </div>
        <div
          class="flex justify-between"
          v-if="form.pickup_type === 'delivery' && form.delivery_location"
        >
          <span>Delivery Fee</span>
          <span class="font-semibold text-blue-700 dark:text-blue-300"
            >Php {{ summary.delivery_options?.delivery_fee || 0 }}</span
          >
        </div>
        <div class="flex justify-between">
          <span>Driver</span>
          <span>{{ summary.with_driver ? 'With Driver' : 'No Driver' }}</span>
        </div>
        <div class="flex justify-between">
          <span>Pickup Type</span>
          <span class="capitalize">{{ form.pickup_type }}</span>
        </div>
      </div>
      <div class="border-b border-dashed border-border my-3"></div>
      <div class="flex justify-between items-center text-lg font-extrabold mb-3">
        <span>Total</span>
        <span class="text-primary">Php {{ summary.total_price }}</span>
      </div>
      <div v-if="!summary.available" class="text-red-500 font-semibold mt-2 text-center text-sm">
        (Not available for selected dates)
      </div>
      <div
        v-if="summary.with_driver && summary.driver_available === false"
        class="text-red-500 font-semibold mt-2 text-center text-sm mb-3"
      >
        (No driver available for selected dates)
      </div>
      <Button 
        @click.stop="$emit('book-now')" 
        :disabled="!summary?.available || loading"
        class="w-full mt-2"
        size="lg"
      >
        <span v-if="loading" class="flex items-center justify-center">
          <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            ></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          Processing...
        </span>
        <span v-else>Book Now</span>
      </Button>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps({
  summary: { type: Object, required: true },
  form: { type: Object, required: true },
  minimized: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['update:minimized', 'book-now'])
const minimized = ref(props.minimized)
watch(minimized, (v) => emit('update:minimized', v))
</script>

<style scoped>
.receipt-border {
  border-image-source: linear-gradient(
    90deg,
    rgba(156, 163, 175, 0.5) 0%,
    rgba(156, 163, 175, 0.5) 100%
  );
  border-image-slice: 1;
}
</style>
