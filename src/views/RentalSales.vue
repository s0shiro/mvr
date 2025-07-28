<template>
  <div class="mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Rental Sales & Revenue</h1>
      <Button variant="secondary" @click="goBack">Back</Button>
    </div>
    
    <!-- Revenue Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg shadow-lg p-6 border-2 border-green-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-700 font-medium">Total Revenue</p>
            <p class="text-2xl font-bold text-green-800">₱{{ totalRevenue.toLocaleString() }}</p>
          </div>
          <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg p-6 border-2 border-blue-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-700 font-medium">Approved Payments</p>
            <p class="text-2xl font-bold text-blue-800">{{ approvedCount }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-orange-50 to-amber-100 rounded-lg shadow-lg p-6 border-2 border-orange-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-700 font-medium">Pending Payments</p>
            <p class="text-2xl font-bold text-orange-800">{{ pendingCount }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Rental Payments Table -->
    <RentalPaymentsTable />
    
    <!-- Quick Actions -->
    <div class="mt-8 flex gap-4">
      <Button @click="handleViewReports" class="bg-blue-600 hover:bg-blue-700">
        View Detailed Reports
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { fetchRentalRevenue } from '@/services/rentalPaymentService'
import { Button } from '@/components/ui/button'
import RentalPaymentsTable from '@/components/features/RentalPaymentsTable.vue'

const router = useRouter()

const { data: revenueData } = useQuery({
  queryKey: ['rental-revenue'],
  queryFn: fetchRentalRevenue,
})

const totalRevenue = computed(() => revenueData.value?.total_revenue || 0)
const approvedCount = computed(() => revenueData.value?.approved_count || 0)
const pendingCount = computed(() => revenueData.value?.pending_count || 0)

function goBack() {
  router.back()
}

function handleViewReports() {
  router.push({ name: 'rental-sales-report' })
}
</script>
