<template>
  <div class="container">
    <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">
      <ClipboardList class="w-6 h-6" /> My Bookings
    </h1>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="bookings..." />
    </div>
    <div v-else-if="error" class="text-center text-red-600">{{ error.message }}</div>
    <div v-else>
      <div
        v-if="!bookings.length"
        class="text-center text-muted-foreground py-12 flex flex-col items-center gap-4"
      >
        <span>You have no bookings yet.</span>
        <Button as-child variant="default" size="lg" class="mt-2 px-6 py-3 text-base font-semibold">
          <RouterLink to="/vehicles" class="flex items-center justify-center gap-2">
            <Car class="w-5 h-5" />
            Add Booking
          </RouterLink>
        </Button>
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
                    <span class="font-medium text-primary"
                      >₱{{ Number(booking.total_price).toLocaleString() }}</span
                    >
                    <ShieldCheck class="w-4 h-4 text-muted-foreground" />
                    <span class="font-semibold text-sm text-muted-foreground">
                      Security Deposit:</span
                    >
                    <span class="font-medium text-primary"
                      >₱{{ Number(booking.vehicle.deposit).toLocaleString() }}</span
                    >
                  </div>
                  <div v-if="booking.pickup_type === 'delivery'" class="flex items-center gap-2">
                    <Truck class="w-4 h-4 text-muted-foreground" />
                    <span class="font-semibold text-sm text-muted-foreground">Delivery:</span>
                    <span class="font-medium">{{ booking.delivery_location }}</span>
                    <span class="text-sm text-muted-foreground">(₱{{ booking.delivery_fee }})</span>
                  </div>
                  <div
                    v-if="booking.pickup_type === 'delivery'"
                    class="text-sm text-muted-foreground mt-1 ml-6"
                  >
                    <span class="font-medium">Delivery Details:</span>
                    <p class="mt-1">{{ booking.delivery_details }}</p>
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
                <template v-if="booking.status === 'pending' || booking.status === 'confirmed'">
                  <Button
                    v-if="shouldShowDepositButton(booking)"
                    variant="outline"
                    @click="openPaymentDialog(booking.id, 'deposit')"
                  >
                    <ShieldCheck class="w-4 h-4 mr-2" />
                    Pay Security Deposit
                  </Button>

                  <Button
                    v-if="shouldShowRentalButton(booking)"
                    variant="outline"
                    @click="openPaymentDialog(booking.id, 'rental')"
                  >
                    <CreditCard class="w-4 h-4 mr-2" />
                    Pay Rental Fee
                  </Button>

                  <Button
                    variant="destructive"
                    :loading="cancelLoading[booking.id]"
                    @click="handleCancelBooking(booking)"
                    v-if="shouldShowCancelButton(booking)"
                  >
                    <Ban class="w-4 h-4 mr-2" />
                    Cancel Booking
                  </Button>

                  <Button
                    v-if="shouldShowEditButton(booking)"
                    variant="outline"
                    @click="openEditDialog(booking)"
                  >
                    <Edit2 class="w-4 h-4 mr-2" />
                    Edit Booking
                  </Button>
                </template>
                <Button
                  v-if="booking.status === 'confirmed' || booking.status === 'active'"
                  variant="outline"
                  @click="openContractDialog(booking)"
                >
                  <Car class="w-4 h-4 mr-2" />
                  View Contract
                </Button>
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
                          <Button
                            variant="outline"
                            class="w-full"
                            @click="openPaymentProofDialog(payment)"
                          >
                            <ImageIcon class="w-4 h-4 mr-2" />
                            View Payment Proof
                          </Button>
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
        <EditBookingDialog
          v-if="editDialogOpen"
          :booking="editBooking"
          :open="editDialogOpen"
          @update:open="editDialogOpen = $event"
          @updated="() => refetch()"
        />
        <PaymentProofDialog
          v-if="selectedPaymentProof"
          v-model:open="paymentProofDialogOpen"
          :image-url="selectedPaymentProof?.proof_image"
          :payment-date="selectedPaymentProof?.created_at"
        />
        <div v-if="contractDialogOpen">
          <div class="modal-overlay" @click="closeContractDialog"></div>
          <div class="modal-content">
            <button class="modal-close" @click="closeContractDialog">&times;</button>
            <ContractPrint :booking="selectedBooking" />
          </div>
        </div>
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
import EditBookingDialog from '@/components/features/bookings/EditBookingDialog.vue'
import PaymentProofDialog from '@/components/features/bookings/PaymentProofDialog.vue'
import ContractPrint from '@/components/features/ContractPrint.vue'
import { useCancelBooking } from '@/services/booking-service'
import { toast } from 'vue-sonner'
import Loading from '@/components/features/Loading.vue'
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
  Edit2,
  Image as ImageIcon,
  Truck,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import DriverAssignmentStatus from '@/components/features/DriverAssignmentStatus.vue'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

const { data, error, isLoading, refetch } = useMyBookings()
const bookings = computed(() => data.value || [])

// Dialog state per booking and type
const paymentDialogBookingId = ref(null)
const paymentDialogType = ref('deposit')
const paymentDialogOpen = ref(false)

// Payment proof dialog state
const paymentProofDialogOpen = ref(false)
const selectedPaymentProof = ref(null)

// Contract dialog state
const contractDialogOpen = ref(false)
const selectedBooking = ref(null)

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

function openContractDialog(booking) {
  selectedBooking.value = booking
  contractDialogOpen.value = true
}

function closeContractDialog() {
  contractDialogOpen.value = false
}

// Edit dialog state
const editDialogOpen = ref(false)
const editBooking = ref(null)

function openEditDialog(booking) {
  editBooking.value = booking
  editDialogOpen.value = true
}

function shouldShowEditButton(booking) {
  // Only allow editing if booking is pending and more than 24h away
  if (!booking || booking.status !== 'pending') return false
  const now = new Date()
  const start = new Date(booking.start_date)
  const timeUntilStart = start.getTime() - now.getTime()
  console.log('Time until start:', timeUntilStart / (60 * 60 * 1000), 'hours')
  return timeUntilStart > 24 * 60 * 60 * 1000
}

function shouldShowCancelButton(booking) {
  // Allow cancellation only if the booking is pending and hasn't started yet
  if (!booking || booking.status !== 'pending') return false
  const now = new Date()
  const start = new Date(booking.start_date)
  const timeUntilStart = start.getTime() - now.getTime()
  console.log('Cancel button - Time until start:', timeUntilStart / (60 * 60 * 1000), 'hours')
  return timeUntilStart > 0 // Can cancel as long as the booking hasn't started yet
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

function openPaymentProofDialog(payment) {
  selectedPaymentProof.value = payment
  paymentProofDialogOpen.value = true
}

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

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}
.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  z-index: 1001;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  z-index: 1002;
}
</style>
