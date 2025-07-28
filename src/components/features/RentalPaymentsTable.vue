<template>
  <div class="bg-card text-card-foreground rounded-xl shadow-md">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">Rental Payment Transactions</h2>
    </div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading payments..." />
    </div>
    <div v-else>
      <div v-if="payments.length === 0" class="text-center text-muted-foreground py-8">
        No payment transactions yet.
      </div>
      <div v-else class="overflow-x-auto rounded-lg border bg-card text-card-foreground">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-100 dark:bg-gray-900">
            <tr>
              <th class="p-3 text-left font-semibold">Date</th>
              <th class="p-3 text-left font-semibold">Booking ID</th>
              <th class="p-3 text-left font-semibold">Customer</th>
              <th class="p-3 text-left font-semibold">Payment Method</th>
              <th class="p-3 text-left font-semibold">Type</th>
              <th class="p-3 text-left font-semibold">Amount</th>
              <th class="p-3 text-left font-semibold">Status</th>
              <th class="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id" class="border-t">
              <td class="p-3">{{ formatDate(payment.created_at) }}</td>
              <td class="p-3">#{{ payment.booking_id }}</td>
              <td class="p-3">{{ payment.booking?.user?.name || 'N/A' }}</td>
              <td class="p-3">{{ getPaymentMethodLabel(payment.method) }}</td>
              <td class="p-3">
                <span :class="getTypeClass(payment.type)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ payment.type }}
                </span>
              </td>
              <td class="p-3 font-semibold">₱{{ getPaymentAmount(payment) }}</td>
              <td class="p-3">
                <span :class="getStatusClass(payment.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ payment.status }}
                </span>
              </td>
              <td class="p-3">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon">
                      <Ellipsis class="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="min-w-[120px]">
                    <DropdownMenuItem @click="viewPaymentDetails(payment)">View Details</DropdownMenuItem>
                    <DropdownMenuItem @click="viewBooking(payment.booking_id)">View Booking</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Pagination Controls -->
        <div class="flex justify-between items-center py-4 px-3">
          <div class="text-sm text-muted-foreground">
            Showing
            <span class="font-semibold">{{ (currentPage - 1) * perPage + 1 }}</span>
            to
            <span class="font-semibold">{{ Math.min(currentPage * perPage, total) }}</span>
            of
            <span class="font-semibold">{{ total }}</span>
            payments
          </div>
          <div class="flex gap-2">
            <Button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
              Previous
            </Button>
            <span class="px-2">Page {{ currentPage }} of {{ lastPage }}</span>
            <Button :disabled="currentPage === lastPage" @click="goToPage(currentPage + 1)">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Payment Details Modal -->
    <PaymentDetailsModal
      v-if="showDetailsModal && selectedPayment"
      :open="showDetailsModal"
      :payment="selectedPayment"
      @close="closeDetailsModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { fetchRentalPayments } from '@/services/rentalPaymentService'
import Loading from '@/components/features/Loading.vue'
import PaymentDetailsModal from '@/components/features/PaymentDetailsModal.vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Ellipsis } from 'lucide-vue-next'

const router = useRouter()
const queryClient = useQueryClient()

const currentPage = ref(1)
const perPage = ref(10)
const showDetailsModal = ref(false)
const selectedPayment = ref(null)

const { data, isLoading, refetch } = useQuery({
  queryKey: computed(() => ['rental-payments', currentPage.value, perPage.value]),
  queryFn: () => fetchRentalPayments(currentPage.value, perPage.value),
  keepPreviousData: true,
})

const payments = computed(() => data.value?.data || [])
const total = computed(() => data.value?.total || 0)
const lastPage = computed(() => data.value?.last_page || 1)

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getPaymentMethodLabel(method) {
  // This should match the payment methods from your system
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
  // Get amount from booking based on payment type
  if (payment.type === 'deposit') {
    return payment.booking?.vehicle?.deposit || 0
  } else {
    return payment.booking?.total_price || 0
  }
}

function viewPaymentDetails(payment) {
  selectedPayment.value = payment
  showDetailsModal.value = true
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedPayment.value = null
}

function viewBooking(bookingId) {
  router.push({ name: 'admin-booking-details', params: { id: bookingId } })
}

function goToPage(page) {
  if (page >= 1 && page <= lastPage.value) {
    currentPage.value = page
  }
}
</script>
