<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <!-- Header & Controls -->
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 id="my-bookings-header" class="text-2xl sm:text-3xl font-bold flex items-center gap-3" data-tour="page-title">
          <ClipboardList class="w-7 h-7 text-primary" />
          My Bookings
        </h1>
        <Button variant="outline" size="sm" @click="startTour" class="gap-1" data-tour="guide-btn">
          <Clock class="w-4 h-4" />
          Guide
        </Button>
      </div>
      <div class="bg-card border rounded-lg p-4 sm:p-6 shadow-sm" data-tour="controls-section">
        <div class="flex flex-col xl:flex-row gap-6 xl:items-end xl:justify-between">
          <div class="flex flex-col lg:flex-row gap-6 items-start lg:items-end flex-1">
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div class="flex flex-col gap-2 min-w-0">
                <Label for="sort-by" class="text-sm font-medium text-muted-foreground">Sort by:</Label>
                <select id="sort-by" v-model="sortBy" class="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="created_at">Booking Date</option>
                  <option value="start_date">Rental Start Date</option>
                  <option value="end_date">Rental End Date</option>
                  <option value="total_price">Amount</option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <Label class="text-sm font-medium text-muted-foreground">Order:</Label>
                <div class="flex items-center gap-0 border rounded-md overflow-hidden">
                  <Button variant="ghost" size="sm" :class="['px-4 py-2 rounded-none border-r h-10', sortOrder === 'desc' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted']" @click="sortOrder = 'desc'">
                    <TrendingDown class="w-4 h-4 mr-2" /> Desc
                  </Button>
                  <Button variant="ghost" size="sm" :class="['px-4 py-2 rounded-none h-10', sortOrder === 'asc' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted']" @click="sortOrder = 'asc'">
                    <TrendingUp class="w-4 h-4 mr-2" /> Asc
                  </Button>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2 flex-1 min-w-0">
              <Label class="text-sm font-medium text-muted-foreground">Filter by Status:</Label>
              <Tabs v-model="statusFilter" class="w-full">
                <TabsList class="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-10">
                  <TabsTrigger value="" class="text-xs sm:text-sm">All</TabsTrigger>
                  <TabsTrigger value="pending" class="text-xs sm:text-sm">Pending</TabsTrigger>
                  <TabsTrigger value="confirmed" class="text-xs sm:text-sm">Confirmed</TabsTrigger>
                  <TabsTrigger value="for_release" class="text-xs sm:text-sm">For Release</TabsTrigger>
                  <TabsTrigger value="released" class="text-xs sm:text-sm">Released</TabsTrigger>
                  <TabsTrigger value="cancelled" class="text-xs sm:text-sm">Canceled</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <div v-if="bookings.length > 0" class="flex items-center justify-end">
            <Button variant="outline" size="sm" @click="toggleAllCards" class="flex items-center gap-2 h-10 px-4">
              <Minimize2 v-if="!globalMinimized" class="w-4 h-4" />
              <Maximize2 v-else class="w-4 h-4" />
              {{ globalMinimized ? 'Expand All' : 'Minimize All' }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <Loading text="Loading your bookings..." />
    </div>
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-600 font-medium">{{ error.message }}</div>
    </div>
    <div v-else>
      <BookingBanners :bookingsNeedingAttention="bookingsNeedingAttention" :bookingsNeedingRefundDetails="bookingsNeedingRefundDetails" class="mb-6" />
      <div v-if="!bookings.length" class="text-center py-16">
        <div class="w-16 h-16 mx-auto mb-6 opacity-50">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-muted-foreground">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-foreground mb-2">{{ statusFilter ? `No ${formatStatusText(statusFilter)} bookings` : 'No bookings yet' }}</h3>
        <p class="text-muted-foreground max-w-md mx-auto mb-6">
          {{ statusFilter ? `You don't have any bookings with ${formatStatusText(statusFilter)} status.` : 'Start your journey by browsing our available vehicles and creating your first booking.' }}
        </p>
        <Button as-child variant="default" size="lg">
          <RouterLink to="/vehicles" class="flex items-center gap-2">
            <Car class="w-4 h-4" /> Browse Vehicles
          </RouterLink>
        </Button>
      </div>
      <div v-else class="space-y-6">
        <BookingCard
          v-for="(booking, idx) in bookings"
          :key="booking.id"
          :booking="booking"
          :idx="idx"
          :isCardMinimized="isCardMinimized"
          :toggleCardMinimized="toggleCardMinimized"
          :formatDate="formatDate"
          :getStatusVariant="getStatusVariant"
          :getBookingStatusLabel="getBookingStatusLabel"
          :requiresDeposit="requiresDeposit"
          :shouldShowCancelButton="shouldShowCancelButton"
          :shouldShowEditButton="shouldShowEditButton"
          :openEditDialog="openEditDialog"
          :openCancelDialog="openCancelDialog"
          :openReturnDialog="openReturnDialog"
          :openContractDialog="openContractDialog"
          :needsRefundDetails="needsRefundDetails"
          :openRefundDetailsDialog="openRefundDetailsDialog"
          :getPaymentTimeline="getPaymentTimeline"
          :getPaymentButtonMeta="getPaymentButtonMeta"
          :viewPayments="viewPayments"
          :getRefundStatusClasses="getRefundStatusClasses"
          :getRefundStatusIconBg="getRefundStatusIconBg"
          :getRefundStatusIcon="getRefundStatusIcon"
          :getRefundStatusIconColor="getRefundStatusIconColor"
          :getRefundStatusTextColor="getRefundStatusTextColor"
          :getRefundStatusText="getRefundStatusText"
          :openRefundProofDialog="openRefundProofDialog"
        />
      </div>

      <PaymentDialog
        v-if="paymentDialogBookingId"
        :bookingId="paymentDialogBookingId"
        v-model:open="paymentDialogOpen"
        :onClose="closePaymentDialog"
        :type="paymentDialogType"
        @paid="() => { closePaymentDialog(); toast.success('Payment submitted!'); data.refetch && data.refetch() }"
      />
      <EditBookingDialog v-if="editDialogOpen" :booking="editBooking" :open="editDialogOpen" @update:open="editDialogOpen = $event" @updated="() => refetch()" />
      <CustomerReturnDialog v-if="returnDialogOpen" :booking="selectedReturnBooking" :open="returnDialogOpen" @update:open="returnDialogOpen = $event" @submitted="onReturnSubmitted" />
      <Dialog v-model:open="refundProofDialogOpen">
        <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle class="flex items-center gap-2"><CheckCircle class="w-5 h-5 text-green-600" /> Refund Processing Proof</DialogTitle>
            <DialogDescription>Official proof that your refund has been processed by our admin team.</DialogDescription>
          </DialogHeader>
          <div v-if="selectedRefundProof" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="font-medium text-green-800">Refund Amount</p>
                  <p class="text-xl font-bold text-green-700">₱{{ Number(selectedRefundProof.refund_amount).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="font-medium text-green-800">Processed Date</p>
                  <p class="text-green-700">{{ formatDate(selectedRefundProof.refund_processed_at) }}</p>
                </div>
              </div>
              <div v-if="selectedRefundProof.refund_notes" class="mt-3 pt-3 border-t border-green-200">
                <p class="font-medium text-green-800 text-sm">Admin Notes</p>
                <p class="text-green-700 text-sm italic">"{{ selectedRefundProof.refund_notes }}"</p>
              </div>
            </div>
            <div class="text-center">
              <img v-if="isImageFile(selectedRefundProof.refund_proof)" :src="selectedRefundProof.refund_proof" alt="Refund processing proof" class="max-w-full h-auto rounded-lg shadow-lg mx-auto border" />
              <div v-else class="p-8 border-2 border-dashed border-muted-foreground rounded-lg">
                <FileText class="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p class="text-muted-foreground mb-4">PDF document - Click below to view</p>
                <Button @click="window.open(selectedRefundProof.refund_proof, '_blank')" variant="outline"><FileText class="w-4 h-4 mr-2" /> Open Document</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div v-if="contractDialogOpen" class="relative z-50">
        <div class="modal-overlay" @click="closeContractDialog"></div>
        <div class="modal-content">
          <button class="modal-close" @click="closeContractDialog">&times;</button>
          <ContractPrint :booking="selectedBooking" />
        </div>
      </div>
    </div>

    <!-- Refund Details Dialog -->
    <Dialog v-model:open="refundDetailsDialog.open">
      <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2"><Wallet class="w-5 h-5 text-amber-500" /> Provide Refund Details</DialogTitle>
          <DialogDescription>We need your refund account information so our team can process the pending refund for this canceled booking.</DialogDescription>
        </DialogHeader>
        <div v-if="refundDetailsDialog.booking" class="space-y-4">
          <div class="bg-muted/30 rounded-lg p-3 text-sm">
            <p class="font-medium">{{ refundDetailsDialog.booking.vehicle?.name }}</p>
            <p class="text-muted-foreground">{{ formatDateRange(refundDetailsDialog.booking.start_date, refundDetailsDialog.booking.end_date) }}</p>
          </div>
          <form @submit.prevent="handleSubmitRefundDetails" class="space-y-4">
            <div class="border border-border rounded-lg p-4 space-y-3">
              <div class="flex flex-col gap-2">
                <Label>Preferred Refund Method *</Label>
                <select v-model="refundDetailsForm.refund_method" required class="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground">
                  <option value="">Select refund method</option>
                  <option value="gcash">GCash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash Pickup</option>
                </select>
              </div>
              <div v-if="refundDetailsForm.refund_method === 'gcash'" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                  <Label>GCash Number *</Label>
                  <Input v-model="refundDetailsForm.account_number" type="tel" placeholder="09XXXXXXXXX" required />
                </div>
                <div class="flex flex-col gap-2">
                  <Label>Account Holder Name *</Label>
                  <Input v-model="refundDetailsForm.account_name" placeholder="Full name as registered" required />
                </div>
              </div>
              <div v-if="refundDetailsForm.refund_method === 'bank_transfer'" class="space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="flex flex-col gap-2">
                    <Label>Bank Name *</Label>
                    <Input v-model="refundDetailsForm.bank_name" placeholder="e.g. BDO, BPI, Metrobank" required />
                  </div>
                  <div class="flex flex-col gap-2">
                    <Label>Account Number *</Label>
                    <Input v-model="refundDetailsForm.account_number" placeholder="Bank account number" required />
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <Label>Account Holder Name *</Label>
                  <Input v-model="refundDetailsForm.account_name" placeholder="Full name as registered in bank" required />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <Label>{{ refundDetailsForm.refund_method === 'cash' ? 'Pickup Instructions' : 'Additional Notes' }} (optional)</Label>
                <Textarea v-model="refundDetailsForm.refund_notes" :placeholder="refundDetailsForm.refund_method === 'cash' ? 'Specify pickup location or special instructions...' : 'Any special instructions for the refund process...'" rows="2" />
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" @click="refundDetailsDialog.open = false">Cancel</Button>
              <Button type="submit" class="bg-amber-500 hover:bg-amber-600" :disabled="refundDetailsForm.processing || !refundDetailsForm.refund_method">
                <Loader2 v-if="refundDetailsForm.processing" class="w-4 h-4 mr-2 animate-spin" />
                <Wallet v-else class="w-4 h-4 mr-2" />
                {{ refundDetailsForm.processing ? 'Submitting...' : 'Submit Details' }}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Cancellation Dialog -->
    <Dialog v-model:open="cancelDialog.open">
      <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2"><AlertTriangle class="w-5 h-5 text-yellow-600" /> Cancel Booking</DialogTitle>
          <DialogDescription>Please provide a reason for canceling this booking and your refund account details if eligible for a refund.</DialogDescription>
        </DialogHeader>
        <div v-if="cancelDialog.booking" class="space-y-4">
          <div class="bg-muted/30 rounded-lg p-3 text-sm">
            <p class="font-medium">{{ cancelDialog.booking.vehicle?.name }}</p>
            <p class="text-muted-foreground">{{ formatDateRange(cancelDialog.booking.start_date, cancelDialog.booking.end_date) }}</p>
          </div>
          <div v-if="hasApprovedPayments(cancelDialog.booking)" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-sm text-blue-800"><strong>Refund Information:</strong> You have approved payments for this booking. Please provide your refund account details below for potential refund processing.</p>
          </div>
          <form @submit.prevent="handleCancelBooking" class="space-y-4">
            <div class="space-y-2">
              <Label for="cancellation-reason">Reason for Cancellation</Label>
              <Textarea id="cancellation-reason" v-model="cancelForm.reason" placeholder="Please explain why you're canceling this booking..." rows="3" class="resize-none" required />
            </div>
            <div v-if="hasApprovedPayments(cancelDialog.booking)" class="border border-border rounded-lg p-4 space-y-3">
              <h3 class="font-semibold text-foreground">Refund Account Details</h3>
              <div class="flex flex-col gap-2">
                <Label>Preferred Refund Method *</Label>
                <select v-model="cancelForm.refund_method" required class="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground">
                  <option value="">Select refund method</option>
                  <option value="gcash">GCash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash Pickup</option>
                </select>
              </div>
              <div v-if="cancelForm.refund_method === 'gcash'" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2"><Label>GCash Number *</Label><Input v-model="cancelForm.account_number" type="tel" placeholder="09XXXXXXXXX" required /></div>
                <div class="flex flex-col gap-2"><Label>Account Holder Name *</Label><Input v-model="cancelForm.account_name" placeholder="Full name as registered" required /></div>
              </div>
              <div v-if="cancelForm.refund_method === 'bank_transfer'" class="space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="flex flex-col gap-2"><Label>Bank Name *</Label><Input v-model="cancelForm.bank_name" placeholder="e.g. BDO, BPI, Metrobank" required /></div>
                  <div class="flex flex-col gap-2"><Label>Account Number *</Label><Input v-model="cancelForm.account_number" placeholder="Bank account number" required /></div>
                </div>
                <div class="flex flex-col gap-2"><Label>Account Holder Name *</Label><Input v-model="cancelForm.account_name" placeholder="Full name as registered in bank" required /></div>
              </div>
              <div class="flex flex-col gap-2">
                <Label>{{ cancelForm.refund_method === 'cash' ? 'Pickup Instructions' : 'Additional Notes' }} (optional)</Label>
                <Textarea v-model="cancelForm.refund_notes" :placeholder="cancelForm.refund_method === 'cash' ? 'Specify pickup location or special instructions...' : 'Any special instructions for the refund process...'" rows="2" />
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" @click="cancelDialog.open = false">Keep Booking</Button>
              <Button type="submit" variant="destructive" :disabled="!cancelForm.reason.trim() || cancelForm.processing">
                <Loader2 v-if="cancelForm.processing" class="w-4 h-4 mr-2 animate-spin" />
                <Ban v-else class="w-4 h-4 mr-2" />
                {{ cancelForm.processing ? 'Canceling...' : 'Cancel Booking' }}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive, watch, onMounted } from 'vue'
import { useMyBookings } from '@/services/booking-service'
import { useQueryClient } from '@tanstack/vue-query'
import BookingCard from '@/components/features/bookings/BookingCard.vue'
import BookingBanners from '@/components/features/bookings/BookingBanners.vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getStatusVariant, formatDateTimeUTC, formatDateRangeUTC } from '@/lib/utils'
import PaymentDialog from '@/components/features/bookings/PaymentDialog.vue'
import EditBookingDialog from '@/components/features/bookings/EditBookingDialog.vue'
import CustomerReturnDialog from '@/components/features/vehicle-return/CustomerReturnDialog.vue'
import ContractPrint from '@/components/features/ContractPrint.vue'
import { useCancelBooking, useSubmitRefundDetails } from '@/services/booking-service'
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
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText,
  TrendingUp,
  TrendingDown,
  Eye,
  Wallet,
} from 'lucide-vue-next'
import { RouterLink, useRouter } from 'vue-router'
import { driver as createDriver } from 'driver.js'
import 'driver.js/dist/driver.css'

const formatDate = (dateStr) => formatDateTimeUTC(dateStr)
const formatDateRange = (startDate, endDate) => formatDateRangeUTC(startDate, endDate)

function formatStatusText(status) {
  switch (status) {
    case 'pending':
      return 'pending'
    case 'confirmed':
      return 'confirmed'
    case 'for_release':
      return 'waiting for release'
    case 'released':
      return 'released'
    case 'cancelled':
      return 'cancelled'
    default:
      return status
  }
}

function getBookingStatusLabel(status) {
  switch (status) {
    case 'cancelled':
      return 'Canceled'
    case 'for_release':
      return 'Waiting for Release'
    default:
      return status
  }
}

function getRefundStatusClasses(status) {
  switch (status) {
    case 'pending':
      return 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/40 dark:to-yellow-900/20 border-yellow-300 dark:border-yellow-700'
    case 'processed':
      return 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 border-green-300 dark:border-green-700'
    case 'failed':
      return 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/20 border-red-300 dark:border-red-700'
    default:
      return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/40 dark:to-gray-900/20 border-gray-300 dark:border-gray-700'
  }
}

function getRefundStatusIconBg(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-200 dark:bg-yellow-800/50'
    case 'processed':
      return 'bg-green-200 dark:bg-green-800/50'
    case 'failed':
      return 'bg-red-200 dark:bg-red-800/50'
    default:
      return 'bg-gray-200 dark:bg-gray-800/50'
  }
}

function getRefundStatusIconColor(status) {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'processed':
      return 'text-green-600 dark:text-green-400'
    case 'failed':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

function getRefundStatusTextColor(status) {
  switch (status) {
    case 'pending':
      return 'text-yellow-800 dark:text-yellow-200'
    case 'processed':
      return 'text-green-800 dark:text-green-200'
    case 'failed':
      return 'text-red-800 dark:text-red-200'
    default:
      return 'text-gray-800 dark:text-gray-200'
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
      return 'No Payment Found'
  }
}

const queryClient = useQueryClient()
const router = useRouter()

// Sorting controls
const sortBy = ref('created_at')
const sortOrder = ref('desc')

// Status filter
const statusFilter = ref('')

const { data, error, isLoading, refetch } = useMyBookings(sortBy, sortOrder, statusFilter)
const bookings = computed(() => data.value || [])
const bookingsNeedingAttention = computed(() => bookings.value.filter((booking) => bookingNeedsAttention(booking)))
const bookingsNeedingRefundDetails = computed(() => bookings.value.filter((booking) => needsRefundDetails(booking)))

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

// Refund proof dialog state
const refundProofDialogOpen = ref(false)
const selectedRefundProof = ref(null)

// Contract dialog state
const contractDialogOpen = ref(false)
const selectedBooking = ref(null)

// Return dialog state
const returnDialogOpen = ref(false)
const selectedReturnBooking = ref(null)

// Refund details dialog state
const refundDetailsDialog = reactive({
  open: false,
  booking: null,
})

const refundDetailsForm = reactive({
  refund_method: '',
  account_number: '',
  account_name: '',
  bank_name: '',
  refund_notes: '',
  processing: false,
})

function openPaymentDialog(bookingId, type = 'deposit') {
  paymentDialogBookingId.value = bookingId
  paymentDialogType.value = type
  paymentDialogOpen.value = true
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

function openReturnDialog(booking) {
  selectedReturnBooking.value = booking
  returnDialogOpen.value = true
}

function onReturnSubmitted() {
  returnDialogOpen.value = false
  selectedReturnBooking.value = null
  toast.success('Vehicle return submitted successfully!')
  refetch()
}

function resetRefundDetailsForm(booking = null) {
  refundDetailsForm.refund_method = booking?.refund_method || ''
  refundDetailsForm.account_number = booking?.refund_account_number || ''
  refundDetailsForm.account_name = booking?.refund_account_name || ''
  refundDetailsForm.bank_name = booking?.refund_bank_name || ''
  refundDetailsForm.refund_notes = booking?.refund_customer_notes || ''
  refundDetailsForm.processing = false
}

function openRefundDetailsDialog(booking) {
  refundDetailsDialog.booking = booking
  refundDetailsDialog.open = true
  resetRefundDetailsForm(booking)
}

function needsRefundDetails(booking) {
  if (!booking || booking.status !== 'cancelled') return false
  const pendingRefund = booking.refund_status === 'pending' && Number(booking.refund_amount || 0) > 0
  const missingMethod = !booking.refund_method
  return pendingRefund && missingMethod && hasRefundEligiblePayments(booking)
}

watch(
  () => refundDetailsDialog.open,
  (open) => {
    if (!open) {
      refundDetailsDialog.booking = null
      resetRefundDetailsForm()
    }
  }
)

watch(
  () => refundDetailsForm.refund_method,
  (method) => {
    if (method === 'cash') {
      refundDetailsForm.account_number = ''
      refundDetailsForm.account_name = ''
      refundDetailsForm.bank_name = ''
    } else if (method === 'gcash') {
      refundDetailsForm.bank_name = ''
    }
  }
)

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
  return timeUntilStart > 24 * 60 * 60 * 1000
}

function shouldShowCancelButton(booking) {
  // Allow cancellation for bookings that haven't been released yet
  if (!booking || ['cancelled', 'completed', 'released', 'pending_return'].includes(booking.status)) return false
  const now = new Date()
  const start = new Date(booking.start_date)
  const timeUntilStart = start.getTime() - now.getTime()
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

function requiresDeposit(booking) {
  const type = booking?.vehicle?.type
  if (!type) return false
  const normalizedType = type.toLowerCase()
  if (normalizedType === 'motorcycle') {
    return true
  }
  return normalizedType === 'car' && !booking?.driver_requested
}

function shouldShowDepositButton(booking) {
  if (!requiresDeposit(booking)) return false
  const latestDeposit = getLatestPaymentOfType(booking, 'deposit')
  return !latestDeposit || latestDeposit.status === 'rejected'
}

function shouldShowRentalButton(booking) {
  const latestDeposit = getLatestPaymentOfType(booking, 'deposit')
  const latestRental = getLatestPaymentOfType(booking, 'rental')
  if (!requiresDeposit(booking)) {
    return !latestRental || latestRental.status === 'rejected'
  }
  if (!latestDeposit || latestDeposit.status === 'rejected') {
    return false
  }
  return (
    ['approved', 'pending'].includes(latestDeposit.status) &&
    (!latestRental || latestRental.status === 'rejected')
  )
}

const submitRefundDetails = useSubmitRefundDetails()
const cancelBooking = useCancelBooking()

async function handleSubmitRefundDetails() {
  if (!refundDetailsDialog.booking) {
    toast.error('No booking selected for refund details')
    return
  }

  if (!refundDetailsForm.refund_method) {
    toast.error('Please select a refund method')
    return
  }

  if (refundDetailsForm.refund_method === 'gcash') {
    if (!refundDetailsForm.account_number || !refundDetailsForm.account_name) {
      toast.error('Please provide your GCash number and account holder name')
      return
    }
  }

  if (refundDetailsForm.refund_method === 'bank_transfer') {
    if (!refundDetailsForm.bank_name || !refundDetailsForm.account_number || !refundDetailsForm.account_name) {
      toast.error('Please provide complete bank account details')
      return
    }
  }

  refundDetailsForm.processing = true
  try {
    await submitRefundDetails.mutateAsync({
      bookingId: refundDetailsDialog.booking.id,
      refund_method: refundDetailsForm.refund_method,
      account_number: refundDetailsForm.account_number,
      account_name: refundDetailsForm.account_name,
      bank_name: refundDetailsForm.bank_name,
      refund_notes: refundDetailsForm.refund_notes,
    })

    toast.success('Refund details submitted successfully')
    refundDetailsDialog.open = false
    await queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to submit refund details')
  } finally {
    refundDetailsForm.processing = false
  }
}

function openRefundProofDialog(booking) {
  selectedRefundProof.value = booking
  refundProofDialogOpen.value = true
}

function isImageFile(data) {
  // Check if it's a base64 image
  if (typeof data === 'string' && data.startsWith('data:image/')) {
    return true
  }
  // Fallback for file extensions (legacy)
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(data)
}

function hasApprovedPayments(booking) {
  if (!booking || !booking.payments) return false
  return booking.payments.some(payment => payment.status === 'approved')
}

function hasRejectedPayments(booking) {
  if (!booking || !booking.payments) return false
  return booking.payments.some(payment => payment.status === 'rejected')
}

function hasRefundEligiblePayments(booking) {
  return hasApprovedPayments(booking) || hasRejectedPayments(booking)
}

function bookingNeedsAttention(booking) {
  if (!booking || booking.status === 'cancelled') return false
  if (shouldShowDepositButton(booking)) return true
  return shouldShowRentalButton(booking)
}

function getPaymentTimeline(booking) {
  if (!booking) return []

  const steps = []
  const depositRequired = requiresDeposit(booking)
  const latestDeposit = getLatestPaymentOfType(booking, 'deposit')
  const latestRental = getLatestPaymentOfType(booking, 'rental')

  if (depositRequired) {
    const depositStatus = latestDeposit?.status ?? 'not_submitted'
    steps.push({
      key: 'deposit',
      icon: ShieldCheck,
      label: 'Security Deposit',
      status: depositStatus,
      statusLabel: formatPaymentStatusLabel(depositStatus, 'deposit'),
      circleClass: getPaymentCircleClass(depositStatus),
    })
  }

  let rentalStatus = latestRental?.status ?? 'not_submitted'
  if (depositRequired && (!latestDeposit || latestDeposit.status === 'rejected')) {
    rentalStatus = 'blocked'
  }

  steps.push({
    key: 'rental',
    icon: CreditCard,
    label: 'Rental Payment',
    status: rentalStatus,
    statusLabel: formatPaymentStatusLabel(rentalStatus, 'rental'),
    circleClass: getPaymentCircleClass(rentalStatus),
  })

  return steps
}

function formatPaymentStatusLabel(status, type) {
  switch (status) {
    case 'approved':
      return 'Approved'
    case 'pending':
      return 'Pending review'
    case 'rejected':
      return 'Rejected'
    case 'blocked':
      return type === 'rental' ? 'Waiting on deposit' : 'Unavailable'
    case 'not_submitted':
      return 'Not submitted'
    default:
      return status
  }
}

function getPaymentCircleClass(status) {
  switch (status) {
    case 'approved':
      return 'border-green-500 bg-green-50 text-green-600'
    case 'pending':
      return 'border-yellow-400 bg-yellow-50 text-yellow-700'
    case 'rejected':
      return 'border-red-400 bg-red-50 text-red-600'
    case 'blocked':
      return 'border-dashed border-border bg-transparent text-muted-foreground opacity-60'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}

function getPaymentButtonMeta(booking) {
  const fallback = {
    label: 'View Payments',
    variant: 'outline',
    icon: Eye,
  }

  if (!booking) {
    return fallback
  }

  const depositRequired = requiresDeposit(booking)
  const latestDeposit = getLatestPaymentOfType(booking, 'deposit')
  const latestRental = getLatestPaymentOfType(booking, 'rental')

  const depositStatus = latestDeposit?.status ?? (depositRequired ? 'not_submitted' : 'not_required')
  const rentalStatus = latestRental?.status ?? 'not_submitted'
  const canSubmitRental = shouldShowRentalButton(booking)

  if (depositRequired && depositStatus === 'not_submitted') {
    return {
      label: 'Submit Deposit',
      variant: 'default',
      icon: ShieldCheck,
    }
  }

  if (depositRequired && depositStatus === 'rejected') {
    return {
      label: 'Resubmit Deposit',
      variant: 'destructive',
      icon: ShieldCheck,
    }
  }

  if (canSubmitRental) {
    return {
      label: rentalStatus === 'rejected' ? 'Resubmit Rental Payment' : 'Submit Rental Payment',
      variant: 'default',
      icon: CreditCard,
    }
  }

  if (rentalStatus === 'pending') {
    return {
      label: 'Track Rental Review',
      variant: 'outline',
      icon: Eye,
    }
  }

  if (rentalStatus === 'approved') {
    return {
      label: 'View Approved Payments',
      variant: 'outline',
      icon: Eye,
    }
  }

  if (depositStatus === 'pending') {
    return {
      label: 'Review Deposit Status',
      variant: 'outline',
      icon: Eye,
    }
  }

  return fallback
}

function viewPayments(bookingId) {
  router.push({ name: 'booking-security-deposit', params: { id: bookingId } })
}

// Cancellation Dialog
const cancelDialog = ref({
  open: false,
  booking: null
})

const cancelForm = reactive({
  reason: '',
  processing: false,
  // Refund account information
  refund_method: '',
  account_number: '',
  account_name: '',
  bank_name: '',
  refund_notes: ''
})

function openCancelDialog(booking) {
  cancelDialog.value.booking = booking
  cancelDialog.value.open = true
  cancelForm.reason = ''
  cancelForm.processing = false
  // Reset refund fields
  cancelForm.refund_method = ''
  cancelForm.account_number = ''
  cancelForm.account_name = ''
  cancelForm.bank_name = ''
  cancelForm.refund_notes = ''
}

async function handleCancelBooking() {
  if (!cancelForm.reason.trim()) {
    toast.error('Please provide a cancellation reason')
    return
  }

  // Validate refund information if has approved payments
  if (hasApprovedPayments(cancelDialog.value.booking)) {
    if (!cancelForm.refund_method) {
      toast.error('Please select a refund method')
      return
    }

    if (cancelForm.refund_method === 'gcash') {
      if (!cancelForm.account_number || !cancelForm.account_name) {
        toast.error('Please provide your GCash number and account holder name')
        return
      }
    } else if (cancelForm.refund_method === 'bank_transfer') {
      if (!cancelForm.bank_name || !cancelForm.account_number || !cancelForm.account_name) {
        toast.error('Please provide complete bank account details')
        return
      }
    }
  }

  cancelForm.processing = true
  try {
    const payload = {
      bookingId: cancelDialog.value.booking.id,
      cancellation_reason: cancelForm.reason
    }

    // Include refund account information if has approved payments
    if (hasApprovedPayments(cancelDialog.value.booking)) {
      payload.refund_method = cancelForm.refund_method
      payload.account_number = cancelForm.account_number
      payload.account_name = cancelForm.account_name
      payload.bank_name = cancelForm.bank_name
      payload.refund_notes = cancelForm.refund_notes
    }

    await cancelBooking.mutateAsync(payload)
    toast.success('Booking canceled successfully')
    cancelDialog.value.open = false
    
    // Invalidate the my-bookings query to refresh the data
    await queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
    
  } catch (e) {
    toast.error(e.response?.data?.message || 'Cancellation failed')
  } finally {
    cancelForm.processing = false
  }
}

// ---------------------- Guided Tour (Driver.js) ----------------------
function startTour() {
  const steps = buildTourSteps()
  if (!steps.length) {
    console.warn('[MyBookings Tour] No steps available.')
    return
  }
  const d = createDriver({
    showProgress: true,
    allowClose: true,
    popoverClass: 'text-sm',
    nextBtnText: 'Next',
    prevBtnText: 'Previous',
    doneBtnText: 'Finish',
    closeBtnText: 'Skip',
    steps
  })
  console.debug('[MyBookings Tour] Starting; total steps:', steps.length, steps)
  d.drive()
  localStorage.setItem('myBookingsTourSeen', '1')
}

function buildTourSteps() {
  const steps = []

  const header = document.querySelector('#my-bookings-header')
  if (header) {
    steps.push({
      element: header,
      popover: {
        title: 'My Bookings',
        description: 'Overview of all your vehicle reservations.'
      }
    })
  }

  const guideBtn = document.querySelector('[data-tour="guide-btn"]')
  if (guideBtn) {
    steps.push({
      element: guideBtn,
      popover: {
        title: 'Interactive Guide',
        description: 'Click here anytime to replay this guided tour.'
      }
    })
  }

  const controls = document.querySelector('[data-tour="controls-section"]')
  if (controls) {
    steps.push({
      element: controls,
      popover: {
        title: 'Sort & Filter',
        description: 'Adjust sorting and filter bookings by their status.'
      }
    })
  }

  const attentionBanner = document.querySelector('[data-tour="attention-banner"]')
  if (attentionBanner) {
    steps.push({
      element: attentionBanner,
      popover: {
        title: 'Needs Action',
        description: 'Shows bookings requiring deposit or rental payment.'
      }
    })
  }

  const refundBanner = document.querySelector('[data-tour="refund-banner"]')
  if (refundBanner) {
    steps.push({
      element: refundBanner,
      popover: {
        title: 'Refund Details',
        description: 'Provide account details so pending refunds can be processed.'
      }
    })
  }

  const firstCard = document.querySelector('[data-tour="booking-card"]')
  if (firstCard) {
    steps.push({
      element: firstCard,
      popover: {
        title: 'Booking Card',
        description: 'Each card displays vehicle, period, pricing, status & actions.'
      }
    })
  }
  else if (!bookings.value.length && header) {
    steps.push({
      element: header,
      popover: {
        title: 'No Bookings Yet',
        description: 'Create your first booking from the Vehicles page.'
      }
    })
  }

  const actions = document.querySelector('[data-tour="booking-actions"]')
  if (actions) {
    steps.push({
      element: actions,
      popover: {
        title: 'Booking Actions',
        description: 'Manage, edit, cancel, pay, or submit a return from here.'
      }
    })
  }

  return steps
}

onMounted(() => {
  // Auto-start tour only once
  if (!localStorage.getItem('myBookingsTourSeen')) {
    setTimeout(() => startTour(), 700)
  }
})
</script>

<style scoped>
/* Removed obsolete cancelled-card styles after refactor */

/* Card minimize/maximize transitions */
.card-content-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Smooth hover effects for minimize button */
.minimize-button {
  transition: all 0.2s ease-in-out;
}

.minimize-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.05);
}

/* Enhanced gradient animations */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.refund-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 3s infinite;
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

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .modal-content {
    background: #1f2937;
    color: #f3f4f6;
  }
  
  .modal-close {
    color: #9ca3af;
  }
}
</style>
