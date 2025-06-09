<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Booking Details</h1>
    <BookingDetailsFeature :booking-id="bookingId" :key="bookingId" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import BookingDetailsFeature from '@/components/features/bookings/BookingDetailsFeature.vue'

const route = useRoute()
const bookingId = ref(route.params.id)

watch(
  () => route.params.id,
  (newId) => {
    bookingId.value = newId
  },
)
</script>
