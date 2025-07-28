<template>
  <div class="flex flex-col gap-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Businesses & Services</h1>
      <Button @click="openAddModal">Add Business/Service</Button>
    </div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading businesses..." />
    </div>
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Rental System Card (Main Business) -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg p-6 border-2 border-blue-300">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-blue-800">Rental System</h3>
            </div>
            <span class="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-medium">Main Business</span>
          </div>
          <p class="text-gray-700 mb-4">Vehicle rental transactions</p>
          <div class="flex gap-2 flex-wrap">
            <Button 
              variant="default" 
              size="sm"
              class="bg-blue-600 hover:bg-blue-700"
              @click="handleViewRentalTransactions"
            >
              View Transactions
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              @click="handleViewRentalReports"
            >
              Reports
            </Button>
          </div>
        </div>
        
        <!-- Other Businesses -->
        <BusinessCard
          v-for="business in businesses"
          :key="business.id"
          :business="business"
          @edit="openEditModal"
          @delete="deleteBusinessHandler"
          @view="handleViewBusiness"
        />
      </div>
    </div>
    <BusinessModal
      v-if="showModal"
      :business="selectedBusiness"
      :is-edit="isEdit"
      @close="closeModal"
      @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  fetchBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from '@/services/businessService'
import BusinessModal from '@/components/features/BusinessModal.vue'
import BusinessCard from '@/components/features/BusinessCard.vue'
import { Button } from '@/components/ui/button'
import Loading from '@/components/features/Loading.vue'
import { useRouter } from 'vue-router'

const showModal = ref(false)
const isEdit = ref(false)
const selectedBusiness = ref(null)
const queryClient = useQueryClient()
const router = useRouter()

const { data, isLoading } = useQuery({
  queryKey: ['businesses'],
  queryFn: fetchBusinesses,
})

const businesses = computed(() => data.value || [])

const mutationDelete = useMutation({
  mutationFn: deleteBusiness,
  onSuccess: () => queryClient.invalidateQueries(['businesses']),
})

function openAddModal() {
  selectedBusiness.value = null
  isEdit.value = false
  showModal.value = false
  // Ensure modal is re-mounted for clean state
  setTimeout(() => {
    showModal.value = true
  }, 10)
}
function openEditModal(business) {
  selectedBusiness.value = { ...business }
  isEdit.value = true
  showModal.value = false
  setTimeout(() => {
    showModal.value = true
  }, 10)
}
function closeModal() {
  showModal.value = false
}
function onSaved() {
  showModal.value = false
  queryClient.invalidateQueries(['businesses'])
}
function deleteBusinessHandler(id) {
  if (confirm('Are you sure you want to delete this business?')) {
    mutationDelete.mutate(id)
  }
}
function handleViewBusiness(business) {
  router.push({ name: 'business-view', params: { id: business.id } })
}

function handleViewRentalTransactions() {
  router.push({ name: 'rental-transactions' })
}

function handleViewRentalReports() {
  router.push({ name: 'rental-sales-report' })
}
</script>
