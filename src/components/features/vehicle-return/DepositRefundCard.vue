<template>
  <Card class="mt-4" v-if="vehicleReturn">
    <CardHeader>
      <CardTitle class="text-lg flex items-center gap-2">
        <CreditCard class="w-5 h-5" />
        Security Deposit Refund
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <span class="text-sm font-semibold text-muted-foreground">Original Deposit:</span>
          <div class="text-lg font-bold text-foreground">₱{{ originalDeposit }}</div>
        </div>
        <div>
          <span class="text-sm font-semibold text-muted-foreground">Total Fees:</span>
          <div class="text-lg font-bold text-destructive">₱{{ totalFees }}</div>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <span class="font-semibold">Status:</span>
        <Badge :variant="getDepositStatusVariant(vehicleReturn.deposit_status)">
          {{ getDepositStatusLabel(vehicleReturn.deposit_status) }}
        </Badge>
      </div>
      
      <div v-if="vehicleReturn.deposit_status === 'refunded'" class="space-y-3">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-sm font-semibold text-muted-foreground">Refund Amount:</span>
            <div class="text-xl font-bold text-primary">₱{{ vehicleReturn.deposit_refund_amount || 0 }}</div>
          </div>
          <div v-if="vehicleReturn.refund_method">
            <span class="text-sm font-semibold text-muted-foreground">Method:</span>
            <div class="font-medium text-foreground">{{ formatRefundMethod(vehicleReturn.refund_method) }}</div>
          </div>
        </div>
        
        <div v-if="vehicleReturn.deposit_refunded_at">
          <span class="text-sm font-semibold text-muted-foreground">Refunded At:</span>
          <div class="font-medium text-foreground">{{ formatDate(vehicleReturn.deposit_refunded_at) }}</div>
        </div>
        
        <div v-if="vehicleReturn.deposit_refund_notes">
          <span class="text-sm font-semibold text-muted-foreground">Notes:</span>
          <div class="text-sm bg-muted p-3 rounded border text-foreground">{{ vehicleReturn.deposit_refund_notes }}</div>
        </div>
        
        <div v-if="vehicleReturn.deposit_refund_proof?.length">
          <span class="text-sm font-semibold text-muted-foreground">Refund Proof:</span>
          <div class="grid grid-cols-3 gap-2 mt-2">
            <img
              v-for="(proof, i) in vehicleReturn.deposit_refund_proof"
              :key="i"
              :src="proof"
              class="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80"
              @click="$emit('openImageModal', proof)"
            />
          </div>
        </div>
      </div>
      
      <div v-else-if="vehicleReturn.deposit_status === 'withheld'" class="space-y-3">
        <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div class="font-semibold text-destructive mb-2">Deposit Withheld</div>
          <div v-if="vehicleReturn.deposit_refund_notes" class="text-sm text-destructive/80">
            {{ vehicleReturn.deposit_refund_notes }}
          </div>
        </div>
      </div>
      
      <div v-else class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div class="font-semibold text-yellow-600 dark:text-yellow-400">Refund Pending</div>
        <div class="text-sm text-yellow-600/80 dark:text-yellow-400/80">Security deposit refund is still being processed.</div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard } from 'lucide-vue-next'

const props = defineProps({
  vehicleReturn: Object,
  originalDeposit: {
    type: Number,
    default: 0
  }
})

defineEmits(['openImageModal'])

const totalFees = computed(() => {
  if (!props.vehicleReturn) return 0
  return (props.vehicleReturn.late_fee || 0) + 
         (props.vehicleReturn.damage_fee || 0) + 
         (props.vehicleReturn.cleaning_fee || 0)
})

function getDepositStatusVariant(status) {
  switch (status) {
    case 'refunded':
      return 'success'
    case 'withheld':
      return 'destructive'
    case 'pending':
    default:
      return 'secondary'
  }
}

function getDepositStatusLabel(status) {
  switch (status) {
    case 'refunded':
      return 'Refunded'
    case 'withheld':
      return 'Withheld'
    case 'pending':
    default:
      return 'Pending'
  }
}

function formatRefundMethod(method) {
  switch (method) {
    case 'cash':
      return 'Cash'
    case 'bank_transfer':
      return 'Bank Transfer'
    case 'gcash':
      return 'GCash'
    default:
      return method || 'Other'
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>
