<template>
  <div class="container space-y-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Canceled Bookings History</h1>
    </div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading canceled bookings..." />
    </div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>
    <div v-else>
      <div v-if="!bookings.length" class="h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center space-y-4">
        <div class="w-24 h-24 mx-auto mb-4 opacity-50">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-muted-foreground">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m15 9-6 6"></path>
            <path d="m9 9 6 6"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-foreground">No canceled bookings found</h3>
        <p class="text-muted-foreground max-w-md">
          Canceled bookings will appear here when reservations have been cancelled by either customers or administrators. Each canceled booking will show the reason and any refund details.
        </p>
      </div>
      <div v-else class="space-y-6">
        <Card v-for="booking in bookings" :key="booking.id" class="border border-border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden">
          <!-- Header with gradient background -->
          <div class="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 px-6 py-4 border-b border-border">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <XCircle class="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-foreground">{{ booking.vehicle?.name || 'Vehicle' }}</h3>
                  <p class="text-sm text-muted-foreground">
                    <span class="font-medium">{{ booking.vehicle?.brand }}</span>
                    <span v-if="booking.vehicle"> • {{ booking.vehicle.model }} ({{ booking.vehicle.year }})</span>
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Badge variant="destructive" class="text-sm px-3 py-1">
                  <XCircle class="w-4 h-4 mr-1" />
                  {{ booking.status }}
                </Badge>
                <div class="text-right">
                  <p class="text-2xl font-bold text-red-600 dark:text-red-400">₱{{ Number(booking.total_price).toLocaleString() }}</p>
                  <p class="text-xs text-muted-foreground">Lost Revenue</p>
                </div>
              </div>
            </div>
          </div>
          
          <CardContent class="p-6">
            <!-- Customer and Booking Details -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Customer Info -->
              <div class="space-y-4">
                <div class="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <User class="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p class="font-semibold text-foreground">{{ booking.user?.name || 'Customer' }}</p>
                    <p class="text-sm text-muted-foreground">{{ booking.user?.email || 'No email' }}</p>
                  </div>
                </div>
                
                <!-- Booking Duration -->
                <div class="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <CalendarDays class="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p class="font-semibold text-foreground">{{ formatDateRange(booking.start_date, booking.end_date) }}</p>
                    <p class="text-sm text-muted-foreground">{{ calculateDuration(booking.start_date, booking.end_date) }} rental</p>
                  </div>
                </div>

                <!-- Pickup Location -->
                <div v-if="booking.pickup_type" class="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <MapPin class="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p class="font-semibold text-foreground capitalize">{{ booking.pickup_type.replace('_', ' ') }} Pickup</p>
                    <p v-if="booking.delivery_location" class="text-sm text-muted-foreground">{{ booking.delivery_location }}</p>
                    <p v-if="booking.delivery_details" class="text-sm text-muted-foreground">{{ booking.delivery_details }}</p>
                  </div>
                </div>
              </div>

              <!-- Cancellation Details -->
              <div class="space-y-4">
                <!-- Cancellation Date -->
                <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                  <Clock class="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p class="font-semibold text-red-700 dark:text-red-300">Canceled</p>
                    <p class="text-sm text-red-600 dark:text-red-400">{{ formatDate(booking.cancelled_at || booking.updated_at) }}</p>
                    <p v-if="booking.cancellation_reason" class="text-xs text-red-500 dark:text-red-400 mt-1">{{ booking.cancellation_reason }}</p>
                  </div>
                </div>

                <!-- Refund Status -->
                <div v-if="booking.refund_status" class="flex items-center gap-3 p-4 rounded-lg border" 
                     :class="getRefundStatusClasses(booking.refund_status)">
                  <component :is="getRefundStatusIcon(booking.refund_status)" class="w-5 h-5" />
                  <div class="flex-1">
                    <p class="font-semibold">{{ getRefundStatusText(booking.refund_status) }}</p>
                    <p v-if="booking.refund_processed_at" class="text-sm opacity-75">
                      Processed {{ formatDate(booking.refund_processed_at) }}
                    </p>
                    <p v-if="booking.refund_notes" class="text-xs mt-1 opacity-75">{{ booking.refund_notes }}</p>
                  </div>
                </div>

                <!-- Payment Status -->
                <div v-if="booking.payments && booking.payments.length > 0" class="space-y-2">
                  <h4 class="font-semibold text-foreground flex items-center gap-2">
                    <CreditCard class="w-4 h-4" />
                    Payment Status
                  </h4>
                  <div class="space-y-2">
                    <div v-for="payment in booking.payments" :key="payment.id" 
                         class="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p class="font-medium text-foreground capitalize">{{ payment.type }} Payment</p>
                        <p class="text-sm text-muted-foreground">{{ payment.payment_method }}</p>
                      </div>
                      <div class="text-right">
                        <Badge :variant="getStatusVariant(payment.status)" class="text-xs">
                          {{ payment.status }}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Total Amount -->
                <div class="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-lg border">
                  <DollarSign class="w-5 h-5 text-muted-foreground" />
                  <div class="flex-1">
                    <div class="flex justify-between items-center">
                      <p class="font-semibold text-foreground">Total Amount</p>
                      <p class="text-lg font-bold text-foreground">₱{{ Number(booking.total_price).toLocaleString() }}</p>
                    </div>
                    <div class="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Daily rate</span>
                      <span>₱{{ calculateDailyRate(booking.total_price, booking.start_date, booking.end_date) }}/day</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-3 pt-4 border-t border-border">
              <RouterLink :to="`/admin/bookings/${booking.id}`">
                <Button variant="outline" size="sm" class="gap-2">
                  <FileText class="w-4 h-4" />
                  View Details
                  <ChevronRight class="w-4 h-4" />
                </Button>
              </RouterLink>
              
              <!-- Refund Processing Button -->
              <Button 
                v-if="booking.refund_status === 'pending'" 
                @click="openRefundDialog(booking)"
                variant="default" 
                size="sm" 
                class="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <DollarSign class="w-4 h-4" />
                Process Refund
              </Button>
              
              <!-- View Refund Proof Button -->
              <Button 
                v-if="booking.refund_status === 'processed' && booking.refund_proof" 
                @click="viewRefundProof(booking)"
                variant="outline" 
                size="sm" 
                class="gap-2"
              >
                <FileText class="w-4 h-4" />
                View Proof
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Refund Processing Dialog -->
    <Dialog v-model:open="refundDialog.open">
      <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <DollarSign class="w-5 h-5 text-green-600" />
            Process Refund - {{ refundDialog.booking?.vehicle?.name }}
          </DialogTitle>
          <DialogDescription>
            Process the refund for this cancelled booking. Please provide proof of refund completion.
          </DialogDescription>
        </DialogHeader>

        <div v-if="refundDialog.booking" class="space-y-6">
          <!-- Customer and Booking Summary -->
          <div class="bg-muted/30 rounded-lg p-4 space-y-3">
            <div class="grid grid-cols-1 gap-4 text-sm">
              <div>
                <p class="font-medium text-muted-foreground">Customer</p>
                <p class="font-semibold">{{ refundDialog.booking.user?.name }}</p>
                <p class="text-muted-foreground">{{ refundDialog.booking.user?.email }}</p>
              </div>

              <!-- Customer Refund Account Information -->
              <div v-if="refundDialog.booking.vehicle_return || refundDialog.booking.refund_method" class="border-t border-border pt-3">
                <p class="font-medium text-muted-foreground mb-2">Customer Refund Account</p>
                <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div class="space-y-2">
                    <!-- Get refund info from vehicle_return or booking -->
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-blue-800 dark:text-blue-300">Method:</span>
                      <span class="text-sm text-blue-700 dark:text-blue-400 capitalize">
                        {{ formatRefundMethod(getRefundMethod(refundDialog.booking)) }}
                      </span>
                    </div>
                    
                    <!-- GCash Details -->
                    <div v-if="getRefundMethod(refundDialog.booking) === 'gcash'">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-blue-800 dark:text-blue-300">GCash Number:</span>
                        <span class="text-sm text-blue-700 dark:text-blue-400 font-mono">
                          {{ getRefundAccountNumber(refundDialog.booking) }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-blue-800 dark:text-blue-300">Account Name:</span>
                        <span class="text-sm text-blue-700 dark:text-blue-400">
                          {{ getRefundAccountName(refundDialog.booking) }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Bank Transfer Details -->
                    <div v-if="getRefundMethod(refundDialog.booking) === 'bank_transfer'">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-blue-800 dark:text-blue-300">Bank:</span>
                        <span class="text-sm text-blue-700 dark:text-blue-400">
                          {{ getRefundBankName(refundDialog.booking) }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-blue-800 dark:text-blue-300">Account Number:</span>
                        <span class="text-sm text-blue-700 dark:text-blue-400 font-mono">
                          {{ getRefundAccountNumber(refundDialog.booking) }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-blue-800 dark:text-blue-300">Account Name:</span>
                        <span class="text-sm text-blue-700 dark:text-blue-400">
                          {{ getRefundAccountName(refundDialog.booking) }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Cash Pickup -->
                    <div v-if="getRefundMethod(refundDialog.booking) === 'cash'">
                      <span class="text-sm text-blue-700 dark:text-blue-400">Customer will pickup cash refund</span>
                    </div>
                    
                    <!-- Customer Notes -->
                    <div v-if="getRefundCustomerNotes(refundDialog.booking)" class="border-t border-blue-200 dark:border-blue-800 pt-2 mt-2">
                      <span class="text-sm font-medium text-blue-800 dark:text-blue-300">Customer Notes:</span>
                      <p class="text-sm text-blue-700 dark:text-blue-400 italic mt-1">
                        "{{ getRefundCustomerNotes(refundDialog.booking) }}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Approved Payments Information -->
              <div>
                <p class="font-medium text-muted-foreground mb-2">Approved Payments</p>
                <div v-if="getApprovedPayments(refundDialog.booking).length > 0" class="space-y-2">
                  <div 
                    v-for="payment in getApprovedPayments(refundDialog.booking)" 
                    :key="payment.id"
                    class="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800"
                  >
                    <div>
                      <p class="font-medium text-green-700 dark:text-green-300 capitalize">{{ payment.type }} Payment</p>
                      <p class="text-xs text-green-600 dark:text-green-400">{{ payment.method }}</p>
                    </div>
                    <p class="font-bold text-green-700 dark:text-green-300">₱{{ getPaymentAmount(payment, refundDialog.booking).toLocaleString() }}</p>
                  </div>
                </div>
                <div v-else class="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded border border-yellow-200 dark:border-yellow-800">
                  <p class="text-yellow-700 dark:text-yellow-300 text-sm">No approved payments found for this booking.</p>
                </div>
              </div>
            </div>
            <div v-if="refundDialog.booking.cancellation_reason" class="pt-2 border-t border-border">
              <p class="font-medium text-muted-foreground text-sm">Cancellation Reason</p>
              <p class="text-sm">{{ refundDialog.booking.cancellation_reason }}</p>
            </div>
          </div>

          <!-- Refund Form -->
          <form @submit.prevent="processRefund" class="space-y-4">
            <!-- Refund Amount -->
            <div class="space-y-2">
              <Label for="refund-amount">Refund Amount (₱)</Label>
              <input
                id="refund-amount"
                v-model="refundForm.amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter refund amount"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <!-- Refund Notes -->
            <div class="space-y-2">
              <Label for="refund-notes">Refund Notes</Label>
              <Textarea
                id="refund-notes"
                v-model="refundForm.notes"
                placeholder="Add any notes about the refund process..."
                rows="3"
                class="resize-none"
              />
            </div>

            <!-- Refund Proof Upload -->
            <div class="space-y-2">
              <Label for="refund-proof">Refund Proof (Required)</Label>
              <div class="grid w-full max-w-sm items-center gap-1.5">
                <Label
                  for="refund-proof"
                  :class="[
                    'flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed',
                    'text-sm text-muted-foreground hover:bg-muted transition-colors',
                    refundForm.proof ? 'border-primary' : 'border-border',
                  ]"
                >
                  <div v-if="refundForm.proof" class="relative w-full h-full">
                    <img
                      :src="refundForm.proof"
                      alt="Refund Proof"
                      class="w-full h-full object-contain rounded-md"
                    />
                    <div
                      class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      Click to change
                    </div>
                  </div>
                  <div v-else class="flex flex-col items-center gap-1">
                    <FileText class="h-10 w-10 text-muted-foreground" />
                    <span>Click to upload refund proof</span>
                  </div>
                </Label>
                <input
                  id="refund-proof"
                  ref="refundProofInput"
                  type="file"
                  accept="image/*,.pdf"
                  @change="handleRefundProofUpload"
                  class="sr-only"
                  required
                />
              </div>
              <p class="text-xs text-muted-foreground">Upload a screenshot or receipt showing the refund was processed</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" @click="refundDialog.open = false">
                Cancel
              </Button>
              <Button 
                type="submit" 
                :disabled="refundForm.processing || !refundForm.proof || !refundForm.amount || Number(refundForm.amount) <= 0"
                class="bg-green-600 hover:bg-green-700"
              >
                <Loader2 v-if="refundForm.processing" class="w-4 h-4 mr-2 animate-spin" />
                <DollarSign v-else class="w-4 h-4 mr-2" />
                {{ refundForm.processing ? 'Processing...' : 'Complete Refund' }}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Refund Proof Viewer Dialog -->
    <Dialog v-model:open="proofDialog.open">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Refund Proof</DialogTitle>
        </DialogHeader>
        <div v-if="proofDialog.proof" class="text-center">
          <img 
            v-if="isImageFile(proofDialog.proof)"
            :src="proofDialog.proof" 
            alt="Refund proof"
            class="max-w-full h-auto rounded-lg shadow-lg mx-auto"
          />
          <div v-else class="p-8 border-2 border-dashed border-muted-foreground rounded-lg">
            <FileText class="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p class="text-muted-foreground mb-4">PDF file - Click below to view</p>
            <Button @click="openProofFile(proofDialog.proof)" variant="outline">
              <FileText class="w-4 h-4 mr-2" />
              Open PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { useAdminCanceledBookings } from '@/services/admin/canceled-bookings-service'
import { useBookingService } from '@/services/booking-service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'vue-sonner'
import Loading from '@/components/features/Loading.vue'
import { getStatusVariant } from '@/lib/utils'
import { 
  FileText, 
  XCircle, 
  Car, 
  User, 
  Mail, 
  Calendar, 
  CalendarDays, 
  Clock, 
  MapPin, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const bookingService = useBookingService()

// Refund Dialog
const refundDialog = ref({
  open: false,
  booking: null
})

const refundForm = reactive({
  amount: '',
  notes: '',
  proof: null,
  processing: false
})

const refundProofInput = ref(null)

// Proof Viewer Dialog
const proofDialog = ref({
  open: false,
  proof: null
})

function openRefundDialog(booking) {
  refundDialog.value.booking = booking
  refundDialog.value.open = true
  refundForm.amount = ''
  refundForm.notes = ''
  refundForm.proof = null
  refundForm.processing = false
}

function handleRefundProofUpload(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      refundForm.proof = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

async function processRefund() {
  if (!refundForm.amount || Number(refundForm.amount) <= 0) {
    toast.error("Please enter a valid refund amount")
    return
  }
  
  if (!refundForm.proof) {
    toast.error("Please upload refund proof")
    return
  }

  refundForm.processing = true
  
  try {
    const data = {
      amount: refundForm.amount,
      notes: refundForm.notes,
      refund_proof: refundForm.proof
    }

    await bookingService.processRefund(refundDialog.value.booking.id, data)
    
    toast.success("Refund has been processed successfully")
    
    refundDialog.value.open = false
    
    // Refresh the bookings list
    window.location.reload()
    
  } catch (error) {
    console.error('Error processing refund:', error)
    toast.error(error.response?.data?.message || "Failed to process refund")
  } finally {
    refundForm.processing = false
  }
}

function viewRefundProof(booking) {
  proofDialog.value.proof = booking.refund_proof
  proofDialog.value.open = true
}

function isImageFile(data) {
  // Check if it's a base64 image
  if (typeof data === 'string' && data.startsWith('data:image/')) {
    return true
  }
  // Fallback for file extensions (legacy)
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(data)
}

function openProofFile(url) {
  window.open(url, '_blank')
}

function getRefundStatusClasses(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
    case 'processed':
      return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
    case 'failed':
      return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
    default:
      return 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
  }
}

function getRefundStatusIcon(status) {
  switch (status) {
    case 'pending':
      return Clock
    case 'processed':
      return CheckCircle
    case 'failed':
      return AlertTriangle
    default:
      return Clock
  }
}

function getRefundStatusText(status) {
  switch (status) {
    case 'pending':
      return 'Refund Pending'
    case 'processed':
      return 'Refund Processed'
    case 'failed':
      return 'Refund Failed'
    default:
      return 'Unknown Status'
  }
}

function getApprovedPayments(booking) {
  if (!booking || !booking.payments) return []
  return booking.payments.filter(payment => payment.status === 'approved')
}

function getPaymentAmount(payment, booking) {
  // Use actual payment amounts based on type
  if (payment.type === 'deposit') {
    // Use the actual vehicle deposit amount
    return Number(booking.vehicle?.deposit || 0)
  } else if (payment.type === 'rental') {
    // Rental payment is the full total price
    return Number(booking.total_price || 0)
  }
  
  return 0
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startStr} - ${endStr}`
}

function formatRefundMethod(method) {
  switch (method) {
    case 'gcash':
      return 'GCash'
    case 'bank_transfer':
      return 'Bank Transfer'
    case 'cash':
      return 'Cash Pickup'
    default:
      return method || 'Not specified'
  }
}

// Helper functions to get refund info from vehicle_return or booking
function getRefundMethod(booking) {
  return booking.vehicle_return?.customer_refund_method || booking.refund_method
}

function getRefundAccountNumber(booking) {
  return booking.vehicle_return?.customer_account_number || booking.refund_account_number
}

function getRefundAccountName(booking) {
  return booking.vehicle_return?.customer_account_name || booking.refund_account_name
}

function getRefundBankName(booking) {
  return booking.vehicle_return?.customer_bank_name || booking.refund_bank_name
}

function getRefundCustomerNotes(booking) {
  return booking.vehicle_return?.customer_refund_notes || booking.refund_customer_notes
}

function calculateDuration(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1 ? '1 day' : `${diffDays} days`
}

function calculateDays(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function calculateDailyRate(totalPrice, startDate, endDate) {
  const days = calculateDays(startDate, endDate)
  const dailyRate = Number(totalPrice) / days
  return dailyRate.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

const { data, error, isLoading } = useAdminCanceledBookings()
const bookings = computed(() => data.value || [])
</script>
