<template>
  <Dialog :open="open" @update:open="(val) => $emit('close')">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-6">
      <DialogHeader>
        <DialogTitle>Payment Details</DialogTitle>
        <DialogDescription>
          Complete information for payment #{{ payment.id }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="space-y-6">
        <!-- Payment Info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label class="text-sm font-medium text-gray-500">Payment ID</Label>
            <p class="text-lg font-semibold">#{{ payment.id }}</p>
          </div>
          <div>
            <Label class="text-sm font-medium text-gray-500">Booking ID</Label>
            <p class="text-lg font-semibold">#{{ payment.booking_id }}</p>
          </div>
          <div>
            <Label class="text-sm font-medium text-gray-500">Type</Label>
            <span :class="getTypeClass(payment.type)" class="inline-block px-2 py-1 rounded-full text-xs font-medium mt-1">
              {{ payment.type }}
            </span>
          </div>
          <div>
            <Label class="text-sm font-medium text-gray-500">Status</Label>
            <span :class="getStatusClass(payment.status)" class="inline-block px-2 py-1 rounded-full text-xs font-medium mt-1">
              {{ payment.status }}
            </span>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="border-t pt-4">
          <h4 class="font-semibold mb-3">Customer Information</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-gray-500">Name</Label>
              <p>{{ payment.booking?.user?.name || 'N/A' }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-gray-500">Email</Label>
              <p class="break-all">{{ payment.booking?.user?.email || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Payment Details -->
        <div class="border-t pt-4">
          <h4 class="font-semibold mb-3">Payment Information</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-gray-500">Method</Label>
              <p>{{ getPaymentMethodLabel(payment.method) }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-gray-500">Reference Number</Label>
              <p class="font-mono text-sm break-all">{{ payment.reference_number }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-gray-500">Amount</Label>
              <p class="text-lg font-semibold text-green-600">₱{{ getPaymentAmount(payment) }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-gray-500">Date Submitted</Label>
              <p class="text-sm">{{ formatDate(payment.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Proof of Payment -->
        <div class="border-t pt-4" v-if="payment.proof_image">
          <h4 class="font-semibold mb-3">Proof of Payment</h4>
          <div class="flex justify-center">
            <img 
              :src="payment.proof_image" 
              alt="Proof of Payment" 
              class="max-w-full max-h-64 sm:max-h-96 rounded-lg border shadow-lg cursor-pointer"
              @click="openImageModal"
            />
          </div>
        </div>

        <!-- Booking Details -->
        <div class="border-t pt-4" v-if="payment.booking">
          <h4 class="font-semibold mb-3">Booking Information</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-gray-500">Vehicle</Label>
              <p>{{ payment.booking.vehicle?.brand }} {{ payment.booking.vehicle?.model }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-gray-500">Rental Period</Label>
              <p class="text-sm">{{ formatDate(payment.booking.start_date) }} - {{ formatDate(payment.booking.end_date) }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-gray-500">Total Amount</Label>
              <p class="font-semibold">₱{{ payment.booking.total_price }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-gray-500">Deposit Amount</Label>
              <p class="font-semibold">₱{{ payment.booking.vehicle?.deposit }}</p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="flex flex-col sm:flex-row gap-2 pt-4">
        <Button variant="outline" @click="viewBooking" class="w-full sm:w-auto">
          View Booking
        </Button>
        <Button variant="secondary" @click="$emit('close')" class="w-full sm:w-auto">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const props = defineProps({
  open: { type: Boolean, required: true },
  payment: { type: Object, required: true },
})

const emit = defineEmits(['close'])
const router = useRouter()

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getPaymentMethodLabel(method) {
  const methods = {
    'gcash': 'GCash',
    'maya': 'Maya',
    'bank_transfer': 'Bank Transfer',
    'cash': 'Cash'
  }
  return methods[method] || method
}

function getTypeClass(type) {
  return type === 'deposit' 
    ? 'bg-blue-100 text-blue-800' 
    : 'bg-green-100 text-green-800'
}

function getStatusClass(status) {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getPaymentAmount(payment) {
  if (payment.type === 'deposit') {
    return payment.booking?.vehicle?.deposit || 0
  } else {
    return payment.booking?.total_price || 0
  }
}

function viewBooking() {
  router.push({ name: 'admin-booking-details', params: { id: props.payment.booking_id } })
}

function openImageModal() {
  // TODO: Implement image modal for full view
  window.open(props.payment.proof_image, '_blank')
}
</script>
