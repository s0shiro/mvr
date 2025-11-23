<template>
  <Card :class="cardClasses" :data-tour="idx === 0 ? 'booking-card' : null">
    <CardHeader class="flex flex-row items-center justify-between gap-4">
      <div :class="booking.status === 'cancelled' ? 'line-through text-muted-foreground flex-1' : 'flex-1'">
        <CardTitle :class="['text-lg font-semibold', booking.status === 'cancelled' ? 'text-muted-foreground' : '']">
          {{ booking.vehicle?.name || 'Vehicle' }}
        </CardTitle>
        <CardDescription :class="booking.status === 'cancelled' ? 'text-muted-foreground/70' : ''">
          <span class="font-medium">{{ booking.vehicle?.brand }}</span>
          <span v-if="booking.vehicle">• {{ booking.vehicle.model }} ({{ booking.vehicle.year }})</span>
        </CardDescription>
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
            <Badge v-if="booking.payment.status === 'approved'" variant="available" class="text-xs">Paid</Badge>
            <Badge v-else-if="booking.payment.status === 'pending'" variant="maintenance" class="text-xs">Pending</Badge>
            <Badge v-else-if="booking.payment.status === 'rejected'" variant="destructive" class="text-xs">Rejected</Badge>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Badge :variant="getStatusVariant(booking.status)">{{ getBookingStatusLabel(booking.status) }}</Badge>
        <Button variant="ghost" size="sm" @click="toggleCardMinimized(booking.id)" class="h-8 w-8 p-0 minimize-button">
          <ChevronDown v-if="!isCardMinimized(booking.id)" class="w-4 h-4" />
          <ChevronUp v-else class="w-4 h-4" />
        </Button>
      </div>
    </CardHeader>

    <CardContent v-if="!isCardMinimized(booking.id)" class="flex flex-col md:flex-row gap-6 items-center md:items-start card-content-transition">
      <div v-if="booking.vehicle?.primary_image_url" class="relative group">
        <img :src="booking.vehicle.primary_image_url" alt="Vehicle" :class="imageClasses" />
        <div v-if="booking.status === 'cancelled'" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl backdrop-blur-[1px]">
          <div class="bg-red-600/90 dark:bg-red-700/90 text-white px-3 py-1 rounded-lg shadow-lg border border-red-400 dark:border-red-500">
            <span class="font-bold text-sm tracking-wide">CANCELED</span>
          </div>
        </div>
      </div>

      <div :class="['flex-1 space-y-4', booking.status === 'cancelled' ? 'text-muted-foreground/70' : '']">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <CalendarDays class="w-4 h-4 text-muted-foreground" />
              <span class="font-semibold text-sm text-muted-foreground">Rental Period:</span>
              <span class="font-medium">{{ formatDate(booking.start_date) }} - {{ formatDate(booking.end_date) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Receipt class="w-4 h-4 text-muted-foreground" />
              <span class="font-semibold text-sm text-muted-foreground">Total Price:</span>
              <span class="font-medium text-primary">₱{{ Number(booking.total_price).toLocaleString() }}</span>
              <template v-if="requiresDeposit(booking)">
                <ShieldCheck class="w-4 h-4 text-muted-foreground" />
                <span class="font-semibold text-sm text-muted-foreground">Security Deposit:</span>
                <span class="font-medium text-primary">₱{{ Number(booking.vehicle.deposit).toLocaleString() }}</span>
              </template>
            </div>
            <div v-if="booking.pickup_type === 'delivery'" class="flex items-center gap-2">
              <Truck class="w-4 h-4 text-muted-foreground" />
              <span class="font-semibold text-sm text-muted-foreground">Delivery:</span>
              <span class="font-medium">{{ booking.delivery_location }}</span>
              <span class="text-sm text-muted-foreground">(₱{{ booking.delivery_fee }})</span>
            </div>
            <div v-if="booking.pickup_type === 'delivery'" class="text-sm text-muted-foreground mt-1 ml-6">
              <span class="font-medium">Delivery Details:</span>
              <p class="mt-1">{{ booking.delivery_details }}</p>
            </div>
            <div v-if="booking.payment" class="flex items-center gap-2">
              <CreditCard class="w-4 h-4 text-muted-foreground" />
              <span class="font-semibold text-sm text-muted-foreground">Payment Method:</span>
              <span class="font-medium">{{ booking.payment.method }}</span>
              <Badge v-if="booking.payment.status === 'approved'" variant="available" class="ml-2">Paid</Badge>
              <Badge v-else-if="booking.payment.status === 'pending'" variant="maintenance" class="ml-2">Pending</Badge>
              <Badge v-else-if="booking.payment.status === 'rejected'" variant="destructive" class="ml-2">Rejected</Badge>
            </div>
          </div>

          <div v-if="booking.notes" class="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <span class="font-semibold block mb-1 flex items-center gap-2"><AlertCircle class="w-4 h-4" /> Notes</span>
            {{ booking.notes }}
          </div>

          <div v-if="booking.status === 'cancelled'" class="space-y-3 md:col-span-2">
            <div class="bg-gradient-to-r from-red-100 to-red-50 dark:from-red-950/60 dark:to-red-900/40 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-xl shadow-sm">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-10 h-10 bg-red-200 dark:bg-red-800/50 rounded-full flex items-center justify-center">
                  <X class="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-red-900 dark:text-red-100 mb-1">Booking Canceled</h4>
                  <p class="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                    This booking has been canceled.
                    <span v-if="booking.cancellation_reason" class="block mt-1"><strong>Reason:</strong> {{ booking.cancellation_reason }}</span>
                    <span v-if="booking.cancelled_at" class="block mt-1 text-red-600 dark:text-red-400 text-xs">Canceled on {{ formatDate(booking.cancelled_at) }}</span>
                  </p>
                </div>
              </div>
            </div>
            <div v-if="booking.refund_status" class="rounded-xl border shadow-sm overflow-hidden" :class="getRefundStatusClasses(booking.refund_status)">
              <div class="p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" :class="getRefundStatusIconBg(booking.refund_status)">
                    <component :is="getRefundStatusIcon(booking.refund_status)" class="w-5 h-5" :class="getRefundStatusIconColor(booking.refund_status)" />
                  </div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-lg" :class="getRefundStatusTextColor(booking.refund_status)">{{ getRefundStatusText(booking.refund_status) }}</h4>
                  </div>
                </div>
                <div v-if="booking.refund_amount && booking.refund_status === 'processed'" class="mb-3 p-3 rounded-lg border bg-white/60 dark:bg-white/5 border-green-200 dark:border-green-700/50">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-green-800 dark:text-green-200">Refund Amount:</span>
                    <span class="text-xl font-bold text-green-700 dark:text-green-300">₱{{ Number(booking.refund_amount).toLocaleString() }}</span>
                  </div>
                </div>
                <div v-if="booking.refund_processed_at" class="space-y-2 text-sm">
                  <p class="opacity-75"><strong>Processed:</strong> {{ formatDate(booking.refund_processed_at) }}</p>
                  <p v-if="booking.refund_notes" class="opacity-75 italic bg-white/30 dark:bg-black/20 p-2 rounded border border-white/40 dark:border-white/10">"{{ booking.refund_notes }}"</p>
                </div>
                <div v-if="booking.refund_proof && booking.refund_status === 'processed'" class="mt-3">
                  <Button variant="outline" size="sm" class="w-full text-xs" @click="openRefundProofDialog(booking)">
                    <ImageIcon class="w-3 h-3 mr-1" /> View Refund Proof
                  </Button>
                </div>
                <div v-if="booking.refund_status === 'pending'" class="mt-3 text-xs opacity-75 bg-white/30 dark:bg-black/20 p-2 rounded border border-white/40 dark:border-white/10">
                  <p class="flex items-center gap-1"><Clock class="w-3 h-3" /> Refunds are typically processed within 3-5 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-4" data-tour="booking-actions">
          <template v-if="booking.status === 'cancelled'">
            <Button v-if="needsRefundDetails(booking)" variant="default" class="bg-amber-500 hover:bg-amber-600 text-white" @click="openRefundDetailsDialog(booking)">
              <Wallet class="w-4 h-4 mr-2" /> Request Refund
            </Button>
            <div v-else class="text-sm text-muted-foreground italic">No actions available for canceled bookings</div>
          </template>
          <template v-else-if="!['cancelled', 'completed', 'released', 'pending_return'].includes(booking.status)">
            <Button variant="destructive" @click="openCancelDialog(booking)" v-if="shouldShowCancelButton(booking)">
              <Ban class="w-4 h-4 mr-2" /> Cancel Booking
            </Button>
            <Button v-if="shouldShowEditButton(booking)" variant="outline" @click="openEditDialog(booking)">
              <Edit2 class="w-4 h-4 mr-2" /> Edit Booking
            </Button>
          </template>
          <template v-else-if="booking.status === 'released'">
            <Button v-if="!booking.vehicle_return" variant="default" @click="openReturnDialog(booking)" class="bg-blue-600 hover:bg-blue-700">
              <RotateCcw class="w-4 h-4 mr-2" /> Submit Vehicle Return
            </Button>
            <Badge v-else-if="booking.vehicle_return.status === 'customer_submitted'" variant="secondary">Return Submitted - Pending Review</Badge>
          </template>
          <template v-else-if="booking.status === 'pending_return'">
            <Badge variant="secondary">Return Submitted - Admin Review</Badge>
          </template>
          <Button v-if="booking.status === 'confirmed' || booking.status === 'active'" variant="outline" @click="openContractDialog(booking)">
            <Car class="w-4 h-4 mr-2" /> View Contract
          </Button>
        </div>

        <div v-if="booking.status !== 'cancelled'" class="mb-6">
          <div class="rounded-xl border border-dashed border-muted/60 bg-muted/30 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment progress</p>
            <div v-if="getPaymentTimeline(booking).length" class="mt-5 flex flex-col gap-6">
              <div class="flex items-center justify-between gap-4">
                <template v-for="(step, index) in getPaymentTimeline(booking)" :key="step.key">
                  <div class="flex items-center gap-4 flex-1">
                    <div class="relative group flex items-center justify-center">
                      <div :class="['flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200 shadow-sm group-hover:shadow-md group-hover:scale-105 group-hover:border-primary/70 duration-200 ease-out', step.circleClass]">
                        <component :is="step.icon" class="h-5 w-5" />
                        <span class="sr-only">{{ step.label }} ({{ step.statusLabel }})</span>
                      </div>
                      <div class="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-1">
                        <span class="text-foreground font-semibold mr-1">{{ step.label }}:</span>{{ step.statusLabel }}
                        <span class="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-border bg-card" />
                      </div>
                    </div>
                    <div v-if="index < getPaymentTimeline(booking).length - 1" class="h-px flex-1 bg-border" />
                  </div>
                </template>
              </div>
              <Button :variant="getPaymentButtonMeta(booking).variant" size="sm" class="w-full sm:w-auto" @click="viewPayments(booking.id)">
                <component :is="getPaymentButtonMeta(booking).icon" class="w-4 h-4 mr-2" />
                {{ getPaymentButtonMeta(booking).label }}
              </Button>
            </div>
            <div v-else class="mt-5 text-sm text-muted-foreground">No payment steps required for this booking.</div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Receipt, CreditCard, ShieldCheck, Truck, AlertCircle, X, Clock, Image as ImageIcon, ChevronDown, ChevronUp, Wallet, Ban, Edit2, RotateCcw, Car } from 'lucide-vue-next'

const props = defineProps({
  booking: { type: Object, required: true },
  idx: { type: Number, default: 0 },
  isCardMinimized: { type: Function, required: true },
  toggleCardMinimized: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  getStatusVariant: { type: Function, required: true },
  getBookingStatusLabel: { type: Function, required: true },
  requiresDeposit: { type: Function, required: true },
  shouldShowCancelButton: { type: Function, required: true },
  shouldShowEditButton: { type: Function, required: true },
  openEditDialog: { type: Function, required: true },
  openCancelDialog: { type: Function, required: true },
  openReturnDialog: { type: Function, required: true },
  openContractDialog: { type: Function, required: true },
  needsRefundDetails: { type: Function, required: true },
  openRefundDetailsDialog: { type: Function, required: true },
  getPaymentTimeline: { type: Function, required: true },
  getPaymentButtonMeta: { type: Function, required: true },
  viewPayments: { type: Function, required: true },
  getRefundStatusClasses: { type: Function, required: true },
  getRefundStatusIconBg: { type: Function, required: true },
  getRefundStatusIcon: { type: Function, required: true },
  getRefundStatusIconColor: { type: Function, required: true },
  getRefundStatusTextColor: { type: Function, required: true },
  getRefundStatusText: { type: Function, required: true },
  openRefundProofDialog: { type: Function, required: true }
})

const cardClasses = computed(() => [
  'border transition-all duration-300 hover:shadow-lg overflow-hidden',
  props.booking.status === 'cancelled'
    ? 'border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/20 relative'
    : 'border-border bg-card hover:shadow-md'
])

const imageClasses = computed(() => [
  'w-40 h-28 object-cover rounded-xl shadow-md border-2 transition-all duration-300',
  props.booking.status === 'cancelled'
    ? 'grayscale opacity-70 border-red-200 dark:border-red-700/50'
    : 'border-border group-hover:shadow-lg'
])
</script>
