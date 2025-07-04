<template>
  <section class="">
    <header class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h2 class="text-3xl font-bold flex items-center gap-2 tracking-tight">
          <span class="inline-block w-3 h-3 rounded-full bg-green-500"></span>
          Completed Booking
        </h2>
        <div class="text-sm text-muted-foreground mt-1">
          <span class="font-medium">Executed at:</span> {{ details.executed_at }}
        </div>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-2xl font-bold text-primary"
          >₱{{ Number(details.rental_amount).toLocaleString() }}</span
        >
        <span class="text-xs text-muted-foreground font-medium tracking-wide">{{
          details.rental_amount_words
        }}</span>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      <Card>
        <CardContent class="p-4">
          <dl class="space-y-2">
            <div>
              <dt
                class="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1"
              >
                <User class="w-4 h-4" />Customer
              </dt>
              <dd class="text-base font-medium">{{ details.customer_name }}</dd>
            </div>
            <div>
              <dt
                class="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1"
              >
                <MapPin class="w-4 h-4" />Address
              </dt>
              <dd class="text-base">{{ details.customer_address }}</dd>
            </div>
            <div>
              <dt
                class="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1"
              >
                <CalendarDays class="w-4 h-4" />Period
              </dt>
              <dd class="text-base">{{ details.period }}</dd>
            </div>
            <div>
              <dt
                class="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1"
              >
                <Clock class="w-4 h-4" />Release Date
              </dt>
              <dd class="text-base">{{ details.release_date }}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-4">
          <dl class="space-y-2">
            <div>
              <dt
                class="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1"
              >
                <Car class="w-4 h-4" />Vehicle
              </dt>
              <dd class="text-base font-medium">
                {{ details.vehicle.name }} ({{ details.vehicle.brand }}, {{ details.vehicle.year }},
                {{ details.vehicle.model }})
              </dd>
            </div>
            <div>
              <dt
                class="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1"
              >
                <ShieldCheck class="w-4 h-4" />Security Deposit
              </dt>
              <dd class="text-base">
                ₱{{ Number(details.security_deposit).toLocaleString() }}
                <span class="text-xs text-muted-foreground"
                  >({{ details.security_deposit_words }})</span
                >
              </dd>
            </div>
            <div>
              <dt
                class="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1"
              >
                <Receipt class="w-4 h-4" />Daily Rate
              </dt>
              <dd class="text-base">
                ₱{{ Number(details.daily_rate).toLocaleString() }}
                <span class="text-xs text-muted-foreground">({{ details.daily_rate_words }})</span>
              </dd>
            </div>
            <div>
              <dt
                class="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1"
              >
                <Clock class="w-4 h-4" />Hourly Rate
              </dt>
              <dd class="text-base">₱{{ details.hourly_rate }}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>

    <!-- Payments Timeline -->
    <section class="mb-10">
      <h3 class="font-semibold text-lg mb-4 tracking-tight flex items-center gap-2">
        <CreditCard class="w-5 h-5" /> Payments
      </h3>
      <ol class="relative border-l border-border ml-4">
        <li v-for="payment in details.payments" :key="payment.id" class="mb-10 ml-6">
          <span
            class="absolute -left-3 flex items-center justify-center w-6 h-6 bg-card border-2 border-primary rounded-full"
          >
            <ShieldCheck v-if="payment.type === 'deposit'" class="w-4 h-4 text-primary" />
            <Receipt v-else class="w-4 h-4 text-primary" />
          </span>
          <Card class="bg-card dark:bg-zinc-900/60 shadow-sm">
            <CardContent class="p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold capitalize text-base">{{ payment.type }}</span>
                <Badge v-if="payment.status === 'approved'" variant="success">Approved</Badge>
                <Badge v-else-if="payment.status === 'pending'" variant="warning">Pending</Badge>
                <Badge v-else variant="destructive">{{ payment.status }}</Badge>
              </div>
              <div class="text-xs text-muted-foreground">
                Method: <span class="font-medium">{{ payment.method }}</span>
              </div>
              <div class="text-xs text-muted-foreground">
                Reference #: <span class="font-mono">{{ payment.reference_number }}</span>
              </div>
              <div class="text-xs text-muted-foreground">
                Created: {{ formatDate(payment.created_at) }}
              </div>
              <div class="text-xs text-muted-foreground">
                Approved: {{ payment.approved_at || '—' }}
              </div>
              <div v-if="payment.proof_image" class="mt-2">
                <img
                  :src="payment.proof_image"
                  alt="Payment Proof"
                  class="w-36 h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  @click="openPaymentProofDialog(payment.proof_image, payment.created_at)"
                />
              </div>
            </CardContent>
          </Card>
        </li>
      </ol>
    </section>

    <!-- Vehicle Release -->
    <section v-if="details.vehicle_release" class="mb-10">
      <h3 class="font-semibold text-lg mb-4 tracking-tight flex items-center gap-2">
        <Truck class="w-5 h-5" /> Vehicle Release
      </h3>
      <Card>
        <CardContent class="p-4">
          <dl class="space-y-2">
            <div>
              <dt class="text-xs font-semibold text-muted-foreground uppercase">Released At</dt>
              <dd class="text-base">{{ details.vehicle_release.released_at }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold text-muted-foreground uppercase">Odometer</dt>
              <dd class="text-base">{{ details.vehicle_release.odometer }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold text-muted-foreground uppercase">Fuel Level</dt>
              <dd class="text-base">{{ details.vehicle_release.fuel_level }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold text-muted-foreground uppercase">Condition Notes</dt>
              <dd class="text-base">{{ details.vehicle_release.condition_notes }}</dd>
            </div>
            <div v-if="details.vehicle_release.images && details.vehicle_release.images.length">
              <dt class="text-xs font-semibold text-muted-foreground uppercase">Images</dt>
              <dd class="flex gap-2 mt-1 flex-wrap">
                <img
                  v-for="(img, idx) in details.vehicle_release.images"
                  :key="idx"
                  :src="img"
                  class="w-24 h-16 object-cover rounded border"
                />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </section>

    <!-- Vehicle Return -->
    <section v-if="details.vehicle_return" class="mb-10">
      <h3 class="font-semibold text-lg mb-4 tracking-tight flex items-center gap-2">
        <RotateCcw class="w-5 h-5" /> Vehicle Return
      </h3>
      <Card>
        <CardContent class="p-4">
          <dl class="space-y-2">
            <div>
              <dt class="text-xs font-semibold text-muted-foreground uppercase">Returned At</dt>
              <dd class="text-base">{{ details.vehicle_return.returned_at }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold text-muted-foreground uppercase">Odometer</dt>
              <dd class="text-base">{{ details.vehicle_return.odometer }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold text-muted-foreground uppercase">Fuel Level</dt>
              <dd class="text-base">{{ details.vehicle_return.fuel_level }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold text-muted-foreground uppercase">Condition Notes</dt>
              <dd class="text-base">{{ details.vehicle_return.condition_notes }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold text-muted-foreground uppercase">Late Fee</dt>
              <dd class="text-base">
                ₱{{ Number(details.vehicle_return.late_fee).toLocaleString() }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-semibold text-muted-foreground uppercase">Damage Fee</dt>
              <dd class="text-base">
                ₱{{ Number(details.vehicle_return.damage_fee).toLocaleString() }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-semibold text-muted-foreground uppercase">Cleaning Fee</dt>
              <dd class="text-base">
                ₱{{ Number(details.vehicle_return.cleaning_fee).toLocaleString() }}
              </dd>
            </div>
            <div v-if="details.vehicle_return.images && details.vehicle_return.images.length">
              <dt class="text-xs font-semibold text-muted-foreground uppercase">Images</dt>
              <dd class="flex gap-2 mt-1 flex-wrap">
                <img
                  v-for="(img, idx) in details.vehicle_return.images"
                  :key="idx"
                  :src="img"
                  class="w-24 h-16 object-cover rounded border"
                />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </section>

    <!-- Payment Proof Dialog -->
    <PaymentProofDialog
      v-model:open="paymentProofDialogOpen"
      :image-url="selectedPaymentProof.imageUrl"
      :payment-date="selectedPaymentProof.paymentDate"
    />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-vue-next'

const paymentProofDialogOpen = ref(false)
const selectedPaymentProof = ref({
  imageUrl: '',
  paymentDate: ''
})

function openPaymentProofDialog(imageUrl, paymentDate) {
  selectedPaymentProof.value = {
    imageUrl,
    paymentDate
  }
  paymentProofDialogOpen.value = true
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
