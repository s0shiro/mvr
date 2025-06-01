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
</script>
