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
            <!-- Move Edit Button here -->
            <div v-if="userAuth.isAdmin()" class="flex justify-end mt-4">
              <Button @click="openEditModal" variant="default" class="px-4 py-2 cursor-pointer">
                Edit Vehicle
              </Button>
            </div>
          </div>
          <!-- Placeholder for Ratings -->
          <div class="flex items-center gap-2 mt-2">
            <span class="text-yellow-400 text-xl">★ ★ ★ ★ ☆</span>
            <span class="text-muted-foreground text-sm">(Coming soon)</span>
          </div>
          <!-- Book Now Button -->
          <div class="mt-4">
            <button
              v-if="vehicle.status !== 'maintenance'"
              class="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow hover:bg-primary/90 transition-all border border-primary/30 opacity-80 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
              @click.prevent="handleBookNow"
              :disabled="booking?.status === 'pending' || booking?.status === 'paid'"
            >
              Book Now
            </button>
            <div v-else class="text-center">
              <div
                class="w-full py-3 rounded-lg bg-muted text-muted-foreground font-bold text-lg border border-border"
              >
                Under Maintenance
              </div>
              <p class="text-sm text-muted-foreground mt-2">
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

      <!-- Edit Vehicle Modal -->
      <VehicleUpdateForm
        v-if="dialogStore.editOpen && dialogStore.editVehicle"
        :key="dialogStore.editVehicle.id + '-' + (dialogStore.editOpen ? 'open' : 'closed')"
        :vehicle="dialogStore.editVehicle"
        @close="closeEditModal"
        @updated="handleUpdated"
      />

      <!-- Booking Dialog -->
      <BookingDialog
        v-if="showBookingDialog"
        :vehicleId="vehicleId"
        :open="showBookingDialog"
        @update:open="(val) => (showBookingDialog = val)"
        :onClose="() => (showBookingDialog = false)"
        @booked="handleBooked"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVehicleDetails } from '@/services/vehicle-service'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getStatusVariant } from '@/lib/utils'
import VehicleUpdateForm from '@/components/features/vehicles/VehicleUpdateForm.vue'
import { useVehicleDialogStore } from '@/stores/vehicleDialogStore'
import { useUserAuth } from '@/services/useUserAuth'
import BookingDialog from '@/components/features/bookings/BookingDialog.vue'

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

// Edit vehicle modal
const dialogStore = useVehicleDialogStore()

function openEditModal() {
  dialogStore.openEdit(vehicle.value)
}
function closeEditModal() {
  dialogStore.closeEdit()
}
function handleUpdated(updatedVehicle) {
  // Optionally show a toast or update local state
}

// Close edit dialog on component mount
onMounted(() => {
  dialogStore.closeEdit()
})

const userAuth = useUserAuth()

const showBookingDialog = ref(false)

function handleBookNow() {
  showBookingDialog.value = true
}

function handleBooked(newBooking) {
  showBookingDialog.value = false
  // Show toast and redirect to My Bookings
  import('vue-sonner').then(({ toast }) => {
    toast.success('Booking successful!', {
      description: 'You can now manage your booking in My Bookings.',
      duration: 4000,
    })
  })
  router.push({ name: 'my-bookings' })
}
</script>
