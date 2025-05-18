<template>
  <div class="container mx-auto max-w-5xl">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="text-center text-red-600">
      {{ error.message }}
    </div>

    <div v-else-if="vehicle" class="space-y-8">
      <!-- Top section: Gallery and Main Info -->
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Image Gallery -->
        <div class="md:w-1/2 w-full">
          <div
            class="rounded-xl overflow-hidden shadow-lg bg-card flex flex-col border border-border"
          >
            <div
              class="w-full aspect-video bg-muted flex items-center justify-center min-h-[240px] max-h-[400px]"
            >
              <img
                v-if="mainImage"
                :src="mainImage"
                :alt="vehicle.name"
                class="object-cover w-full h-full min-h-[240px] max-h-[400px] bg-card"
              />
              <div
                v-else
                class="flex flex-col items-center justify-center w-full h-full text-muted-foreground min-h-[240px] max-h-[400px]"
              >
                <span class="text-4xl">🚗</span>
                <span class="mt-2">No image available</span>
              </div>
            </div>
            <!-- Thumbnails -->
            <div
              v-if="vehicle.images && vehicle.images.length > 1"
              class="flex gap-2 p-2 overflow-x-auto bg-card border-t border-border"
            >
              <img
                v-for="image in vehicle.images"
                :key="image.id"
                :src="image.image_url || image.url"
                :alt="vehicle.name"
                class="h-16 w-28 object-cover rounded cursor-pointer border-2 border-transparent hover:border-primary focus:border-primary transition-all duration-200 bg-muted min-w-[7rem] max-w-[7rem]"
                :class="{ 'ring-2 ring-primary': mainImage === (image.image_url || image.url) }"
                @click="selectedImage = image.image_url || image.url"
                tabindex="0"
              />
            </div>
          </div>
        </div>
        <!-- Main Info -->
        <div class="md:w-1/2 w-full flex flex-col justify-between gap-6">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-3xl font-bold text-card-foreground">{{ vehicle.name }}</h1>
              <Badge
                :variant="badgeVariant"
                class="px-3 py-1 rounded-full text-xs font-semibold shadow-sm uppercase tracking-wide"
              >
                {{ vehicle.status }}
              </Badge>
            </div>
            <div class="flex items-center gap-2 text-lg text-muted-foreground mb-2">
              <span>{{ vehicle.brand }}</span>
              <span>•</span>
              <span>{{ vehicle.model }}</span>
              <span>({{ vehicle.year }})</span>
            </div>
            <div class="flex items-center gap-2 text-base text-muted-foreground mb-2">
              <span class="capitalize">{{ vehicle.type }}</span>
              <span>•</span>
              <span>Plate: {{ vehicle.plate_number }}</span>
            </div>
            <div class="flex items-center gap-2 text-base text-muted-foreground mb-2">
              <span>Capacity: {{ vehicle.capacity }} person(s)</span>
              <span>•</span>
              <span class="font-semibold text-primary">₱{{ vehicle.rental_rate }}/day</span>
            </div>
          </div>
          <!-- Placeholder for Ratings -->
          <div class="flex items-center gap-2 mt-2">
            <span class="text-yellow-400 text-xl">★ ★ ★ ★ ☆</span>
            <span class="text-muted-foreground text-sm">(Coming soon)</span>
          </div>
          <!-- Book Now Button Placeholder -->
          <div class="mt-4">
            <button
              class="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow hover:bg-primary/90 transition-all border border-primary/30 opacity-80 hover:opacity-100"
              disabled
            >
              Book Now (Coming soon)
            </button>
          </div>
        </div>
      </div>

      <!-- Description & Specs -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card class="bg-card border border-border">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground text-base leading-relaxed">
              {{ vehicle.description || 'No description available' }}
            </p>
          </CardContent>
        </Card>
        <Card class="bg-card border border-border">
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <dl class="grid grid-cols-2 gap-4">
              <div>
                <dt class="font-medium">Brand</dt>
                <dd class="text-muted-foreground">{{ vehicle.brand }}</dd>
              </div>
              <div>
                <dt class="font-medium">Model</dt>
                <dd class="text-muted-foreground">{{ vehicle.model }}</dd>
              </div>
              <div>
                <dt class="font-medium">Year</dt>
                <dd class="text-muted-foreground">{{ vehicle.year }}</dd>
              </div>
              <div>
                <dt class="font-medium">Status</dt>
                <dd class="text-muted-foreground">{{ vehicle.status }}</dd>
              </div>
              <div>
                <dt class="font-medium">Type</dt>
                <dd class="text-muted-foreground">{{ vehicle.type }}</dd>
              </div>
              <div>
                <dt class="font-medium">Plate Number</dt>
                <dd class="text-muted-foreground">{{ vehicle.plate_number }}</dd>
              </div>
              <div>
                <dt class="font-medium">Capacity</dt>
                <dd class="text-muted-foreground">{{ vehicle.capacity }} person(s)</dd>
              </div>
              <div>
                <dt class="font-medium">Rental Rate</dt>
                <dd class="text-muted-foreground">₱{{ vehicle.rental_rate }}/day</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useVehicleDetails } from '@/services/vehicle-service'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getStatusVariant } from '@/lib/utils'

const route = useRoute()
const vehicleId = route.params.id
const { data, error, isLoading } = useVehicleDetails(vehicleId)

const vehicle = computed(() => data.value?.data || null)
const badgeVariant = computed(() => getStatusVariant(vehicle.value?.status || ''))

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
</script>
