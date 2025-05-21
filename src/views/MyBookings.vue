<template>
  <div class="container">
    <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">
      <ClipboardList class="w-6 h-6" /> My Bookings
    </h1>
    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
    <div v-else-if="error" class="text-center text-red-600">{{ error.message }}</div>
    <div v-else>
      <div v-if="!bookings.length" class="text-center text-muted-foreground py-12">
        You have no bookings yet.
      </div>
      <div v-else class="space-y-6">
        <Card v-for="booking in bookings" :key="booking.id" class="border border-border bg-card">
          <CardHeader class="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle class="text-lg font-semibold">{{
                booking.vehicle?.name || 'Vehicle'
              }}</CardTitle>
              <CardDescription>
                <span class="font-medium">{{ booking.vehicle?.brand }}</span>
                <span v-if="booking.vehicle"
                  >• {{ booking.vehicle.model }} ({{ booking.vehicle.year }})</span
                >
              </CardDescription>
            </div>
            <Badge :variant="getStatusVariant(booking.status)">{{ booking.status }}</Badge>
          </CardHeader>
          <CardContent class="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <img
              v-if="booking.vehicle?.primary_image_url"
              :src="booking.vehicle.primary_image_url"
              alt="Vehicle"
              class="w-40 h-28 object-cover rounded-lg shadow-sm border"
            />
            <div class="flex-1 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <CalendarDays class="w-4 h-4 text-muted-foreground" />
                    <span class="font-semibold text-sm text-muted-foreground">Rental Period:</span>
                    <span class="font-medium"
                      >{{ formatDate(booking.start_date) }} -
                      {{ formatDate(booking.end_date) }}</span
                    >
                  </div>
                  <div class="flex items-center gap-2">
                    <Receipt class="w-4 h-4 text-muted-foreground" />
                    <span class="font-semibold text-sm text-muted-foreground">Total Price:</span>
                    <span class="font-medium text-primary">₱{{ booking.total_price }}</span>
                  </div>
                  <div v-if="booking.payment" class="flex items-center gap-2">
                    <CreditCard class="w-4 h-4 text-muted-foreground" />
                    <span class="font-semibold text-sm text-muted-foreground">Payment Method:</span>
                    <span class="font-medium">{{ booking.payment.method }}</span>
                    <Badge
                      v-if="booking.payment.status === 'approved'"
                      variant="available"
                      class="ml-2"
                      >Paid</Badge
                    >
                    <Badge
                      v-else-if="booking.payment.status === 'pending'"
                      variant="maintenance"
                      class="ml-2"
                      >Pending</Badge
                    >
                    <Badge
                      v-else-if="booking.payment.status === 'rejected'"
                      variant="destructive"
                      class="ml-2"
                      >Rejected</Badge
                    >
                  </div>
                </div>

                <div
                  v-if="booking.notes"
                  class="text-sm text-muted-foreground bg-muted p-3 rounded-lg"
                >
                  <span class="font-semibold block mb-1 flex items-center gap-2">
                    <AlertCircle class="w-4 h-4" /> Notes
                  </span>
                  {{ booking.notes }}
                </div>
              </div>

              <div class="flex gap-2 mb-4">
                <template v-if="booking.status === 'pending'">
                  <template v-if="shouldShowDepositButton(booking)">
                    <Button variant="outline" @click="openPaymentDialog(booking.id, 'deposit')">
                      <ShieldCheck class="w-4 h-4 mr-2" />
                      Pay Security Deposit
                    </Button>
                  </template>
                  <template v-else-if="shouldShowRentalButton(booking)">
                    <Button variant="outline" @click="openPaymentDialog(booking.id, 'rental')">
                      <CreditCard class="w-4 h-4 mr-2" />
                      Pay Rental Fee
                    </Button>
                  </template>
                  <Button
                    variant="destructive"
                    :loading="cancelLoading[booking.id]"
                    @click="handleCancelBooking(booking)"
                  >
                    <Ban class="w-4 h-4 mr-2" />
                    Cancel Booking
                  </Button>
                </template>
              </div>

              <div
                class="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-1/2 before:bg-border before:h-full"
              >
                <template v-for="payment in booking.payments" :key="payment.id">
                  <div class="relative pl-8">
                    <!-- Timeline dot -->
                    <div
                      class="absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border"
                    >
                      <ShieldCheck
                        v-if="payment.type === 'deposit'"
                        class="w-4 h-4 text-foreground"
                      />
                      <Receipt v-else class="w-4 h-4 text-foreground" />
                    </div>
                    <!-- Content -->
                    <div class="bg-card rounded-lg border p-4 shadow-sm">
                      <div class="flex items-center justify-between mb-3">
                        <div class="font-semibold">
                          {{ payment.type === 'deposit' ? 'Security Deposit' : 'Rental Payment' }}
                        </div>
                        <Badge :variant="getStatusVariant(payment.status)">
                          {{ payment.status }}
                        </Badge>
                      </div>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-muted-foreground">Method</span>
                          <span class="font-medium">{{ payment.method }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-muted-foreground">Reference #</span>
                          <span class="font-medium">{{ payment.reference_number }}</span>
                        </div>
                        <div class="flex justify-between text-xs text-muted-foreground">
                          <span>Submitted</span>
                          <span>{{ new Date(payment.created_at).toLocaleString() }}</span>
                        </div>
                        <div v-if="payment.proof_image" class="mt-3">
                          <span class="text-sm text-muted-foreground block mb-2"
                            >Payment Proof</span
                          >
                          <img
                            :src="payment.proof_image"
                            alt="Proof"
                            class="w-full h-32 object-cover rounded-lg border"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </CardContent>
        </Card>
        <PaymentDialog
          v-if="paymentDialogBookingId"
          :bookingId="paymentDialogBookingId"
          :open="paymentDialogOpen"
          :onClose="closePaymentDialog"
          :type="paymentDialogType"
          @paid="
            () => {
              closePaymentDialog()
              toast.success('Payment submitted!')
              data.refetch && data.refetch()
            }
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMyBookings } from '@/services/booking-service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getStatusVariant } from '@/lib/utils'
import { computed, ref } from 'vue'
import PaymentDialog from '@/components/features/bookings/PaymentDialog.vue'
import { useCancelBooking } from '@/services/booking-service'
import { toast } from 'vue-sonner'
import {
  CalendarDays,
  CreditCard,
  ClipboardList,
  AlertCircle,
  Car,
  Receipt,
  ShieldCheck,
  Ban,
  RotateCcw,
} from 'lucide-vue-next'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

const { data, error, isLoading } = useMyBookings()
const bookings = computed(() => data.value || [])

// Dialog state per booking and type
const paymentDialogBookingId = ref(null)
const paymentDialogType = ref('deposit')
const paymentDialogOpen = ref(false)

function openPaymentDialog(bookingId, type = 'deposit') {
  paymentDialogBookingId.value = bookingId
  paymentDialogType.value = type
  paymentDialogOpen.value = true
  // DEBUG: Log which type is being passed
  console.log('Opening PaymentDialog for', bookingId, 'type:', type)
}
function closePaymentDialog() {
  paymentDialogOpen.value = false
  paymentDialogBookingId.value = null
  paymentDialogType.value = 'deposit'
}

// Helper functions to check payment status
function getLatestPaymentOfType(booking, type) {
  return (
    booking.payments?.find((p) => p.type === type && p.status === 'pending') ||
    booking.payments
      ?.filter((p) => p.type === type)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
  )
}

function shouldShowDepositButton(booking) {
  const latestDeposit = getLatestPaymentOfType(booking, 'deposit')
  return !latestDeposit || latestDeposit.status === 'rejected'
}

function shouldShowRentalButton(booking) {
  const latestDeposit = getLatestPaymentOfType(booking, 'deposit')
  const latestRental = getLatestPaymentOfType(booking, 'rental')
  return (
    latestDeposit?.status === 'approved' && (!latestRental || latestRental.status === 'rejected')
  )
}

const cancelBooking = useCancelBooking()
const cancelLoading = ref({})
async function handleCancelBooking(booking) {
  cancelLoading.value[booking.id] = true
  try {
    await cancelBooking.mutateAsync(booking.id)
    toast.success('Booking cancelled')
    // Optionally refetch bookings
    data.refetch && data.refetch()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Cancellation failed')
  } finally {
    cancelLoading.value[booking.id] = false
  }
}
</script>
