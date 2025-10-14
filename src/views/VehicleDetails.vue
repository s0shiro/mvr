<template>
  <div class="container mx-auto max-w-5xl">
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading vehicle..." />
    </div>
    <div v-else-if="error" class="text-center text-red-600">
      {{ error.message }}
    </div>
    <div v-else-if="vehicle">
      <VehicleDetailsContent
        :vehicle="vehicle"
        :badge-variant="badgeVariant"
        :can-request-driver="canRequestDriver"
        :is-admin-or-manager="isAdminOrManager"
        :main-image="mainImage"
        :feedback-list="feedbackList"
        :feedback-loading="feedbackLoading"
        :average-rating="averageRating"
        :format-currency="formatCurrency"
        :book-disabled="bookDisabled"
        @select-image="handleSelectImage"
        @book="handleBook"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVehicleDetails } from '@/services/vehicle-service'
import Loading from '@/components/features/Loading.vue'
import VehicleDetailsContent from '@/components/features/vehicles/VehicleDetailsContent.vue'
import { getStatusVariant } from '@/lib/utils'
import { useUserAuth } from '@/services/useUserAuth'
import { useVehicleFeedbackQuery } from '@/services/feedback-api'

const route = useRoute()
const router = useRouter()
const vehicleId = route.params.id
const { data, error, isLoading } = useVehicleDetails(vehicleId)

const vehicle = computed(() => data.value?.data || null)
const badgeVariant = computed(() => getStatusVariant(vehicle.value?.status || ''))
const canRequestDriver = computed(() => {
  const type = vehicle.value?.type
  return (type ? type.toLowerCase() : '') !== 'motorcycle'
})

// For gallery selection
const selectedImage = ref(null)

// Main image logic: selectedImage, else first image, else primary_image_url
const mainImage = computed(() => {
  if (selectedImage.value) return selectedImage.value
  if (vehicle.value?.images && vehicle.value.images.length > 0) {
    return vehicle.value.images[0].image_url || vehicle.value.images[0].url
  }
  return vehicle.value?.primary_image_url || null
})

watch(
  () => vehicle.value?.id,
  () => {
    selectedImage.value = null
  },
)

// Admin edit button logic
const userAuth = useUserAuth()
const isAdminOrManager = computed(() => userAuth.isAdmin() || userAuth.isManager())

const booking = computed(() => {
  const currentVehicle = vehicle.value
  if (!currentVehicle) return null
  return currentVehicle.booking || currentVehicle.current_booking || null
})

const bookUrl = computed(() => `/book/${vehicleId}`)

const bookDisabled = computed(() => {
  const status = booking.value?.status
  return isAdminOrManager.value || status === 'pending' || status === 'paid'
})

const handleSelectImage = (imageUrl) => {
  selectedImage.value = imageUrl
}

const handleBook = () => {
  router.push({ path: bookUrl.value })
}

const { data: feedbackData, isLoading: feedbackLoading } = useVehicleFeedbackQuery(vehicleId)
const feedbackList = computed(() => (Array.isArray(feedbackData.value) ? feedbackData.value : []))
const averageRating = computed(() => {
  if (!feedbackList.value.length) return 0
  const sum = feedbackList.value.reduce((acc, f) => acc + (f.rating || 0), 0)
  return (sum / feedbackList.value.length).toFixed(1)
})

const formatCurrency = (value) => {
  const numericValue = Number(value ?? 0)
  return numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
