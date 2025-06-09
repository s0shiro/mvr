<template>
  <div class="container mx-auto max-w-5xl">
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading vehicle..." />
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
            class="rounded-2xl overflow-hidden shadow-xl bg-card flex flex-col border border-border relative group"
          >
            <!-- Floating Edit Button for Admins -->
            <RouterLink
              v-if="userAuth.isAdmin()"
              :to="{ name: 'vehicle-edit', params: { id: vehicle.id } }"
              class="absolute top-4 right-4 z-10"
              title="Edit Vehicle"
            >
              <Button variant="ghost" size="icon" class="bg-white/80 hover:bg-primary/10 shadow-lg rounded-full border border-primary/20">
                <SquarePen class="w-5 h-5 text-primary" />
                <span class="sr-only">Edit Vehicle</span>
              </Button>
            </RouterLink>
            <div
              class="w-full aspect-video bg-muted flex items-center justify-center min-h-[240px] max-h-[400px] relative"
            >
              <img
                v-if="mainImage"
                :src="mainImage"
                :alt="vehicle.name"
                class="object-cover w-full h-full min-h-[240px] max-h-[400px] bg-card transition-transform duration-300 group-hover:scale-105"
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
              class="flex gap-2 p-3 overflow-x-auto bg-card border-t border-border"
            >
              <img
                v-for="image in vehicle.images"
                :key="image.id"
                :src="image.image_url || image.url"
                :alt="vehicle.name"
                class="h-16 w-28 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-primary focus:border-primary transition-all duration-200 bg-muted min-w-[7rem] max-w-[7rem] shadow-sm hover:shadow-md"
                :class="{ 'ring-2 ring-primary': mainImage === (image.image_url || image.url) }"
                @click="selectedImage = image.image_url || image.url"
                tabindex="0"
              />
            </div>
          </div>
        </div>
        <!-- Main Info -->
        <div class="md:w-1/2 w-full flex flex-col justify-between gap-8 py-2">
          <div>
            <div class="flex flex-col gap-2 mb-4">
              <div class="flex items-center gap-3">
                <h1 class="text-4xl font-extrabold text-card-foreground leading-tight">{{ vehicle.name }}</h1>
                <Badge
                  :variant="badgeVariant"
                  class="px-4 py-1 rounded-full text-sm font-semibold shadow-sm uppercase tracking-wide"
                >
                  {{ vehicle.status }}
                </Badge>
              </div>
              <div class="flex items-center gap-3 text-lg text-muted-foreground">
                <span class="font-medium">{{ vehicle.brand }}</span>
                <span>•</span>
                <span>{{ vehicle.model }}</span>
                <span>({{ vehicle.year }})</span>
              </div>
              <div class="flex items-center gap-3 text-base text-muted-foreground">
                <span class="capitalize">{{ vehicle.type }}</span>
                <span>•</span>
                <span>Plate: {{ vehicle.plate_number }}</span>
              </div>
            </div>
            <div class="flex flex-col gap-3 text-base text-muted-foreground mb-2">
              <div class="flex items-center gap-2">
                <span>Capacity: <span class="font-semibold text-foreground">{{ vehicle.capacity }}</span> person(s)</span>
                <span>•</span>
                <span class="font-semibold text-primary text-lg">Php {{ Number(vehicle.rental_rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/day</span>
              </div>
              <template v-if="vehicle.rental_rate_with_driver">
                <div class="flex items-center gap-2 pl-1">
                  <span class="inline-block w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center mr-1">
                    <User2 class="w-3 h-3 text-primary" />
                  </span>
                  <span class="font-semibold text-primary text-base">Php {{ Number(vehicle.rental_rate_with_driver).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/day</span>
                  <span class="text-xs text-muted-foreground">(with driver)</span>
                </div>
              </template>
            </div>
          </div>
          <!-- Ratings -->
          <div class="flex flex-col gap-2 mt-2">
            <div class="flex items-center gap-2">
              <span class="flex items-center">
                <Star
                  v-for="n in 5"
                  :key="n"
                  :class="n <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                  class="w-6 h-6"
                />
              </span>
              <span class="text-xl font-semibold">{{ averageRating }}</span>
              <span class="text-muted-foreground text-base">({{ feedbackList.length }} review{{ feedbackList.length === 1 ? '' : 's' }})</span>
            </div>
          </div>
          <!-- Book Now Button modernized -->
          <div class="mt-6">
            <button
              v-if="vehicle.status !== 'maintenance'"
              class="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-xl shadow-lg hover:from-primary/90 hover:to-primary/80 transition-all border border-primary/30 opacity-90 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
              @click.prevent="router.push({ path: `/book/${vehicleId}` })"
              :disabled="userAuth.isAdmin() || booking?.status === 'pending' || booking?.status === 'paid'"
            >
              Book Now
            </button>
            <div v-else class="text-center">
              <div
                class="w-full py-4 rounded-xl bg-muted text-muted-foreground font-bold text-xl border border-border shadow"
              >
                Under Maintenance
              </div>
              <p class="text-base text-muted-foreground mt-2">
                This vehicle is currently unavailable for booking.
              </p>
            </div>
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
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              <div class="flex items-center gap-2">
                <span><User2 class="w-4 h-4 text-primary" /></span>
                <dt class="font-medium">Brand</dt>
                <dd class="text-muted-foreground ml-1">{{ vehicle.brand }}</dd>
              </div>
              <div class="flex items-center gap-2">
                <span><Badge class="w-4 h-4 text-primary">M</Badge></span>
                <dt class="font-medium">Model</dt>
                <dd class="text-muted-foreground ml-1">{{ vehicle.model }}</dd>
              </div>
              <div class="flex items-center gap-2">
                <span><Badge class="w-4 h-4 text-primary">Y</Badge></span>
                <dt class="font-medium">Year</dt>
                <dd class="text-muted-foreground ml-1">{{ vehicle.year }}</dd>
              </div>
              <div class="flex items-center gap-2">
                <span><Badge class="w-4 h-4 text-primary">S</Badge></span>
                <dt class="font-medium">Status</dt>
                <dd class="text-muted-foreground ml-1">{{ vehicle.status }}</dd>
              </div>
              <div class="flex items-center gap-2">
                <span><Badge class="w-4 h-4 text-primary">T</Badge></span>
                <dt class="font-medium">Type</dt>
                <dd class="text-muted-foreground ml-1">{{ vehicle.type }}</dd>
              </div>
              <div class="flex items-center gap-2">
                <span><Badge class="w-4 h-4 text-primary">P</Badge></span>
                <dt class="font-medium">Plate Number</dt>
                <dd class="text-muted-foreground ml-1">{{ vehicle.plate_number }}</dd>
              </div>
              <div class="flex items-center gap-2">
                <span><User2 class="w-4 h-4 text-primary" /></span>
                <dt class="font-medium">Capacity</dt>
                <dd class="text-muted-foreground ml-1">{{ vehicle.capacity }} person(s)</dd>
              </div>
              <div class="flex items-start gap-2">
                <span><User2 class="w-4 h-4 text-primary mt-1" /></span>
                <div class="flex flex-col">
                  <dt class="font-medium">Rental Rate</dt>
                  <dd class="text-muted-foreground ml-1">
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-primary"
                          >Php
                          {{
                            Number(vehicle.rental_rate).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          }}</span
                        >
                        <span class="text-xs text-muted-foreground">per day</span>
                      </div>
                      <template v-if="vehicle.rental_rate_with_driver">
                        <div class="flex items-center gap-2">
                          <span class="font-semibold text-primary"
                            >Php
                            {{
                              Number(vehicle.rental_rate_with_driver).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            }}</span
                          >
                          <span class="text-xs text-muted-foreground">(w/driver)</span>
                        </div>
                      </template>
                    </div>
                  </dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <!-- Terms & Conditions -->
      <Card class="bg-card border border-border">
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="list-disc pl-6 text-muted-foreground space-y-2">
            <li>
              Deposit is
              <span class="font-semibold text-primary"
                >₱{{ vehicle.deposit?.toLocaleString() || '10,000' }}</span
              >
              to be returned to Renter when vehicle is returned undamaged and with full tank
            </li>
            <li>Photo of 2 valid government IDs is required</li>
            <li>Renter will sign contract</li>
          </ul>
        </CardContent>
      </Card>

      <!-- Reviews & Feedback Section -->
      <section class="mt-10">
        <Card class="bg-card border border-border">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-xl">
              <Star class="text-yellow-400 w-6 h-6" />
              Customer Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-center gap-2 mb-4">
              <span class="flex items-center">
                <Star
                  v-for="n in 5"
                  :key="n"
                  :class="
                    n <= Math.round(averageRating)
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  "
                  class="w-5 h-5"
                />
              </span>
              <span class="text-lg font-semibold">{{ averageRating }}</span>
              <span class="text-muted-foreground text-sm"
                >({{ feedbackList.length }} review{{ feedbackList.length === 1 ? '' : 's' }})</span
              >
            </div>
            <div
              v-if="feedbackLoading"
              class="text-muted-foreground text-sm flex items-center gap-2"
            >
              <span class="animate-spin w-4 h-4 border-b-2 border-primary rounded-full"></span>
              Loading feedback...
            </div>
            <div v-else-if="feedbackList.length === 0" class="text-muted-foreground text-sm">
              No feedback yet for this vehicle.
            </div>
            <div v-else class="space-y-3 mt-2">
              <div
                v-for="fb in feedbackList"
                :key="fb.id"
                class="bg-muted rounded-lg p-3 border border-border"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="flex items-center">
                    <Star
                      v-for="n in 5"
                      :key="n"
                      :class="
                        n <= fb.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                      "
                      class="w-4 h-4"
                    />
                  </span>
                  <span class="text-xs text-muted-foreground ml-2">{{
                    new Date(fb.created_at).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  }}</span>
                </div>
                <div class="text-base text-foreground">
                  {{ fb.comment || 'No comment provided.' }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      <!-- End Reviews & Feedback Section -->
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVehicleDetails } from '@/services/vehicle-service'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Loading from '@/components/features/Loading.vue'
import { Button } from '@/components/ui/button'
import { getStatusVariant } from '@/lib/utils'
import { useUserAuth } from '@/services/useUserAuth'
import { useVehicleFeedbackQuery } from '@/services/feedback-api'
import { Star, User2, SquarePen } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
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

// Admin edit button logic
const userAuth = useUserAuth()

const { data: feedbackData, isLoading: feedbackLoading } = useVehicleFeedbackQuery(vehicleId)
const feedbackList = computed(() => (Array.isArray(feedbackData.value) ? feedbackData.value : []))
const averageRating = computed(() => {
  if (!feedbackList.value.length) return 0
  const sum = feedbackList.value.reduce((acc, f) => acc + (f.rating || 0), 0)
  return (sum / feedbackList.value.length).toFixed(1)
})
</script>
