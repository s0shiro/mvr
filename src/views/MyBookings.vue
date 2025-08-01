<template>
  <div class="container">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <ClipboardList class="w-6 h-6" /> My Bookings
      </h1>
      <div v-if="bookings.length > 0" class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="toggleAllCards"
          class="flex items-center gap-2"
        >
          <Minimize2 v-if="!globalMinimized" class="w-4 h-4" />
          <Maximize2 v-else class="w-4 h-4" />
          {{ globalMinimized ? 'Expand All' : 'Minimize All' }}
        </Button>
      </div>
    </div>
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
            Add Booking
          </RouterLink>
        </Button>
      </div>
      <div v-else class="space-y-6">
        <Card 
          v-for="booking in bookings" 
          :key="booking.id" 
          :class="[
            'border bg-card transition-all duration-200',
            booking.status === 'cancelled' 
              ? 'border-red-200 bg-red-50/50 opacity-75 hover:opacity-90 cancelled-card' 
              : 'border-border hover:shadow-md'
          ]"
        >
          <CardHeader class="flex flex-row items-center justify-between gap-4">
            <div :class="booking.status === 'cancelled' ? 'line-through text-muted-foreground' : ''" class="flex-1">
              <CardTitle 
                :class="[
                  'text-lg font-semibold',
                  booking.status === 'cancelled' ? 'text-muted-foreground' : ''
                ]"
              >{{
                booking.vehicle?.name || 'Vehicle'
              }}</CardTitle>
              <CardDescription 
                :class="booking.status === 'cancelled' ? 'text-muted-foreground/70' : ''"
              >
                <span class="font-medium">{{ booking.vehicle?.brand }}</span>
                <span v-if="booking.vehicle"
                  >• {{ booking.vehicle.model }} ({{ booking.vehicle.year }})</span
                >
              </CardDescription>
              <!-- Minimized view - show key info in header -->
              <div v-if="isCardMinimized(booking.id)" class="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <div class="flex items-center gap-1">
                  <CalendarDays class="w-3 h-3 text-muted-foreground" />
                  <span>{{ formatDate(booking.start_date) }} - {{ formatDate(booking.end_date) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <Receipt class="w-3 h-3 text-muted-foreground" />
                  <span class="font-medium text-primary">₱{{ Number(booking.total_price).toLocaleString() }}</span>
                </div>
                <div v-if="booking.payment" class="flex items-center gap-1">
                  <CreditCard class="w-3 h-3 text-muted-foreground" />
                  <Badge
                    v-if="booking.payment.status === 'approved'"
                    variant="available"
                    class="text-xs"
                    >Paid</Badge
                  >
                  <Badge
                    v-else-if="booking.payment.status === 'pending'"
                    variant="maintenance"
                    class="text-xs"
                    >Pending</Badge
                  >
                  <Badge
                    v-else-if="booking.payment.status === 'rejected'"
                    variant="destructive"
                    class="text-xs"
                    >Rejected</Badge
                  >
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Badge :variant="getStatusVariant(booking.status)">{{ booking.status }}</Badge>
              <Button
                variant="ghost"
                size="sm"
                @click="toggleCardMinimized(booking.id)"
                class="h-8 w-8 p-0 minimize-button"
              >
                <ChevronDown v-if="!isCardMinimized(booking.id)" class="w-4 h-4" />
                <ChevronUp v-else class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent 
            v-if="!isCardMinimized(booking.id)"
            class="flex flex-col md:flex-row gap-6 items-center md:items-start card-content-transition"
          >
            <div 
              v-if="booking.vehicle?.primary_image_url" 
              class="relative"
            >
              <img
                :src="booking.vehicle.primary_image_url"
                alt="Vehicle"
                :class="[
                  'w-40 h-28 object-cover rounded-lg shadow-sm border',
                  booking.status === 'cancelled' ? 'grayscale opacity-60' : ''
                ]"
              />
              <div 
                v-if="booking.status === 'cancelled'"
                class="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg"
              >
                <span class="text-red-600 font-bold text-sm bg-white/90 px-2 py-1 rounded shadow">
                  CANCELLED
                </span>
              </div>
            </div>
            <div 
              :class="[
                'flex-1 space-y-4',
                booking.status === 'cancelled' ? 'text-muted-foreground/70' : ''
              ]"
            >
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

                <div
                  v-if="booking.status === 'cancelled'"
                  class="text-sm bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg"
                >
                  <span class="font-semibold block mb-1 flex items-center gap-2">
                    <X class="w-4 h-4" /> Booking Cancelled
                  </span>
                  <p class="text-red-700">
                    This booking has been cancelled. 
                    <span v-if="booking.cancellation_reason">
                      Reason: {{ booking.cancellation_reason }}
                    </span>
                    <span v-if="booking.cancelled_at">
                      Cancelled on {{ formatDate(booking.cancelled_at) }}
                    </span>
                  </p>
                </div>
              </div>

              <div class="flex gap-2 mb-4">
                <div v-if="booking.status === 'cancelled'" class="text-sm text-muted-foreground italic">
                  No actions available for cancelled bookings
                </div>
                <template v-else-if="booking.status === 'pending' || booking.status === 'confirmed'">
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
                :class="[
                  'space-y-4 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-1/2 before:h-full',
                  booking.status === 'cancelled' 
                    ? 'before:bg-red-200 opacity-60' 
                    : 'before:bg-border'
                ]"
              >
                <template v-for="payment in booking.payments" :key="payment.id">
                  <div class="relative pl-8">
                    <!-- Timeline dot -->
                    <div
                      :class="[
                        'absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full border-2',
                        booking.status === 'cancelled'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-background border-border'
                      ]"
                    >
                      <ShieldCheck
                        v-if="payment.type === 'deposit'"
                        :class="[
                          'w-4 h-4',
                          booking.status === 'cancelled' ? 'text-red-400' : 'text-foreground'
                        ]"
                      />
                      <Receipt 
                        v-else 
                        :class="[
                          'w-4 h-4',
                          booking.status === 'cancelled' ? 'text-red-400' : 'text-foreground'
                        ]"
                      />
                    </div>
                    <!-- Content -->
                    <div 
                      :class="[
                        'rounded-lg border p-4 shadow-sm',
                        booking.status === 'cancelled' 
                          ? 'bg-red-50/50 border-red-200' 
                          : 'bg-card'
                      ]"
                    >
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
          v-model:open="paymentDialogOpen"
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
  X,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import DriverAssignmentStatus from '@/components/features/DriverAssignmentStatus.vue'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

const { data, error, isLoading, refetch } = useMyBookings()
const bookings = computed(() => data.value || [])

// Card minimization state
const minimizedCards = ref(new Set())
const globalMinimized = ref(false)

// Toggle individual card
function toggleCardMinimized(bookingId) {
  const newSet = new Set(minimizedCards.value)
  if (newSet.has(bookingId)) {
    newSet.delete(bookingId)
  } else {
    newSet.add(bookingId)
  }
  minimizedCards.value = newSet
}

// Toggle all cards
function toggleAllCards() {
  globalMinimized.value = !globalMinimized.value
  if (globalMinimized.value) {
    // Minimize all cards
    minimizedCards.value = new Set(bookings.value.map(b => b.id))
  } else {
    // Maximize all cards
    minimizedCards.value = new Set()
  }
}

function isCardMinimized(bookingId) {
  return minimizedCards.value.has(bookingId)
}

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
/* Cancelled booking styles */
.cancelled-overlay {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
}

.cancelled-card {
  position: relative;
}

.cancelled-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(239, 68, 68, 0.05) 10px,
    rgba(239, 68, 68, 0.05) 20px
  );
  pointer-events: none;
  border-radius: inherit;
}

/* Card minimize/maximize transitions */
.card-content-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-minimized {
  max-height: auto;
}

.card-expanded {
  max-height: none;
}

/* Smooth hover effects for minimize button */
.minimize-button {
  transition: all 0.2s ease-in-out;
}

.minimize-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.05);
}

/* Modal styles */
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
