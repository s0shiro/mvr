<template>
  <div class="">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Manage Bookings</h1>
    </div>

    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading bookings..." />
    </div>
    <div v-else-if="error" class="text-center text-destructive text-lg font-medium">
      {{ error }}
    </div>
    <div v-else class="space-y-8">
      <Card
        v-for="booking in bookings"
        :key="booking.id"
        class="p-6 shadow-lg border border-border rounded-xl bg-card"
      >
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Booking Details -->
          <div class="flex-1 space-y-6">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div>
                <h3 class="text-xl font-semibold text-primary flex items-center gap-2">
                  {{ booking.vehicle?.name }}
                  <Badge class="ml-2 capitalize" :variant="getStatusVariant(booking.status)">
                    {{ booking.status.replace('_', ' ') }}
                  </Badge>
                </h3>
                <p class="text-muted-foreground text-sm mt-1">
                  Booked by:
                  <span class="font-medium text-foreground">{{ booking.user?.name }}</span>
                </p>
              </div>
              <div class="text-right space-y-1">
                <p class="font-semibold text-lg text-foreground">₱{{ booking.total_price }}</p>
                <p class="text-xs text-muted-foreground">
                  Booked on: {{ formatDate(booking.created_at) }}
                </p>
              </div>
            </div>

            <Separator class="my-2" />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Rental Period -->
              <div class="bg-muted/50 rounded-lg p-4 border border-muted flex flex-col gap-2">
                <div class="flex items-center gap-2 mb-2">
                  <CalendarDays class="w-5 h-5 text-primary" />
                  <h4 class="font-semibold text-base text-foreground">Rental Period</h4>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">Start:</span>
                  <span class="font-medium text-foreground">
                    <span class="inline-flex items-center gap-1">
                      <CalendarDays class="w-4 h-4 text-primary" />
                      {{ formatDate(booking.start_date, true) }}
                    </span>
                  </span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">End:</span>
                  <span class="font-medium text-foreground">
                    <span class="inline-flex items-center gap-1">
                      <CalendarDays class="w-4 h-4 text-primary" />
                      {{ formatDate(booking.end_date, true) }}
                    </span>
                  </span>
                </div>
              </div>
              <!-- Pickup Details -->
              <div class="bg-muted/50 rounded-lg p-4 border border-muted flex flex-col gap-2">
                <div class="flex items-center gap-2 mb-2">
                  <Truck class="w-5 h-5 text-primary" />
                  <h4 class="font-semibold text-base text-foreground">Pickup Details</h4>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">Type:</span>
                  <span class="font-medium text-foreground">{{ booking.pickup_type }}</span>
                </div>
                <div v-if="booking.delivery_location" class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">Location:</span>
                  <span class="font-medium text-foreground">{{ booking.delivery_location }}</span>
                </div>
                <div v-if="booking.delivery_details" class="flex items-start gap-2 text-sm">
                  <span class="text-muted-foreground">Details:</span>
                  <span class="font-medium text-foreground whitespace-pre-line">{{
                    booking.delivery_details
                  }}</span>
                </div>
              </div>
            </div>

            <Separator class="my-2" />

            <!-- Payment Status -->
            <div class="space-y-2">
              <h4 class="font-medium text-base text-foreground">Payments</h4>
              <div
                class="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-1/2 before:bg-border before:h-full"
                style="position: relative"
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
                      <CreditCard
                        v-else-if="payment.type === 'rental'"
                        class="w-4 h-4 text-foreground"
                      />
                      <Receipt v-else class="w-4 h-4 text-foreground" />
                    </div>
                    <!-- Content -->
                    <div class="bg-card rounded-lg border p-4 shadow-sm">
                      <div class="flex items-center justify-between mb-3">
                        <div class="font-semibold flex items-center gap-2">
                          <ShieldCheck
                            v-if="payment.type === 'deposit'"
                            class="w-4 h-4 text-foreground"
                          />
                          <CreditCard
                            v-else-if="payment.type === 'rental'"
                            class="w-4 h-4 text-foreground"
                          />
                          <Receipt v-else class="w-4 h-4 text-foreground" />
                          {{
                            payment.type === 'deposit'
                              ? 'Security Deposit'
                              : payment.type === 'rental'
                                ? 'Rental Payment'
                                : 'Other Payment'
                          }}
                        </div>
                        <Badge :variant="getStatusVariant(payment.status)" class="capitalize">
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
                          <Button variant="outline" class="w-full" @click="viewProof(payment)">
                            View Payment Proof
                          </Button>
                        </div>
                        <div class="flex gap-2 mt-2">
                          <Button
                            v-if="payment.status === 'pending'"
                            size="sm"
                            @click="openConfirmDialog(payment)"
                            :loading="confirmingPayment === payment.id"
                          >
                            Confirm
                          </Button>
                          <Button
                            v-if="payment.status === 'pending'"
                            size="sm"
                            variant="destructive"
                            @click="openRejectDialog(payment)"
                            :loading="rejectingPayment === payment.id"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Valid IDs -->
            <div v-if="booking.valid_ids" class="mt-4">
              <h4 class="font-medium text-base mb-2 text-foreground">Valid IDs</h4>
              <div class="flex gap-6 flex-wrap">
                <div v-if="booking.valid_ids.id1" class="flex flex-col items-center">
                  <img
                    :src="'data:image/*;base64,' + booking.valid_ids.id1"
                    alt="Valid ID 1"
                    class="w-32 h-20 object-cover border rounded-lg mb-1 cursor-pointer hover:opacity-80 transition shadow"
                    @click="viewValidId(booking.valid_ids.id1, 'ID 1', booking.created_at)"
                  />
                  <span class="text-xs text-muted-foreground">ID 1</span>
                </div>
                <div v-if="booking.valid_ids.id2" class="flex flex-col items-center">
                  <img
                    :src="'data:image/*;base64,' + booking.valid_ids.id2"
                    alt="Valid ID 2"
                    class="w-32 h-20 object-cover border rounded-lg mb-1 cursor-pointer hover:opacity-80 transition shadow"
                    @click="viewValidId(booking.valid_ids.id2, 'ID 2', booking.created_at)"
                  />
                  <span class="text-xs text-muted-foreground">ID 2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <PaymentProofDialog
      v-if="paymentProofDialogOpen && selectedDialogImage"
      v-model:open="paymentProofDialogOpen"
      :image-url="selectedDialogImage.imageUrl"
      :payment-date="selectedDialogImage.date"
      :title="selectedDialogImage.title"
      :description="selectedDialogImage.description"
    />
    <ConfirmPaymentDialog
      :open="showConfirmDialog"
      :loading="confirmingPayment === (paymentToConfirm && paymentToConfirm.id)"
      :payment-type="paymentToConfirm?.type || ''"
      @update:open="showConfirmDialog = $event"
      @confirm="confirmPaymentAction"
    />
    <RejectPaymentDialog
      :open="showRejectDialog"
      :loading="rejectingPayment === (paymentToReject && paymentToReject.id)"
      :payment-type="paymentToReject?.type || ''"
      @update:open="showRejectDialog = $event"
      @confirm="rejectPaymentAction"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Loading from '@/components/features/Loading.vue'
import PaymentProofDialog from '@/components/features/bookings/PaymentProofDialog.vue'
import ConfirmPaymentDialog from '@/components/features/ConfirmPaymentDialog.vue'
import RejectPaymentDialog from '@/components/features/RejectPaymentDialog.vue'
import {
  useAdminBookings,
  useConfirmPayment,
  useRejectPayment,
} from '@/services/admin/booking-service'
import { toast } from 'vue-sonner'
import { getStatusVariant } from '@/lib/utils'

import { CalendarDays, CreditCard, Receipt, ShieldCheck, Truck } from 'lucide-vue-next'

const { data: bookings, error, isLoading, refetch } = useAdminBookings()
const selectedPayment = ref(null)
const confirmingPayment = ref(null)
const rejectingPayment = ref(null)
const paymentProofDialogOpen = ref(false)
const selectedDialogImage = ref(null)
const showConfirmDialog = ref(false)
const paymentToConfirm = ref(null)
const showRejectDialog = ref(false)
const paymentToReject = ref(null)

const confirmPayment = useConfirmPayment()
const rejectPayment = useRejectPayment()

function formatDate(date, pretty = false) {
  const d = new Date(date)
  if (pretty) {
    // Example: May 29, 2025 · 10:36 AM
    return d
      .toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      .replace(',', '')
      .replace(/(\d{4}) (\d{1,2}):(\d{2})/, '$1 · $2:$3')
  }
  return d.toLocaleString()
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
  selectedDialogImage.value = {
    imageUrl: payment.proof_image,
    date: payment.created_at,
    title: 'Payment Proof',
    description: `Payment proof image submitted ${formatDate(payment.created_at)}`,
  }
  paymentProofDialogOpen.value = true
}

function viewValidId(image, label, date) {
  selectedDialogImage.value = {
    imageUrl: 'data:image/*;base64,' + image,
    date: date,
    title: `${label} (Valid ID)`,
    description: `Uploaded ${formatDate(date)} as ${label}`,
  }
  paymentProofDialogOpen.value = true
}

function openConfirmDialog(payment) {
  paymentToConfirm.value = payment
  showConfirmDialog.value = true
}

function openRejectDialog(payment) {
  paymentToReject.value = payment
  showRejectDialog.value = true
}

async function confirmPaymentAction() {
  if (!paymentToConfirm.value) return
  showConfirmDialog.value = false
  await handleConfirmPayment(paymentToConfirm.value.id)
  paymentToConfirm.value = null
}

async function rejectPaymentAction() {
  if (!paymentToReject.value) return
  showRejectDialog.value = false
  await handleRejectPayment(paymentToReject.value.id)
  paymentToReject.value = null
}
</script>
