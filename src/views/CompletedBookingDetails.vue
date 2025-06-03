<template>
  <div class="">
    <div v-if="isLoading" class="flex items-center gap-2 text-muted-foreground py-8 justify-center">
      <Loader2 class="animate-spin" /> Loading details...
    </div>
    <div v-else-if="isError" class="text-destructive flex items-center gap-2 py-8 justify-center">
      <XCircle />
      <span>Failed to load booking details.</span>
      <button class="ml-2 underline" @click="refetch">Retry</button>
    </div>
    <div v-else-if="!details" class="text-muted-foreground py-8 text-center">No details found.</div>
    <div v-else>
      <CompletedBookingSummary :details="details" />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useCompletedBookingDetailsQuery } from '@/services/completed-bookings-api'
import { Loader2, XCircle } from 'lucide-vue-next'
import CompletedBookingSummary from '@/components/features/CompletedBookingSummary.vue'
import { computed } from 'vue'

const route = useRoute()
const bookingId = route.params.id
const { data, isLoading, isError, refetch } = useCompletedBookingDetailsQuery(bookingId)
const details = computed(() => data.value?.completed_booking_summary)
</script>
