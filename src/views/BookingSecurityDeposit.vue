<template>
  <div class="container mx-auto px-4">
    <div class="flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="space-y-2">
          <Button variant="ghost" class="px-0" @click="goBack">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Back to My Bookings
          </Button>
          <div>
            <h1 class="text-3xl font-bold text-foreground">Security Deposit</h1>
            <p class="text-sm text-muted-foreground">
              Step 1 of 2 · Secure your booking by submitting the security deposit.
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <Badge variant="outline" class="text-xs uppercase tracking-wide">
            Booking #{{ bookingId }}
          </Badge>
          <template v-if="placeholderVisible">
            <Skeleton class="h-6 w-24 rounded-full" />
          </template>
          <Badge v-else :variant="statusMeta.variant">{{ statusMeta.label }}</Badge>
        </div>
      </div>

      <div v-if="placeholderVisible" class="space-y-8">
        <div class="grid gap-6 lg:grid-cols-3">
          <div class="lg:col-span-2 rounded-xl border border-border/60 bg-muted/30 p-6 space-y-6">
            <Skeleton class="h-5 w-48" />
            <Skeleton class="h-4 w-64" />
            <div class="grid gap-4 sm:grid-cols-2">
              <Skeleton class="h-24 w-full" />
              <Skeleton class="h-24 w-full" />
            </div>
            <Skeleton class="h-20 w-full" />
          </div>
          <div class="rounded-xl border border-border/60 bg-muted/30 p-6 space-y-4">
            <Skeleton class="h-5 w-40" />
            <Skeleton class="h-3 w-48" />
            <div class="space-y-3">
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
            </div>
          </div>
        </div>
        <div class="grid gap-6 lg:grid-cols-3">
          <div class="lg:col-span-2 rounded-xl border border-border/60 bg-muted/30 p-6 space-y-4">
            <Skeleton class="h-5 w-48" />
            <Skeleton class="h-3 w-64" />
            <Skeleton class="h-40 w-full" />
          </div>
          <div class="rounded-xl border border-border/60 bg-muted/30 p-6 space-y-4">
            <Skeleton class="h-5 w-48" />
            <Skeleton class="h-3 w-56" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-3 w-48" />
          </div>
        </div>
      </div>

      <div v-else-if="errorMessage" class="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <p class="text-sm text-destructive">{{ errorMessage }}</p>
        <Button variant="outline" class="mt-4" @click="goBack">Return to My Bookings</Button>
      </div>

      <div v-else-if="!booking" class="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div class="flex items-start gap-3">
          <AlertTriangle class="w-6 h-6 text-yellow-600" />
          <div>
            <h2 class="text-lg font-semibold">Booking not found</h2>
            <p class="text-sm text-muted-foreground">
              We couldn’t locate this booking. It may have been canceled or already completed.
            </p>
            <Button class="mt-4" @click="goBack">Back to My Bookings</Button>
          </div>
        </div>
      </div>

      <div v-else class="space-y-8">
        <div class="grid gap-6 lg:grid-cols-3">
          <Card class="lg:col-span-2 border border-primary/30 bg-primary/5 shadow-sm">
            <CardHeader class="pb-4">
              <CardTitle class="flex items-center gap-2 text-primary">
                <ShieldCheck class="w-5 h-5" />
                Deposit Overview
              </CardTitle>
              <CardDescription class="text-sm text-muted-foreground">
                Submit your deposit using any available payment method below. You can move to the rental fee right after submitting.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4 text-sm">
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-lg border border-border bg-background p-4">
                  <p class="text-xs font-semibold text-muted-foreground uppercase">Vehicle</p>
                  <p class="mt-1 text-base font-semibold text-foreground">
                    {{ booking.vehicle?.name || 'Vehicle' }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ booking.vehicle?.brand }} • {{ booking.vehicle?.model }} {{ booking.vehicle?.year }}
                  </p>
                </div>
                <div class="rounded-lg border border-border bg-background p-4">
                  <p class="text-xs font-semibold text-muted-foreground uppercase">Security Deposit</p>
                  <p class="mt-1 text-2xl font-bold text-primary">₱{{ depositAmount.toLocaleString() }}</p>
                  <p class="text-xs text-muted-foreground">Fully refundable after the vehicle is returned in good condition.</p>
                </div>
              </div>

              <div class="rounded-lg border border-dashed border-muted/60 bg-muted/30 p-4">
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Status</p>
                    <p class="mt-1 text-sm font-semibold text-foreground flex items-center gap-2">
                      <component :is="depositMeta.icon" class="w-4 h-4 text-primary" />
                      {{ depositMeta.label }}
                    </p>
                    <p class="text-xs text-muted-foreground mt-1">{{ depositMeta.description }}</p>
                  </div>
                  <Badge :variant="depositMeta.badgeVariant" class="self-start">
                    {{ depositMeta.badgeLabel }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="border border-border bg-card shadow-sm">
            <CardHeader class="pb-3">
              <CardTitle class="text-base font-semibold">Step-by-step Flow</CardTitle>
              <CardDescription class="text-sm text-muted-foreground">
                Keep track of what’s next for this booking.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4 text-sm">
              <div class="flex gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-full" :class="stepStyles.deposit">
                  1
                </div>
                <div>
                  <p class="font-semibold">Security Deposit</p>
                  <p class="text-xs text-muted-foreground">Submit proof of deposit to secure the vehicle.</p>
                </div>
              </div>
              <div class="flex gap-3 opacity-80">
                <div class="flex h-9 w-9 items-center justify-center rounded-full" :class="stepStyles.rental">
                  2
                </div>
                <div>
                  <p class="font-semibold">Rental Fee</p>
                  <p class="text-xs text-muted-foreground">Pay the rental fee as soon as you’re ready.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
          <Card class="lg:col-span-2 shadow-sm">
            <CardHeader class="pb-4">
              <CardTitle class="text-lg font-semibold">Submit Security Deposit</CardTitle>
              <CardDescription class="text-sm text-muted-foreground">
                Upload a screenshot or photo of your payment receipt. Cash payments can be made at our office.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="!canSubmitDeposit" class="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-700 space-y-2">
                <p v-if="depositStatus === 'not_required'">
                  This booking does not require a security deposit. You can move straight to the rental payment when you’re ready.
                </p>
                <p v-else>
                  Your deposit is already {{ depositMeta.badgeLabel.toLowerCase() }}. If you need to resubmit, please reach out to our support team.
                </p>
              </div>
              <PaymentForm
                v-else
                :booking-id="bookingId"
                type="deposit"
                @submitted="handleDepositSubmitted"
              >
                <template #submit-label>
                  {{ depositMeta.actionLabel }}
                </template>
              </PaymentForm>
            </CardContent>
          </Card>

          <Card class="shadow-sm">
            <CardHeader class="pb-3 space-y-3">
              <div class="flex items-center justify-between gap-3">
                <CardTitle class="text-lg font-semibold">Next: Rental Payment</CardTitle>
                <Badge :variant="rentalMeta.badgeVariant" class="text-xs uppercase tracking-wide">
                  {{ rentalMeta.badgeLabel }}
                </Badge>
              </div>
              <CardDescription class="text-sm text-muted-foreground">
                {{ rentalMeta.description }}
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4 text-sm">
              <div class="rounded-lg border border-border bg-muted/30 p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rental Amount</p>
                <p class="mt-1 text-lg font-semibold text-foreground">₱{{ Number(booking.total_price).toLocaleString() }}</p>
              </div>
              <Button
                variant="outline"
                class="w-full"
                :disabled="!canSubmitRental"
                @click="openRentalDialog"
              >
                <CreditCard class="w-4 h-4 mr-2" />
                {{ rentalMeta.buttonLabel }}
              </Button>
              <p class="text-xs text-muted-foreground">
                {{ rentalMeta.helper }}
              </p>
              <p class="text-xs text-muted-foreground">
                You can always return to this page from your booking list if you need to upload a new deposit proof.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card class="shadow-sm">
          <CardHeader class="pb-4">
            <CardTitle class="text-lg font-semibold">Payment History</CardTitle>
            <CardDescription class="text-sm text-muted-foreground">
              Track every deposit and rental payment submitted for this booking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              :class="[
                'space-y-4 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-1/2 before:h-full',
                booking.status === 'cancelled' ? 'before:bg-red-200 opacity-80' : 'before:bg-border'
              ]"
            >
              <div
                v-if="!displayPayments.length"
                class="pl-8 text-sm text-muted-foreground"
              >
                No payments recorded yet.
              </div>

              <template v-for="payment in displayPayments" :key="payment.id">
                <div class="relative pl-8">
                  <div
                    :class="[
                      'absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background',
                      booking.status === 'cancelled' ? 'border-red-200 bg-red-50' : 'border-border'
                    ]"
                  >
                    <ShieldCheck
                      v-if="payment.type === 'deposit'"
                      :class="[
                        'w-4 h-4',
                        booking.status === 'cancelled' ? 'text-red-400' : 'text-primary'
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
                  <div
                    :class="[
                      'rounded-lg border p-4 shadow-sm space-y-3',
                      booking.status === 'cancelled' ? 'bg-red-50/50 border-red-200' : 'bg-card'
                    ]"
                  >
                    <div class="flex items-center justify-between">
                      <div class="font-semibold">
                        {{ payment.type === 'deposit' ? 'Security Deposit' : 'Rental Payment' }}
                      </div>
                      <Badge :variant="getStatusVariant(payment.status)">
                        {{ payment.status === 'cancelled' ? 'Canceled' : payment.status }}
                      </Badge>
                    </div>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">Method</span>
                        <span class="font-medium">{{ payment.method }}</span>
                      </div>
                      <div v-if="payment.method !== 'cash'" class="flex justify-between">
                        <span class="text-muted-foreground">Reference #</span>
                        <span class="font-medium">{{ payment.reference_number }}</span>
                      </div>
                      <div class="flex justify-between text-xs text-muted-foreground">
                        <span>Submitted</span>
                        <span>{{ new Date(payment.created_at).toLocaleString() }}</span>
                      </div>
                      <div v-if="payment.proof_image && payment.method !== 'cash'" class="pt-2">
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
          </CardContent>
        </Card>
      </div>
    </div>

    <PaymentDialog
      v-if="booking"
      :booking-id="bookingId"
      v-model:open="rentalDialogOpen"
      :on-close="() => (rentalDialogOpen = false)"
      type="rental"
      @paid="handleRentalPaid"
    />
    <PaymentProofDialog
      v-if="selectedPaymentProof"
      v-model:open="paymentProofDialogOpen"
      :image-url="selectedPaymentProof?.proof_image"
      :payment-date="selectedPaymentProof?.created_at"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import PaymentForm from '@/components/features/bookings/PaymentForm.vue'
import PaymentDialog from '@/components/features/bookings/PaymentDialog.vue'
import PaymentProofDialog from '@/components/features/bookings/PaymentProofDialog.vue'
import { useMyBookings } from '@/services/booking-service'
import { toast } from 'vue-sonner'
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Receipt,
  Image as ImageIcon,
} from 'lucide-vue-next'
import { getStatusVariant } from '@/lib/utils'

const route = useRoute()
const router = useRouter()

const bookingId = computed(() => Number(route.params.id))
const { data, isLoading, isFetching, error, refetch } = useMyBookings()

const bookings = computed(() => data.value || [])
const booking = computed(() => bookings.value.find((b) => b.id === bookingId.value))

const placeholderVisible = computed(
  () => (isLoading.value || isFetching.value) && !booking.value && !error.value
)

function requiresDeposit(bookingItem) {
  const type = bookingItem?.vehicle?.type
  if (!type) return false
  const normalizedType = type.toLowerCase()
  if (normalizedType === 'motorcycle') return true
  return normalizedType === 'car' && !bookingItem?.driver_requested
}

function getLatestPayment(bookingItem, type) {
  if (!bookingItem?.payments?.length) return null
  const pending = bookingItem.payments.find((p) => p.type === type && p.status === 'pending')
  if (pending) return pending
  return (
    bookingItem.payments
      .filter((p) => p.type === type)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null
  )
}

const depositPayment = computed(() => getLatestPayment(booking.value, 'deposit'))

const rentalPayment = computed(() => getLatestPayment(booking.value, 'rental'))

const displayPayments = computed(() => {
  if (!booking.value?.payments?.length) return []
  if (!requiresDeposit(booking.value)) {
    return booking.value.payments.filter((payment) => payment.type !== 'deposit')
  }
  return booking.value.payments
})

const depositStatus = computed(() => {
  if (depositPayment.value?.status) {
    return depositPayment.value.status
  }
  if (booking.value && requiresDeposit(booking.value)) {
    return 'not_submitted'
  }
  return 'not_required'
})

const rentalStatus = computed(() => {
  if (rentalPayment.value?.status) {
    return rentalPayment.value.status
  }
  return 'not_submitted'
})

const depositMeta = computed(() => {
  switch (depositStatus.value) {
    case 'approved':
      return {
        label: 'Deposit approved',
        description: 'All set! You can now focus on the rental fee and upcoming release schedule.',
        badgeVariant: 'available',
        badgeLabel: 'Approved',
        icon: CheckCircle,
        actionLabel: 'Resubmit Deposit',
      }
    case 'pending':
      return {
        label: 'Deposit in review',
        description: 'We received your proof. You can still proceed with the rental payment while we verify it.',
        badgeVariant: 'maintenance',
        badgeLabel: 'Pending Review',
        icon: Clock,
        actionLabel: 'Update Deposit',
      }
    case 'rejected':
      return {
        label: 'Deposit requires attention',
        description: 'The previous proof was declined. Please upload a new one to continue.',
        badgeVariant: 'destructive',
        badgeLabel: 'Rejected',
        icon: XCircle,
        actionLabel: 'Resubmit Deposit',
      }
    case 'not_required':
      return {
        label: 'No deposit required',
        description: 'This booking does not require a security deposit.',
        badgeVariant: 'secondary',
        badgeLabel: 'Not required',
        icon: ShieldCheck,
        actionLabel: 'Submit Deposit',
      }
    default:
      return {
        label: 'Action needed',
        description: 'Upload your deposit proof to secure the vehicle. We’ll review it ASAP.',
        badgeVariant: 'secondary',
        badgeLabel: 'Pending submission',
        icon: ShieldCheck,
        actionLabel: 'Submit Deposit',
      }
  }
})

const rentalMeta = computed(() => {
  switch (rentalStatus.value) {
    case 'approved':
      return {
        description: 'Rental payment approved. No additional action is needed.',
        helper: 'If you need to make changes, please reach out to our support team.',
        badgeVariant: 'available',
        badgeLabel: 'Approved',
        buttonLabel: 'Payment Approved',
      }
    case 'pending':
      return {
        description: 'We received your rental payment proof. It is currently under review.',
        helper: 'Please wait for approval or rejection before submitting another payment.',
        badgeVariant: 'maintenance',
        badgeLabel: 'Pending Review',
        buttonLabel: 'Awaiting Review',
      }
    case 'rejected':
      return {
        description: 'Your previous rental payment was rejected. Please submit a new proof to continue.',
        helper: 'Make sure the reference number and screenshot are clear before resubmitting.',
        badgeVariant: 'destructive',
        badgeLabel: 'Rejected',
        buttonLabel: 'Resubmit Rental Payment',
      }
    default:
      return {
        description: 'Pay the rental fee as soon as you’re ready. You can proceed even while your deposit is under review.',
        helper: 'Submitting early helps us confirm your booking faster.',
        badgeVariant: 'secondary',
        badgeLabel: 'Pending submission',
        buttonLabel: 'Submit Rental Payment',
      }
  }
})

const statusMeta = computed(() => {
  switch (booking.value?.status) {
    case 'confirmed':
      return { label: 'Confirmed', variant: 'available' }
    case 'for_release':
      return { label: 'For release', variant: 'secondary' }
    case 'released':
      return { label: 'Released', variant: 'outline' }
    case 'cancelled':
      return { label: 'Cancelled', variant: 'destructive' }
    default:
      return { label: booking.value?.status || 'Pending', variant: 'secondary' }
  }
})

const depositAmount = computed(() => Number(booking.value?.vehicle?.deposit || 0))

const canSubmitDeposit = computed(() => {
  if (!booking.value || depositStatus.value === 'not_required') return false
  return ['not_submitted', 'rejected'].includes(depositStatus.value)
})

const canSubmitRental = computed(() => {
  if (!booking.value) return false
  return ['not_submitted', 'rejected'].includes(rentalStatus.value)
})

const errorMessage = computed(() => (error.value ? error.value.message || 'Unable to fetch booking details.' : ''))

const rentalDialogOpen = ref(false)
const paymentProofDialogOpen = ref(false)
const selectedPaymentProof = ref(null)

const stepStyles = computed(() => ({
  deposit: depositStatus.value === 'approved'
    ? 'bg-green-500 text-white'
    : depositStatus.value === 'pending'
    ? 'bg-yellow-400 text-yellow-950'
    : 'bg-primary text-primary-foreground',
  rental: rentalStatus.value === 'approved'
    ? 'bg-green-500 text-white'
    : rentalStatus.value === 'pending'
    ? 'bg-yellow-400 text-yellow-950'
    : rentalStatus.value === 'rejected'
    ? 'bg-red-500 text-white'
    : 'bg-muted border border-muted-foreground/30 text-muted-foreground',
}))

function handleDepositSubmitted() {
  const amount = depositAmount.value || 0
  toast.success(
    amount
      ? `Security deposit of ₱${amount.toLocaleString()} submitted! We will review it shortly.`
      : 'Security deposit submitted! We will review it shortly.'
  )
  refetch()
}

function handleRentalPaid() {
  const amount = Number(booking.value?.total_price || 0)
  toast.success(
    amount
      ? `Rental payment of ₱${amount.toLocaleString()} submitted!`
      : 'Rental payment submitted!'
  )
  rentalDialogOpen.value = false
  refetch()
}

function openRentalDialog() {
  if (!canSubmitRental.value) {
    if (rentalStatus.value === 'pending') {
      toast.info('Your rental payment is under review. Please wait for a decision before submitting another payment.')
    } else if (rentalStatus.value === 'approved') {
      toast.info('Your rental payment has already been approved. No additional payment is needed.')
    }
    return
  }
  rentalDialogOpen.value = true
}

function openPaymentProofDialog(payment) {
  selectedPaymentProof.value = payment
  paymentProofDialogOpen.value = true
}

watch(paymentProofDialogOpen, (isOpen) => {
  if (!isOpen) {
    selectedPaymentProof.value = null
  }
})

function goBack() {
  router.push({ name: 'my-bookings' })
}
</script>
