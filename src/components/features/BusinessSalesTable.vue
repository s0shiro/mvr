<template>
  <div class="bg-card text-card-foreground rounded-xl shadow-md">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">Sales & Notes</h2>
      <Button @click="openAddModal">Add Sale/Note</Button>
    </div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading sales..." />
    </div>
    <div v-else>
      <div v-if="sales.length === 0" class="text-center text-muted-foreground py-8">
        No sales or notes yet.
      </div>
      <div v-else class="overflow-x-auto rounded-lg border bg-card text-card-foreground">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-100 dark:bg-gray-900">
            <tr>
              <th class="p-3 text-left font-semibold">Date</th>
              <th class="p-3 text-left font-semibold">Amount</th>
              <th class="p-3 text-left font-semibold">Type</th>
              <th class="p-3 text-left font-semibold">Note</th>
              <th class="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in sales" :key="sale.id" class="border-t">
              <td class="p-3">{{ sale.date || '-' }}</td>
              <td class="p-3">{{ sale.amount !== null ? sale.amount : '-' }}</td>
              <td class="p-3">{{ sale.type }}</td>
              <td class="p-3">{{ sale.note }}</td>
              <td class="p-3">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon">
                      <Ellipsis class="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="min-w-[120px]">
                    <DropdownMenuItem @click="openEditModal(sale)">Edit</DropdownMenuItem>
                    <DropdownMenuItem @click="deleteSaleHandler(sale.id)">Delete</DropdownMenuItem>
                    <DropdownMenuItem @click="openDetailsModal(sale)"
                      >View Details</DropdownMenuItem
                    >
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Pagination Controls -->
        <div class="flex justify-between items-center py-4">
          <div class="text-sm text-muted-foreground">
            Showing
            <span class="font-semibold">{{ (currentPage - 1) * perPage + 1 }}</span>
            to
            <span class="font-semibold">{{ Math.min(currentPage * perPage, total) }}</span>
            of
            <span class="font-semibold">{{ total }}</span>
            sales
          </div>
          <div class="flex gap-2">
            <Button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)"
              >Previous</Button
            >
            <span class="px-2">Page {{ currentPage }} of {{ lastPage }}</span>
            <Button :disabled="currentPage === lastPage" @click="goToPage(currentPage + 1)"
              >Next</Button
            >
          </div>
        </div>
      </div>
    </div>
    <BusinessSaleModal
      v-if="showModal"
      :business-id="businessId"
      :business-type="businessType"
      :sale="selectedSale"
      :is-edit="isEdit"
      @close="closeModal"
      @saved="onSaved"
    />
    <SaleDetailsModal
      v-if="showDetailsModal && selectedDetailsSale"
      :open="showDetailsModal"
      :sale="selectedDetailsSale"
      :business-type="businessType"
      @close="closeDetailsModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchBusinessSales, deleteBusinessSale } from '@/services/businessSalesService'
import BusinessSaleModal from '@/components/features/BusinessSaleModal.vue'
import SaleDetailsModal from '@/components/features/SaleDetailsModal.vue'
import Loading from '@/components/features/Loading.vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Ellipsis } from 'lucide-vue-next'

const props = defineProps({
  businessId: { type: [String, Number], required: true },
  businessType: { type: String, default: 'resort' },
})

const showModal = ref(false)
const isEdit = ref(false)
const selectedSale = ref(null)
const showDetailsModal = ref(false)
const selectedDetailsSale = ref(null)
const queryClient = useQueryClient()

const currentPage = ref(1)
const perPage = ref(5)

const { data, isLoading, refetch, error } = useQuery({
  queryKey: computed(() => ['business-sales', props.businessId, currentPage.value, perPage.value]),
  queryFn: () => fetchBusinessSales(props.businessId, currentPage.value, perPage.value),
  keepPreviousData: true,
})

const sales = computed(() => (data.value && data.value.data ? data.value.data : []))
const total = computed(() => (data.value && data.value.total ? data.value.total : 0))
const lastPage = computed(() => (data.value && data.value.last_page ? data.value.last_page : 1))

const mutationDelete = useMutation({
  mutationFn: ({ id }) => deleteBusinessSale({ businessId: props.businessId, id }),
  onSuccess: () => queryClient.invalidateQueries(['business-sales', props.businessId]),
})

function openAddModal() {
  selectedSale.value = null
  isEdit.value = false
  showModal.value = false
  setTimeout(() => {
    showModal.value = true
  }, 10)
}
function openEditModal(sale) {
  selectedSale.value = { ...sale }
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
  queryClient.invalidateQueries(['business-sales', props.businessId])
}

function deleteSaleHandler(id) {
  if (confirm('Are you sure you want to delete this entry?')) {
    mutationDelete.mutate({ id })
  }
}
function openDetailsModal(sale) {
  selectedDetailsSale.value = sale
  showDetailsModal.value = true
}
function closeDetailsModal() {
  showDetailsModal.value = false
  selectedDetailsSale.value = null
}

function goToPage(page) {
  if (page >= 1 && page <= lastPage.value) {
    currentPage.value = page
  }
}
</script>
