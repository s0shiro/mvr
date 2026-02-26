<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Booking Overview Header -->
    <div
      class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
    >
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle class="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Booking Completed
              <Badge variant="success" class="text-xs">✓ Completed</Badge>
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Executed on {{ formatDate(details.executed_at) }}
            </p>
            <div class="flex items-center gap-4 mt-3">
              <div class="flex items-center gap-1 text-sm">
                <Calendar class="w-4 h-4 text-gray-500" />
                <span class="text-gray-600 dark:text-gray-400">{{ details.period }}</span>
              </div>
              <div class="flex items-center gap-1 text-sm">
                <Car class="w-4 h-4 text-gray-500" />
                <span class="text-gray-600 dark:text-gray-400">{{ details.vehicle.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-end">
          <div class="text-right">
            <div class="text-3xl font-bold text-green-600 dark:text-green-400">
              ₱{{ Number(details.rental_amount).toLocaleString() }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Total Rental Amount
            </div>
            <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {{ details.rental_amount_words }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card class="border-l-4 border-l-blue-500">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Customer</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ details.customer_name }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ details.customer_address }}</p>
            </div>
            <User class="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card class="border-l-4 border-l-purple-500">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicle</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ details.vehicle.name }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ details.vehicle.brand }} {{ details.vehicle.model }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500">{{ details.vehicle.year }}</p>
            </div>
            <Car class="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card class="border-l-4 border-l-amber-500">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Security Deposit</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                ₱{{ Number(details.security_deposit).toLocaleString() }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ details.security_deposit_words }}
              </p>
              <div v-if="details.vehicle_return?.deposit_status" class="mt-2">
                <Badge
                  :variant="
                    details.vehicle_return.deposit_status === 'refunded'
                      ? 'success'
                      : details.vehicle_return.deposit_status === 'withheld'
                        ? 'destructive'
                        : 'secondary'
                  "
                  class="text-xs"
                >
                  {{
                    details.vehicle_return.deposit_status === 'refunded'
                      ? `Refunded ₱${Number(details.vehicle_return.deposit_refund_amount || 0).toLocaleString()}`
                      : details.vehicle_return.deposit_status === 'withheld'
                        ? 'Withheld'
                        : 'Pending Refund'
                  }}
                </Badge>
              </div>
            </div>
            <Shield class="w-8 h-8 text-amber-500" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Detailed Information Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Booking Details -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <FileText class="w-5 h-5" />
            Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Rate</p>
              <p class="text-lg font-semibold">
                ₱{{ Number(details.daily_rate).toLocaleString() }}
              </p>
              <p class="text-xs text-gray-500">{{ details.daily_rate_words }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Hourly Rate</p>
              <p class="text-lg font-semibold">₱{{ details.hourly_rate }}</p>
            </div>
          </div>

          <div class="pt-4 border-t">
            <div class="flex items-center gap-2 text-sm">
              <Clock class="w-4 h-4 text-gray-500" />
              <span class="font-medium">Release Date:</span>
              <span>{{ formatDate(details.release_date) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Payment Summary -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <CreditCard class="w-5 h-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div
              class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span class="font-medium">Total Payments</span>
              <span class="text-lg font-bold text-green-600"
                >₱{{
                  Number(
                    Number(details.rental_amount || 0) +
                      Number(details.vehicle_return?.late_fee || 0) +
                      Number(details.vehicle_return?.damage_fee || 0) +
                      Number(details.vehicle_return?.cleaning_fee || 0),
                  ).toLocaleString()
                }}</span
              >
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ details.payments.length }} payment{{
                details.payments.length !== 1 ? 's' : ''
              }}
              recorded
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Payments Timeline -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <CreditCard class="w-5 h-5" />
          Payment History
        </CardTitle>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ details.payments.length }} payment{{
            details.payments.length !== 1 ? 's' : ''
          }}
          processed
        </p>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div
            v-for="(payment, index) in details.payments"
            :key="payment.id"
            class="flex items-start gap-4 p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50"
          >
            <div class="flex-shrink-0">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center"
                :class="
                  payment.type === 'deposit'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-blue-100 text-blue-600'
                "
              >
                <ShieldCheck v-if="payment.type === 'deposit'" class="w-5 h-5" />
                <Receipt v-else class="w-5 h-5" />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <h4 class="font-semibold capitalize">{{ payment.type }}</h4>
                  <Badge
                    :variant="
                      payment.status === 'approved'
                        ? 'success'
                        : payment.status === 'pending'
                          ? 'warning'
                          : 'destructive'
                    "
                    class="text-xs"
                  >
                    {{ payment.status }}
                  </Badge>
                </div>
              </div>

              <div
                class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3"
              >
                <div><span class="font-medium">Method:</span> {{ payment.method }}</div>
                <div>
                  <span class="font-medium">Reference:</span> {{ payment.reference_number }}
                </div>
                <div>
                  <span class="font-medium">Created:</span> {{ formatDate(payment.created_at) }}
                </div>
                <div>
                  <span class="font-medium">Approved:</span>
                  {{ payment.approved_at ? formatDate(payment.approved_at) : '—' }}
                </div>
              </div>

              <div v-if="payment.proof_image" class="mt-3">
                <button
                  @click="openPaymentProofDialog(payment.proof_image, payment.created_at)"
                  class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-700 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Eye class="w-4 h-4" />
                  View Payment Proof
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Vehicle Release & Return -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Vehicle Release -->
      <Card v-if="details.vehicle_release">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Truck class="w-5 h-5 text-blue-500" />
            Vehicle Release
          </CardTitle>
          <p class="text-sm text-gray-600 dark:text-gray-400">Vehicle handed over to customer</p>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Release Date</p>
              <p class="text-base font-semibold">
                {{ formatDate(details.vehicle_release.released_at) }}
              </p>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Odometer</p>
              <p class="text-base font-semibold">{{ details.vehicle_release.odometer }}</p>
            </div>
          </div>

          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Fuel Level</p>
            <p class="text-base">{{ details.vehicle_release.fuel_level }}</p>
          </div>

          <div v-if="details.vehicle_release.condition_notes" class="space-y-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Condition Notes</p>
            <p class="text-base bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              {{ details.vehicle_release.condition_notes }}
            </p>
          </div>

          <div
            v-if="details.vehicle_release.images && details.vehicle_release.images.length"
            class="space-y-2"
          >
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Release Photos</p>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <img
                v-for="(img, idx) in details.vehicle_release.images"
                :key="idx"
                :src="img"
                class="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                @click="openImageDialog(img, 'Release Photo ' + (idx + 1))"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Vehicle Return -->
      <Card v-if="details.vehicle_return">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <RotateCcw class="w-5 h-5 text-green-500" />
            Vehicle Return
          </CardTitle>
          <p class="text-sm text-gray-600 dark:text-gray-400">Vehicle returned and inspected</p>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Return Date</p>
              <p class="text-base font-semibold">
                {{ formatDate(details.vehicle_return.returned_at) }}
              </p>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Odometer</p>
              <p class="text-base font-semibold">{{ details.vehicle_return.odometer }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Fuel Level</p>
              <p class="text-base">{{ details.vehicle_return.fuel_level }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Late Fee</p>
              <p class="text-base font-semibold text-red-600">
                ₱{{ Number(details.vehicle_return.late_fee).toLocaleString() }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Damage Fee</p>
              <p class="text-base font-semibold text-red-600">
                ₱{{ Number(details.vehicle_return.damage_fee).toLocaleString() }}
              </p>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Cleaning Fee</p>
              <p class="text-base font-semibold text-red-600">
                ₱{{ Number(details.vehicle_return.cleaning_fee).toLocaleString() }}
              </p>
            </div>
          </div>

          <div v-if="details.vehicle_return.condition_notes" class="space-y-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Return Notes</p>
            <p class="text-base bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              {{ details.vehicle_return.condition_notes }}
            </p>
          </div>

          <div
            v-if="details.vehicle_return.images && details.vehicle_return.images.length"
            class="space-y-2"
          >
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Return Photos</p>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <img
                v-for="(img, idx) in details.vehicle_return.images"
                :key="idx"
                :src="img"
                class="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                @click="openImageDialog(img, 'Return Photo ' + (idx + 1))"
              />
            </div>
          </div>

          <!-- Deposit Refund Section -->
          <div
            v-if="details.vehicle_return.deposit_status"
            class="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4"
          >
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                Deposit Refund Status
              </p>
              <Badge
                :variant="
                  details.vehicle_return.deposit_status === 'refunded'
                    ? 'success'
                    : details.vehicle_return.deposit_status === 'withheld'
                      ? 'destructive'
                      : 'secondary'
                "
              >
                {{
                  details.vehicle_return.deposit_status === 'refunded'
                    ? '✓ Refunded'
                    : details.vehicle_return.deposit_status === 'withheld'
                      ? '⚠ Withheld'
                      : '⏳ Pending'
                }}
              </Badge>
            </div>

            <div
              v-if="details.vehicle_return.deposit_status === 'refunded'"
              class="grid grid-cols-2 gap-4"
            >
              <div class="space-y-1">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Refund Amount</p>
                <p class="text-base font-semibold text-green-600">
                  ₱{{ Number(details.vehicle_return.deposit_refund_amount || 0).toLocaleString() }}
                </p>
              </div>
              <div v-if="details.vehicle_return.refund_method" class="space-y-1">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Refund Method</p>
                <p class="text-base capitalize">
                  {{ details.vehicle_return.refund_method?.replace('_', ' ') }}
                </p>
              </div>
            </div>

            <div v-if="details.vehicle_return.deposit_refund_notes" class="space-y-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Refund Notes</p>
              <p class="text-base bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                {{ details.vehicle_return.deposit_refund_notes }}
              </p>
            </div>

            <div
              v-if="
                details.vehicle_return.deposit_refund_proof &&
                details.vehicle_return.deposit_refund_proof.length
              "
              class="space-y-2"
            >
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Refund Proof</p>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <img
                  v-for="(img, idx) in details.vehicle_return.deposit_refund_proof"
                  :key="idx"
                  :src="img"
                  class="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                  @click="openImageDialog(img, 'Refund Proof ' + (idx + 1))"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Payment Proof Dialog -->
    <PaymentProofDialog
      v-model:open="paymentProofDialogOpen"
      :image-url="selectedPaymentProof.imageUrl"
      :payment-date="selectedPaymentProof.paymentDate"
    />

    <!-- Image Dialog -->
    <Dialog v-model:open="imageDialogOpen">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{{ selectedImage.title }}</DialogTitle>
        </DialogHeader>
        <div class="flex justify-center">
          <img
            :src="selectedImage.url"
            :alt="selectedImage.title"
            class="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import PaymentProofDialog from '@/components/features/bookings/PaymentProofDialog.vue'
import {
  User,
  MapPin,
  CalendarDays,
  Clock,
  Car,
  ShieldCheck,
  Receipt,
  CreditCard,
  Truck,
  RotateCcw,
  CheckCircle,
  Calendar,
  FileText,
  Shield,
  Eye,
} from 'lucide-vue-next'

const paymentProofDialogOpen = ref(false)
const selectedPaymentProof = ref({
  imageUrl: '',
  paymentDate: '',
})

const imageDialogOpen = ref(false)
const selectedImage = ref({
  url: '',
  title: '',
})

function openPaymentProofDialog(imageUrl, paymentDate) {
  selectedPaymentProof.value = {
    imageUrl,
    paymentDate,
  }
  paymentProofDialogOpen.value = true
}

function openImageDialog(imageUrl, title) {
  selectedImage.value = {
    url: imageUrl,
    title: title,
  }
  imageDialogOpen.value = true
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

const props = defineProps({
  details: { type: Object, required: true },
})
</script>
