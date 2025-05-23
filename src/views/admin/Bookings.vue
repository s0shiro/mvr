<template>
  <div class="container mx-auto py-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Manage Bookings</h1>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>
    <div v-else class="space-y-4">
      <Card v-for="booking in bookings" :key="booking.id" class="p-6">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Booking Details -->
          <div class="flex-1 space-y-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold">
                  {{ booking.vehicle?.name }}
                  <Badge class="ml-2" :variant="getStatusVariant(booking.status)">
                    {{ booking.status }}
                  </Badge>
                </h3>
                <p class="text-muted-foreground">Booked by: {{ booking.user?.name }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold">Total: ₱{{ booking.total_price }}</p>
                <p class="text-sm text-muted-foreground">
                  Booked on: {{ formatDate(booking.created_at) }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="font-medium mb-2">Rental Period</h4>
                <p>Start: {{ formatDate(booking.start_date) }}</p>
                <p>End: {{ formatDate(booking.end_date) }}</p>
              </div>
              <div>
                <h4 class="font-medium mb-2">Pickup Details</h4>
                <p>Type: {{ booking.pickup_type }}</p>
                <p v-if="booking.delivery_location">Location: {{ booking.delivery_location }}</p>
              </div>
            </div>

            <!-- Payment Status -->
            <div class="space-y-2">
              <h4 class="font-medium">Payments</h4>
              <div
                v-for="payment in booking.payments"
                :key="payment.id"
                class="flex items-center gap-4"
              >
                <Badge :variant="getPaymentStatusVariant(payment.status)">
                  {{ payment.type }} Payment - {{ payment.status }}
                </Badge>
                <Button
                  v-if="payment.status === 'pending'"
                  size="sm"
                  @click="handleConfirmPayment(payment.id)"
                  :loading="confirmingPayment === payment.id"
                >
                  Confirm
                </Button>
                <Button
                  v-if="payment.status === 'pending'"
                  size="sm"
                  variant="destructive"
                  @click="handleRejectPayment(payment.id)"
                  :loading="rejectingPayment === payment.id"
                >
                  Reject
                </Button>
                <Button
                  v-if="payment.proof_image"
                  size="sm"
                  variant="outline"
                  @click="viewProof(payment)"
                >
                  View Proof
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <PaymentProofDialog
      v-if="selectedPaymentProof"
      v-model:open="paymentProofDialogOpen"
      :image-url="selectedPaymentProof?.proof_image"
      :payment-date="selectedPaymentProof?.created_at"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PaymentProofDialog from '@/components/features/bookings/PaymentProofDialog.vue'
import {
  useAdminBookings,
  useConfirmPayment,
  useRejectPayment,
} from '@/services/admin/booking-service'
import { toast } from 'vue-sonner'

const { data: bookings, error, isLoading, refetch } = useAdminBookings()
const selectedPayment = ref(null)
const confirmingPayment = ref(null)
const rejectingPayment = ref(null)
const paymentProofDialogOpen = ref(false)
const selectedPaymentProof = ref(null)

const confirmPayment = useConfirmPayment()
const rejectPayment = useRejectPayment()

function formatDate(date) {
  return new Date(date).toLocaleString()
}

function getStatusVariant(status) {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'confirmed':
      return 'success'
    case 'cancelled':
      return 'destructive'
    case 'ready_for_release':
      return 'default'
    default:
      return 'secondary'
  }
}

function getPaymentStatusVariant(status) {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'destructive'
    default:
      return 'secondary'
  }
}

async function handleConfirmPayment(paymentId) {
  confirmingPayment.value = paymentId
  try {
    await confirmPayment.mutateAsync(paymentId)
    toast.success('Payment confirmed')
    refetch()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to confirm payment')
  } finally {
    confirmingPayment.value = null
  }
}

async function handleRejectPayment(paymentId) {
  rejectingPayment.value = paymentId
  try {
    await rejectPayment.mutateAsync(paymentId)
    toast.success('Payment rejected')
    refetch()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to reject payment')
  } finally {
    rejectingPayment.value = null
  }
}

function viewProof(payment) {
  selectedPaymentProof.value = payment
  paymentProofDialogOpen.value = true
}
</script>
